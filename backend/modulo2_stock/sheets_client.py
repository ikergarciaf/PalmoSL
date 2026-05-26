from __future__ import annotations

import logging

import pandas as pd

from config import LOGGER_NAME, Settings


logger = logging.getLogger(LOGGER_NAME)


class GoogleSheetsClient:
    """Publica tablas en CSV local (modo mock siempre en MVP)."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def publish_alerts(self, frame: pd.DataFrame, worksheet: str = "Alertas Stock") -> None:
        fallback = self.settings.base_dir / "data" / "google_sheets_fallback.csv"
        frame.to_csv(fallback, index=False)
        logger.info("Sheets mock — fallback CSV generado: %s", fallback)
