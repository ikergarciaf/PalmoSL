from __future__ import annotations

import json
import logging
from datetime import datetime

from config import LOGGER_NAME, Settings
from modulo1_email.models import EmailMessage, EmailResponse
from modulo1_email.utils import parse_email_messages


logger = logging.getLogger(LOGGER_NAME)


class GmailClient:
    """Lee emails desde data/emails_mock.json (modo mock siempre en MVP)."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def fetch_unread_emails(self, limit: int = 20) -> list[EmailMessage]:
        path = self.settings.emails_mock
        with path.open("r", encoding="utf-8") as fh:
            raw = json.load(fh)
        return parse_email_messages(raw[:limit])

    def send_response(self, response: EmailResponse) -> None:
        logger.info("MOCK envio email a %s | asunto=%s", response.to_email, response.subject)
