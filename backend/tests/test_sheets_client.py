"""Tests del cliente de Google Sheets con modo mock."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from config import ensure_runtime_files, get_settings
from modulo2_stock.sheets_client import GoogleSheetsClient


def test_google_sheets_client_fallback_csv_generated(tmp_path: Path) -> None:
    settings = get_settings()
    ensure_runtime_files(settings)

    frame = pd.DataFrame(
        [
            {"sku": "PAL-HP-TON-0001", "proveedor": "Proveedor Test", "prioridad": "critica"}
        ]
    )
    fallback = settings.base_dir / "data" / "google_sheets_fallback.csv"
    if fallback.exists():
        fallback.unlink()

    GoogleSheetsClient(settings).publish_alerts(frame)

    assert fallback.exists()
    content = fallback.read_text(encoding="utf-8")
    assert "sku" in content.lower()
    assert "proveedor" in content.lower()
