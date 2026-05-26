"""Punto de entrada del modulo de emails."""

from __future__ import annotations

import logging

from config import LOGGER_NAME, configure_logging, ensure_runtime_files, get_settings
from modulo1_email.classifier import EmailClassifier
from modulo1_email.escalador import EscalationService
from modulo1_email.gmail_client import GmailClient
from modulo1_email.knowledge_base import ProductKnowledgeBase
from modulo1_email.responder import EmailResponder


logger = logging.getLogger(LOGGER_NAME)


def run(limit: int = 20) -> int:
    """Procesa emails no leidos y devuelve el numero procesado."""

    settings = get_settings()
    configure_logging(settings)
    ensure_runtime_files(settings)

    gmail = GmailClient(settings)
    classifier = EmailClassifier(settings)
    knowledge = ProductKnowledgeBase(settings)
    escalator = EscalationService(settings)
    responder = EmailResponder(settings)

    emails = gmail.fetch_unread_emails(limit=limit)
    logger.info("Emails recibidos para procesar: %s", len(emails))

    processed = 0
    for email in emails:
        try:
            classification = classifier.classify(email)
            context = knowledge.context_from_classification(
                classification.entidades,
                fallback_text=f"{email.subject} {email.body}",
            )
            escalated = escalator.should_escalate(classification)
            if escalated:
                escalator.build_escalation_note(email, classification)
            response = responder.generate(email, classification, context, escalated)
            gmail.send_response(response)
            processed += 1
        except Exception:
            logger.exception("Error procesando email id=%s", email.id)
    logger.info("Procesamiento de emails completado: %s", processed)
    return processed


if __name__ == "__main__":
    run()
