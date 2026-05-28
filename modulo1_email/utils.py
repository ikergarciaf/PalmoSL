"""Utilidades del modulo de emails."""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Any

from config import LOGGER_NAME
from modulo1_email.models import EmailMessage


logger = logging.getLogger(LOGGER_NAME)


def load_prompt(path: Path) -> str:
    """Carga un prompt externo."""

    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        logger.exception("Prompt no encontrado: %s", path)
        raise RuntimeError(f"Prompt no encontrado: {path}") from exc


def extract_json(text: str) -> dict[str, Any]:
    """Extrae JSON de una respuesta de modelo."""

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def parse_email_messages(raw_emails: list[dict[str, Any]]) -> list[EmailMessage]:
    """Convierte diccionarios de emails en modelos tipados."""

    messages: list[EmailMessage] = []
    for raw in raw_emails:
        received = raw.get("received_at")
        received_at = datetime.fromisoformat(received) if received else datetime.now()
        messages.append(
            EmailMessage(
                id=str(raw["id"]),
                from_email=str(raw["from_email"]),
                subject=str(raw.get("subject", "")),
                body=str(raw.get("body", "")),
                received_at=received_at,
            )
        )
    return messages


def find_quantity(text: str) -> int | None:
    """Detecta una cantidad expresada con digitos."""

    match = re.search(r"\b(\d{1,4})\s*(unidades|uds|u\.|cartuchos|toners)?\b", text, re.IGNORECASE)
    return int(match.group(1)) if match else None
