"""Importa datos reales desde el Excel de stock de Palmo Suministro Integral."""

from __future__ import annotations

import calendar
import json
import logging
import math
import random
import re
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from config import LOGGER_NAME

logger = logging.getLogger(LOGGER_NAME)

MONTH_COLS = [
    "Junio", "Julio", "Ago.", "Sept.", "Oct.e", "Nov.",
    "Dic.", "Enero", "Feb.", "Mar.", "Abr.", "Mayo",
]


def _parse_lead_time(text: str) -> float:
    """Convierte texto de lead time a numero de dias."""
    text = text.lower().strip()

    if "mes" in text:
        match = re.findall(r"\d+", text)
        if match:
            nums = [int(n) for n in match]
            return sum(nums) / len(nums) * 30
        return 60

    if "semana" in text or "semanas" in text:
        match = re.findall(r"\d+", text)
        if match:
            nums = [int(n) for n in match]
            return sum(nums) / len(nums) * 7
        return 14

    if "día" in text or "dia" in text or "días" in text or "dias" in text:
        match = re.findall(r"\d+", text)
        if match:
            nums = [int(n) for n in match]
            return sum(nums) / len(nums)
        return 3

    if "momento" in text or "digital" in text:
        return 1

    return 7


def import_from_excel(excel_path: Path) -> dict[str, Any]:
    """Lee el Excel y devuelve productos, proveedores y ventas procesadas."""
    df = pd.read_excel(excel_path, engine="openpyxl")

    cols = list(df.columns)
    articulo_col = cols[0]
    desc_col = cols[1]
    stock_col = cols[14]
    comprometido_col = cols[15]
    solicitado_col = cols[16]
    disponible_col = cols[17]
    minimo_col = cols[18]
    marca_col = cols[19]
    familia_col = cols[20]
    cod_prov_col = cols[21]
    nombre_prov_col = cols[22]
    lead_time_col = cols[23]

    provider_map: dict[str, dict[str, Any]] = {}
    productos_rows: list[dict[str, Any]] = []
    ventas_rows: list[dict[str, Any]] = []

    end_date = date.today()
    start_date = end_date - timedelta(weeks=52)

    for _, row in df.iterrows():
        sku = str(row[articulo_col]).strip()
        if not sku or sku == "nan":
            continue

        nombre = str(row[desc_col]).strip()
        stock_actual = max(0, int(row.get(stock_col, 0) or 0))
        stock_minimo = max(0, int(row.get(minimo_col, 0) or 0))
        disponible = max(0, int(row.get(disponible_col, 0) or 0))
        marca = str(row.get(marca_col, "") or "").strip()
        familia = str(row.get(familia_col, "") or "").strip()
        lead_time_raw = str(row.get(lead_time_col, "") or "").strip()
        lead_time_dias = int(round(_parse_lead_time(lead_time_raw)))

        cod_prov = str(row.get(cod_prov_col, "") or "").strip()
        nombre_prov = str(row.get(nombre_prov_col, "") or "").strip()

        if nombre_prov and nombre_prov != "nan" and cod_prov and cod_prov != "nan":
            if cod_prov not in provider_map:
                provider_map[cod_prov] = {
                    "id": cod_prov,
                    "nombre": nombre_prov,
                    "lead_time_dias": lead_time_dias,
                    "email": f"compras@{nombre_prov.lower().replace(' ', '')}.es",
                    "pedido_minimo": 100.0,
                }
            else:
                existing_lt = provider_map[cod_prov]["lead_time_dias"]
                if lead_time_dias != existing_lt:
                    provider_map[cod_prov]["lead_time_dias"] = max(
                        lead_time_dias, existing_lt
                    )

        proveedor_id = cod_prov if cod_prov and cod_prov != "nan" else "PROV000"

        stock_usado = disponible if disponible > 0 else stock_actual

        productos_rows.append({
            "sku": sku,
            "nombre": nombre,
            "categoria": familia if familia and familia != "nan" else "General",
            "marca": marca if marca and marca != "nan" else "Generica",
            "modelo_impresora": "",
            "compatible_con": "",
            "stock_actual": stock_usado,
            "stock_minimo": stock_minimo,
            "precio_compra": 0.0,
            "precio_venta": 0.0,
            "proveedor_id": proveedor_id,
            "activo": True,
        })

        ventas_mensuales = {}
        for month_col in MONTH_COLS:
            val = row.get(month_col, 0)
            ventas_mensuales[month_col] = max(0, int(val or 0))

        total_anual = sum(ventas_mensuales.values())
        if total_anual == 0:
            continue

        for i, month_col in enumerate(MONTH_COLS):
            monthly_qty = ventas_mensuales[month_col]
            if monthly_qty == 0:
                continue

            month_offset = i - 11
            month_start = date(
                end_date.year + (0 if month_offset >= 0 else -1),
                month_offset % 12 + 1 if month_offset % 12 != 0 else 12,
                1,
            )
            if month_start.month == 12:
                month_end = date(month_start.year + 1, 1, 1) - timedelta(days=1)
            else:
                _, days_in_month = calendar.monthrange(month_start.year, month_start.month)
                month_end = date(month_start.year, month_start.month, days_in_month)

            days_in_month = (month_end - month_start).days + 1
            daily_qty = monthly_qty / days_in_month

            for day_offset in range(days_in_month):
                sale_date = month_start + timedelta(days=day_offset)
                if sale_date < start_date or sale_date > end_date:
                    continue
                cantidad = max(1, int(round(daily_qty * random.uniform(0.3, 2.5))))
                ventas_rows.append({
                    "fecha": sale_date.isoformat(),
                    "sku": sku,
                    "cantidad": cantidad,
                    "cliente_id": "",
                    "canal": "oficina",
                })

    ventas_df = pd.DataFrame(ventas_rows)
    if not ventas_df.empty:
        ventas_df = ventas_df.sort_values("fecha").reset_index(drop=True)

    proveedores_list = sorted(provider_map.values(), key=lambda p: p["id"])
    if not proveedores_list:
        proveedores_list = [{
            "id": "PROV000",
            "nombre": "Proveedor no especificado",
            "lead_time_dias": 7,
            "email": "",
            "pedido_minimo": 0.0,
        }]

    return {
        "productos": pd.DataFrame(productos_rows),
        "ventas": ventas_df,
        "proveedores": proveedores_list,
    }


def run_import(excel_path: Path, output_dir: Path) -> bool:
    """Importa datos del Excel y escribe CSVs/JSON en output_dir."""
    if not excel_path.exists():
        logger.warning("Excel no encontrado: %s", excel_path)
        return False

    try:
        data = import_from_excel(excel_path)
    except Exception:
        logger.exception("Error importando Excel: %s", excel_path)
        return False

    output_dir.mkdir(parents=True, exist_ok=True)

    prod_path = output_dir / "productos.csv"
    data["productos"].to_csv(prod_path, index=False)
    logger.info("Productos exportados: %s (%s registros)", prod_path, len(data["productos"]))

    ventas_path = output_dir / "ventas.csv"
    data["ventas"].to_csv(ventas_path, index=False)
    logger.info("Ventas exportadas: %s (%s registros)", ventas_path, len(data["ventas"]))

    prov_path = output_dir / "proveedores.json"
    with prov_path.open("w", encoding="utf-8") as f:
        json.dump(data["proveedores"], f, ensure_ascii=False, indent=2)
    logger.info("Proveedores exportados: %s (%s registros)", prov_path, len(data["proveedores"]))

    return True
