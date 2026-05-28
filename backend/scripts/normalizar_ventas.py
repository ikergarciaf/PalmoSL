#!/usr/bin/env python
"""
Herramienta de normalización de datos de ventas SAP.

Carga un CSV de ventas y lo normaliza:
- Convierte fechas a formato ISO 8601 (YYYY-MM-DD)
- Valida y convierte tipos numéricos
- Elimina duplicados y registros inválidos
- Genera reportes de calidad
- Exporta CSV limpio listo para análisis

Uso:
    python normalizar_ventas.py ../data/ventas.csv
    python normalizar_ventas.py --input ../data/ventas_raw.csv --output ../data/ventas_clean.csv --report report.html
"""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd


def setup_logging(verbose: bool = False) -> logging.Logger:
    """Configura logging."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    return logging.getLogger(__name__)


def validate_csv_exists(path: Path) -> Path:
    """Valida que el archivo CSV exista."""
    if not path.exists():
        raise FileNotFoundError(f"CSV no encontrado: {path}")
    if path.stat().st_size == 0:
        raise ValueError(f"CSV vacío: {path}")
    return path


def load_sales_data(path: Path) -> pd.DataFrame:
    """Carga el CSV de ventas."""
    logger = logging.getLogger(__name__)
    logger.info("Cargando %s", path)

    try:
        df = pd.read_csv(path)
    except Exception as e:
        raise RuntimeError(f"Error cargando CSV: {e}") from e

    if df.empty:
        raise ValueError("El CSV no contiene datos")

    logger.info("Datos cargados: %d filas, %d columnas", len(df), len(df.columns))
    return df


def normalize_sales_data(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, Any]]:
    """Normaliza y valida datos de ventas."""
    logger = logging.getLogger(__name__)

    original_count = len(df)
    stats = {
        "original_rows": original_count,
        "duplicates_removed": 0,
        "invalid_dates": 0,
        "invalid_quantities": 0,
        "invalid_skus": 0,
        "final_rows": 0,
    }

    # Normalizar fechas
    df_norm = df.copy()
    invalid_dates = df_norm["fecha"].isna().sum()
    stats["invalid_dates"] = invalid_dates

    try:
        df_norm["fecha"] = pd.to_datetime(df_norm["fecha"], errors="coerce")
    except Exception as e:
        logger.warning("Error normalizando fechas: %s", e)

    # Validar SKU
    df_norm["sku"] = df_norm["sku"].astype(str).str.strip().str.upper()
    invalid_skus = (df_norm["sku"] == "") | (df_norm["sku"].isna()).sum()
    stats["invalid_skus"] = invalid_skus

    # Validar cantidad
    try:
        df_norm["cantidad"] = pd.to_numeric(df_norm["cantidad"], errors="coerce")
    except Exception as e:
        logger.warning("Error normalizando cantidad: %s", e)

    invalid_quantities = (df_norm["cantidad"] <= 0) | (df_norm["cantidad"].isna()).sum()
    stats["invalid_quantities"] = invalid_quantities

    # Eliminar registros inválidos
    df_clean = df_norm.dropna(subset=["fecha", "sku", "cantidad"])
    df_clean = df_clean[(df_clean["sku"] != "") & (df_clean["cantidad"] > 0)]

    # Eliminar duplicados exactos
    duplicates = len(df_clean) - len(df_clean.drop_duplicates())
    stats["duplicates_removed"] = duplicates
    df_clean = df_clean.drop_duplicates()

    # Normalizar otros campos
    if "cliente_id" in df_clean.columns:
        df_clean["cliente_id"] = df_clean["cliente_id"].astype(str).str.strip()
    if "canal" in df_clean.columns:
        df_clean["canal"] = df_clean["canal"].astype(str).str.strip().str.lower()

    df_clean = df_clean.sort_values("fecha").reset_index(drop=True)
    stats["final_rows"] = len(df_clean)

    # Log resumen
    removed = stats["original_rows"] - stats["final_rows"]
    logger.info(
        "Normalización completada: %d → %d filas (eliminadas: %d)",
        stats["original_rows"],
        stats["final_rows"],
        removed,
    )

    return df_clean, stats


def generate_quality_report(
    df_original: pd.DataFrame,
    df_clean: pd.DataFrame,
    stats: dict[str, Any],
    output_path: Path | None = None,
) -> str:
    """Genera un reporte HTML de calidad de datos."""
    logger = logging.getLogger(__name__)

    html_parts = [
        "<!DOCTYPE html>",
        "<html lang='es'>",
        "<head>",
        "<meta charset='UTF-8'>",
        "<meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        "<title>Reporte de Normalización SAP Ventas</title>",
        "<style>",
        "body { font-family: system-ui, sans-serif; margin: 2rem; background: #f5f5f4; }",
        ".header { background: #1a1a1a; color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }",
        ".section { background: white; border: 1px solid #d4d4d4; border-radius: 8px; padding: 2rem; margin-bottom: 1.5rem; }",
        ".metric { display: inline-block; min-width: 200px; margin: 0.5rem; }",
        ".metric-label { font-size: 0.85rem; color: #666; text-transform: uppercase; font-weight: 500; }",
        ".metric-value { font-size: 2rem; font-weight: bold; color: #1a1a1a; }",
        ".success { color: #059669; }",
        ".warning { color: #d97706; }",
        ".error { color: #dc2626; }",
        "table { width: 100%; border-collapse: collapse; }",
        "th { background: #f3f4f6; padding: 0.75rem; text-align: left; font-size: 0.85rem; font-weight: 600; }",
        "td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }",
        "tr:hover { background: #fafafa; }",
        "</style>",
        "</head>",
        "<body>",
        "<div class='header'>",
        f"<h1>Reporte de Normalización — Ventas SAP</h1>",
        f"<p>Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>",
        "</div>",
        "<div class='section'>",
        "<h2>Resumen de Calidad</h2>",
        "<div>",
        f"<div class='metric'><div class='metric-label'>Filas Originales</div><div class='metric-value'>{stats['original_rows']:,}</div></div>",
        f"<div class='metric'><div class='metric-label'>Filas Limpias</div><div class='metric-value success'>{stats['final_rows']:,}</div></div>",
        f"<div class='metric'><div class='metric-label'>Tasa Limpieza</div><div class='metric-value success'>{(stats['final_rows'] / stats['original_rows'] * 100):.1f}%</div></div>",
        "</div>",
        "</div>",
        "<div class='section'>",
        "<h2>Problemas Detectados</h2>",
        "<table>",
        "<thead><tr><th>Problema</th><th>Cantidad</th><th>Impacto</th></tr></thead>",
        "<tbody>",
        f"<tr><td>Fechas inválidas</td><td>{stats['invalid_dates']}</td><td>Eliminadas</td></tr>",
        f"<tr><td>SKUs vacíos o inválidos</td><td>{stats['invalid_skus']}</td><td>Eliminadas</td></tr>",
        f"<tr><td>Cantidades inválidas (≤0)</td><td>{stats['invalid_quantities']}</td><td>Eliminadas</td></tr>",
        f"<tr><td>Duplicados exactos</td><td>{stats['duplicates_removed']}</td><td>Deduplicados</td></tr>",
        "</tbody>",
        "</table>",
        "</div>",
        "<div class='section'>",
        "<h2>Análisis Temporal</h2>",
        "<table>",
        "<thead><tr><th>Métrica</th><th>Valor</th></tr></thead>",
        "<tbody>",
    ]

    if not df_clean.empty and "fecha" in df_clean.columns:
        fecha_min = df_clean["fecha"].min()
        fecha_max = df_clean["fecha"].max()
        dias_span = (fecha_max - fecha_min).days
        html_parts.extend([
            f"<tr><td>Fecha mínima</td><td>{fecha_min.date()}</td></tr>",
            f"<tr><td>Fecha máxima</td><td>{fecha_max.date()}</td></tr>",
            f"<tr><td>Rango (días)</td><td>{dias_span}</td></tr>",
        ])

    html_parts.extend([
        "</tbody>",
        "</table>",
        "</div>",
        "<div class='section'>",
        "<h2>Distribución por SKU (top 20)</h2>",
        "<table>",
        "<thead><tr><th>SKU</th><th>Filas</th><th>Cantidad Total</th></tr></thead>",
        "<tbody>",
    ])

    if not df_clean.empty and "sku" in df_clean.columns:
        sku_summary = (
            df_clean.groupby("sku")
            .agg(count=("cantidad", "count"), total=("cantidad", "sum"))
            .sort_values("total", ascending=False)
            .head(20)
        )
        for sku, row in sku_summary.iterrows():
            html_parts.append(
                f"<tr><td>{sku}</td><td>{int(row['count'])}</td><td>{int(row['total'])}</td></tr>"
            )

    html_parts.extend([
        "</tbody>",
        "</table>",
        "</div>",
        "</body>",
        "</html>",
    ])

    html = "\n".join(html_parts)

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(html, encoding="utf-8")
        logger.info("Reporte HTML generado: %s", output_path)

    return html


def main() -> int:
    """Función principal."""
    parser = argparse.ArgumentParser(
        description="Normaliza datos de ventas SAP",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("input", nargs="?", help="Ruta CSV de entrada (default: ../data/ventas.csv)")
    parser.add_argument("--output", "-o", help="Ruta CSV de salida (default: input + '_clean')")
    parser.add_argument("--report", "-r", help="Ruta HTML del reporte (default: report_TIMESTAMP.html)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Modo verbose")

    args = parser.parse_args()
    logger = setup_logging(args.verbose)

    try:
        # Resolver rutas
        input_path = Path(args.input or "../data/ventas.csv").resolve()
        output_path = Path(args.output or f"{input_path.stem}_clean.csv").resolve()
        report_path = Path(
            args.report or f"reporte_normalizacion_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        ).resolve()

        logger.info("Inicio de normalización")
        logger.info("  Entrada: %s", input_path)
        logger.info("  Salida: %s", output_path)
        logger.info("  Reporte: %s", report_path)

        # Validar y cargar
        validate_csv_exists(input_path)
        df_original = load_sales_data(input_path)

        # Normalizar
        df_clean, stats = normalize_sales_data(df_original)

        # Exportar CSV limpio
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df_clean.to_csv(output_path, index=False, encoding="utf-8")
        logger.info("CSV limpio exportado: %s", output_path)

        # Generar reporte
        generate_quality_report(df_original, df_clean, stats, report_path)

        # Resumen
        logger.info("✓ Normalización completada exitosamente")
        logger.info("  Filas originales: %d", stats["original_rows"])
        logger.info("  Filas limpias: %d", stats["final_rows"])
        logger.info("  Problemas encontrados: %d", stats["original_rows"] - stats["final_rows"])

        return 0

    except Exception as e:
        logger.exception("Error: %s", e)
        return 1


if __name__ == "__main__":
    sys.exit(main())
