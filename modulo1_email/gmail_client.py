"""Cliente Gmail con modo real y modo simulacion."""

from __future__ import annotations

import base64
import json
import logging
from datetime import datetime
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any

from config import LOGGER_NAME, Settings
from modulo1_email.models import EmailMessage, EmailResponse
from modulo1_email.utils import parse_email_messages


logger = logging.getLogger(LOGGER_NAME)


class GmailClient:
    """Abstrae lectura y envio de emails mediante Gmail API o mocks locales."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._service: Any | None = None

    @property
    def mock_mode(self) -> bool:
        """Indica si no hay credenciales Gmail disponibles."""

        credentials = self.settings.gmail_credentials_file
        return credentials is None or not credentials.exists()

    def fetch_unread_emails(self, limit: int = 20) -> list[EmailMessage]:
        """Lee emails no leidos desde Gmail o desde data/emails_mock.json."""

        if self.mock_mode:
            logger.info("Gmail en modo mock; leyendo emails simulados")
            return self._fetch_mock_emails(limit)

        try:
            service = self._get_service()
            result = (
                service.users()
                .messages()
                .list(userId="me", labelIds=["UNREAD"], maxResults=limit)
                .execute()
            )
            messages = result.get("messages", [])
            parsed = [self._load_message(service, message["id"]) for message in messages]
            return [message for message in parsed if message is not None]
        except Exception:
            logger.exception("Error leyendo Gmail; usando mock como fallback")
            return self._fetch_mock_emails(limit)

    def send_response(self, response: EmailResponse) -> None:
        """Envia respuesta por Gmail o la registra en logs si esta en modo mock."""

        if self.mock_mode:
            logger.info("MOCK envio email a %s | asunto=%s", response.to_email, response.subject)
            logger.debug("Cuerpo mock: %s", response.body)
            return

        try:
            service = self._get_service()
            content_type = "html" if "<html" in response.body.lower() else "plain"
            message = MIMEText(response.body, content_type, "utf-8")
            message["to"] = response.to_email
            message["from"] = self.settings.email_atencion_cliente
            message["subject"] = response.subject
            encoded = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
            service.users().messages().send(userId="me", body={"raw": encoded}).execute()
        except Exception:
            logger.exception("No se pudo enviar respuesta por Gmail")
            raise

    def _fetch_mock_emails(self, limit: int) -> list[EmailMessage]:
        """Carga emails simulados desde JSON."""

        path = self.settings.emails_mock
        with path.open("r", encoding="utf-8") as fh:
            raw = json.load(fh)
        return parse_email_messages(raw[:limit])

    def _get_service(self) -> Any:
        """Construye un cliente Gmail autenticado."""

        if self._service is not None:
            return self._service

        try:
            from google.auth.transport.requests import Request
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from googleapiclient.discovery import build
        except ImportError as exc:
            raise RuntimeError("Dependencias de Google API no instaladas") from exc

        scopes = ["https://www.googleapis.com/auth/gmail.modify"]
        creds: Any | None = None
        token_file = self.settings.gmail_token_file
        credentials_file = self.settings.gmail_credentials_file

        if token_file and token_file.exists():
            creds = Credentials.from_authorized_user_file(str(token_file), scopes)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            elif credentials_file and credentials_file.exists():
                flow = InstalledAppFlow.from_client_secrets_file(str(credentials_file), scopes)
                creds = flow.run_local_server(port=0)
            else:
                raise RuntimeError("No hay credenciales Gmail validas")
            if token_file:
                token_file.parent.mkdir(parents=True, exist_ok=True)
                token_file.write_text(creds.to_json(), encoding="utf-8")

        self._service = build("gmail", "v1", credentials=creds)
        return self._service

    @staticmethod
    def _load_message(service: Any, message_id: str) -> EmailMessage | None:
        """Convierte un mensaje Gmail en EmailMessage."""

        raw = service.users().messages().get(userId="me", id=message_id, format="full").execute()
        headers = {h["name"].lower(): h["value"] for h in raw.get("payload", {}).get("headers", [])}
        payload = raw.get("payload", {})
        body = GmailClient._extract_body(payload)
        return EmailMessage(
            id=message_id,
            from_email=headers.get("from", ""),
            subject=headers.get("subject", ""),
            body=body,
            received_at=datetime.now(),
        )

    @staticmethod
    def _extract_body(payload: dict[str, Any]) -> str:
        """Extrae texto plano de un payload Gmail."""

        data = payload.get("body", {}).get("data")
        if data:
            return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
        for part in payload.get("parts", []):
            if part.get("mimeType") == "text/plain":
                part_data = part.get("body", {}).get("data", "")
                return base64.urlsafe_b64decode(part_data).decode("utf-8", errors="replace")
        return ""
