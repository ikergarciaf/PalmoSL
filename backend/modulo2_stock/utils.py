"""Utilidades para datos y calculos de stock."""

from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

from config import LOGGER_NAME, Settings, ensure_runtime_files


logger = logging.getLogger(LOGGER_NAME)


def prepare_data(settings: Settings) -> None:
    """Garantiza que existen datos mock o reales listos para procesar."""

    ensure_runtime_files(settings)


def export_dataframe(df: pd.DataFrame, path: Path) -> None:
    """Exporta un DataFrame a CSV creando directorios si hace falta."""

    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    logger.info("CSV exportado: %s", path)


def safe_divide(numerator: float, denominator: float, default: float = 9999.0) -> float:
    """Divide evitando errores por cero."""

    if denominator <= 0:
        return default
    return numerator / denominator
