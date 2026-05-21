"""Cliente Google Sheets con fallback local."""

from __future__ import annotations

import logging
from typing import Any

import pandas as pd

from config import LOGGER_NAME, Settings


logger = logging.getLogger(LOGGER_NAME)


class GoogleSheetsClient:
    """Publica tablas en Google Sheets o CSV local si no hay credenciales."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._service: Any | None = None

    @property
    def mock_mode(self) -> bool:
        """Indica si debe usar fallback local."""

        return (
            not self.settings.sheets_id
            or self.settings.sheets_credentials_file is None
            or not self.settings.sheets_credentials_file.exists()
        )

    def publish_alerts(self, frame: pd.DataFrame, worksheet: str = "Alertas Stock") -> None:
        """Publica alertas en Sheets o CSV."""

        if self.mock_mode:
            fallback = self.settings.base_dir / "data" / "google_sheets_fallback.csv"
            frame.to_csv(fallback, index=False)
            logger.info("Sheets mock activo; fallback CSV generado: %s", fallback)
            return

        try:
            service = self._get_service()
            values = [frame.columns.tolist()] + frame.astype(str).values.tolist()
            body = {"values": values}
            service.spreadsheets().values().clear(
                spreadsheetId=self.settings.sheets_id,
                range=f"{worksheet}!A:Z",
            ).execute()
            service.spreadsheets().values().update(
                spreadsheetId=self.settings.sheets_id,
                range=f"{worksheet}!A1",
                valueInputOption="RAW",
                body=body,
            ).execute()
        except Exception:
            logger.exception("No se pudo publicar en Google Sheets; usando fallback")
            fallback = self.settings.base_dir / "data" / "google_sheets_fallback.csv"
            frame.to_csv(fallback, index=False)

    def _get_service(self) -> Any:
        """Construye servicio autenticado de Google Sheets."""

        if self._service is not None:
            return self._service

        try:
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build
        except ImportError as exc:
            raise RuntimeError("Dependencias de Google Sheets no instaladas") from exc

        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        credentials_file = self.settings.sheets_credentials_file
        if credentials_file is None:
            raise RuntimeError("SHEETS_CREDENTIALS_FILE no configurado")
        credentials = Credentials.from_service_account_file(str(credentials_file), scopes=scopes)
        self._service = build("sheets", "v4", credentials=credentials)
        return self._service
