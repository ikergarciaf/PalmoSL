"""Politica de escalado a revision humana."""

from __future__ import annotations

import logging

from config import LOGGER_NAME, Settings
from modulo1_email.models import EmailClassification, EmailMessage


logger = logging.getLogger(LOGGER_NAME)


class EscalationService:
    """Decide y registra escalados de emails."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def should_escalate(self, classification: EmailClassification) -> bool:
        """Aplica reglas de escalado."""

        return classification.requires_human_review

    def build_escalation_note(self, email: EmailMessage, classification: EmailClassification) -> str:
        """Genera una nota interna para el equipo humano."""

        logger.warning(
            "Email escalado | id=%s | categoria=%s | confianza=%.2f",
            email.id,
            classification.categoria,
            classification.confianza,
        )
        return (
            f"Email escalado a {self.settings.email_escalado}\n"
            f"Cliente: {email.from_email}\n"
            f"Asunto: {email.subject}\n"
            f"Categoria: {classification.categoria}\n"
            f"Confianza: {classification.confianza:.2f}\n"
            f"Motivo: {classification.motivo}"
        )
