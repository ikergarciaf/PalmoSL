"""Tests del generador de respuestas de email."""

from __future__ import annotations

from config import ensure_runtime_files, get_settings
from modulo1_email.models import EmailClassification, EmailMessage, ProductContext
from modulo1_email.responder import EmailResponder


def test_responder_generates_mock_response_without_api_key() -> None:
    settings = get_settings()
    ensure_runtime_files(settings)

    email = EmailMessage(
        id="response-01",
        from_email="cliente@example.com",
        subject="Consulta precio tinta Canon",
        body="Podrian enviarme presupuesto para 30 unidades?",
        received_at=None,
    )
    classification = EmailClassification(
        categoria="precio",
        confianza=0.92,
        motivo="Consulta de precio detectada",
        entidades={"producto": "tinta Canon"},
        ambigua=False,
    )
    context = ProductContext(matches=[{"sku": "PAL-CA-TIN-0001", "nombre": "Tinta Canon 545", "precio_venta": 24.5}], query="tinta Canon", exact_match=True)

    response = EmailResponder(settings).generate(email, classification, context, escalated=False)

    assert response.to_email == email.from_email
    assert "precio orientativo" in response.body.lower() or "presupuesto" in response.body.lower()
    assert response.escalated is False
