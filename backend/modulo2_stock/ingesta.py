"""Ingesta y limpieza de datos de stock."""

from __future__ import annotations

import json
import logging
from typing import Any

import pandas as pd

from config import LOGGER_NAME, Settings
from modulo2_stock.utils import prepare_data


logger = logging.getLogger(LOGGER_NAME)


class StockDataLoader:
    """Carga ventas, productos y proveedores desde ficheros configurados."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def load(self) -> tuple[pd.DataFrame, pd.DataFrame, list[dict[str, Any]]]:
        """Carga y limpia todas las entradas."""

        prepare_data(self.settings)
        try:
            ventas = pd.read_csv(self.settings.csv_ventas)
            productos = pd.read_csv(self.settings.csv_productos)
            with self.settings.json_proveedores.open("r", encoding="utf-8") as fh:
                proveedores = json.load(fh)
        except Exception as exc:
            logger.exception("Error cargando datos de stock")
            raise RuntimeError("No se pudieron cargar datos de stock") from exc

        return self._clean_sales(ventas), self._clean_products(productos), proveedores

    @staticmethod
    def _clean_sales(ventas: pd.DataFrame) -> pd.DataFrame:
        """Limpia ventas y descarta registros invalidos."""

        ventas = ventas.copy()
        ventas["fecha"] = pd.to_datetime(ventas["fecha"], errors="coerce")
        ventas["sku"] = ventas["sku"].astype(str).str.strip()
        ventas["cantidad"] = pd.to_numeric(ventas["cantidad"], errors="coerce").fillna(0).astype(int)
        ventas = ventas.dropna(subset=["fecha"])
        ventas = ventas[(ventas["sku"] != "") & (ventas["cantidad"] > 0)]
        return ventas

    @staticmethod
    def _clean_products(productos: pd.DataFrame) -> pd.DataFrame:
        """Normaliza columnas de productos."""

        productos = productos.copy()
        productos["sku"] = productos["sku"].astype(str).str.strip()
        productos["nombre"] = productos["nombre"].astype(str)
        productos["proveedor_id"] = productos["proveedor_id"].astype(str)
        for column in ["stock_actual", "stock_minimo"]:
            productos[column] = pd.to_numeric(productos[column], errors="coerce").fillna(0).astype(int)
        return productos[productos["sku"] != ""]
