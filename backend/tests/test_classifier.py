"""Tests del clasificador de emails."""

from __future__ import annotations

from datetime import datetime

from config import ensure_runtime_files, get_settings
from modulo1_email.classifier import EmailClassifier
from modulo1_email.models import EmailMessage


def test_classifier_detects_stock_without_api_key() -> None:
    """El modo mock debe detectar consultas de stock."""

    settings = get_settings()
    ensure_runtime_files(settings)
    email = EmailMessage(
        id="t1",
        from_email="cliente@example.com",
        subject="Consulta stock",
        body="Necesito stock de toner HP para 10 unidades.",
        received_at=datetime.now(),
    )
    result = EmailClassifier(settings).classify(email)
    assert result.categoria == "stock"
    assert result.confianza >= 0.85


def test_classifier_escalates_claims() -> None:
    """Las reclamaciones se marcan para revision humana."""

    settings = get_settings()
    ensure_runtime_files(settings)
    email = EmailMessage(
        id="t2",
        from_email="cliente@example.com",
        subject="Reclamacion material defectuoso",
        body="El toner ha llegado defectuoso y necesitamos solucion urgente.",
        received_at=datetime.now(),
    )
    result = EmailClassifier(settings).classify(email)
    assert result.categoria == "reclamacion"
    assert result.requires_human_review
