"""Punto de entrada del modulo de emails."""

from __future__ import annotations

import json
import logging
from datetime import date, datetime
from pathlib import Path
from typing import Any

from config import LOGGER_NAME, configure_logging, ensure_runtime_files, get_settings
from modulo1_email.classifier import EmailClassifier
from modulo1_email.escalador import EscalationService
from modulo1_email.gmail_client import GmailClient
from modulo1_email.knowledge_base import ProductKnowledgeBase
from modulo1_email.responder import EmailResponder


logger = logging.getLogger(LOGGER_NAME)

# Mapa tipo → etiqueta para logs
_CATEGORIA_LABEL = {
    "stock":             "Stock",
    "precio":            "Precio",
    "compatibilidad":    "Compatibilidad",
    "estado_pedido":     "Estado pedido",
    "reclamacion":       "Reclamacion",
    "consulta_compleja": "Consulta compleja",
}


def _load_history(path: Path) -> list[dict[str, Any]]:
    if path.exists():
        try:
            with path.open(encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []


def _save_history(path: Path, history: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2, default=str)


def run(limit: int = 20) -> int:
    """Procesa emails no leidos, persiste historial y devuelve el numero procesado."""

    settings = get_settings()
    configure_logging(settings)
    ensure_runtime_files(settings)

    gmail      = GmailClient(settings)
    classifier = EmailClassifier(settings)
    knowledge  = ProductKnowledgeBase(settings)
    escalator  = EscalationService(settings)
    responder  = EmailResponder(settings)

    emails = gmail.fetch_unread_emails(limit=limit)
    logger.info("Emails recibidos para procesar: %s", len(emails))

    history_path = settings.base_dir / "data" / "emails_procesados.json"
    history      = _load_history(history_path)
    existing_ids = {e["id"] for e in history}

    processed = 0
    for email in emails:
        try:
            classification = classifier.classify(email)
            context        = knowledge.context_from_classification(
                classification.entidades,
                fallback_text=f"{email.subject} {email.body}",
            )
            escalated = escalator.should_escalate(classification)
            if escalated:
                escalator.build_escalation_note(email, classification)

            response = responder.generate(email, classification, context, escalated)
            gmail.send_response(response)

            estado = "escalado" if escalated else "respondido"
            logger.info(
                "%s email id=%s categoria=%s confianza=%.2f",
                estado, email.id, classification.categoria, classification.confianza,
            )

            # Build record — skip if already stored (re-run prevention)
            record_id = f"{email.id}-{email.received_at.date().isoformat()}"
            if record_id not in existing_ids:
                history.append({
                    "id":        record_id,
                    "fecha":     email.received_at.date().isoformat(),
                    "hora":      email.received_at.strftime("%H:%M"),
                    "cliente":   email.from_email.split("@")[0].replace(".", " ").title(),
                    "empresa":   email.from_email.split("@")[-1] if "@" in email.from_email else email.from_email,
                    "tipo":      classification.categoria,
                    "confianza": round(classification.confianza, 4),
                    "estado":    estado,
                    "accion":    _build_action_label(classification, escalated),
                    "ambigua":   classification.ambigua,
                    "asunto":    email.subject,
                    "cuerpo":    email.body[:500],
                })
                existing_ids.add(record_id)

            processed += 1
        except Exception:
            logger.exception("Error procesando email id=%s", email.id)

    # Keep last 500 records
    _save_history(history_path, history[-500:])
    logger.info("Procesamiento de emails completado: %s procesados", processed)
    return processed


def _build_action_label(classification, escalated: bool) -> str:
    if escalated:
        return "Escalado a atencion al cliente"
    labels = {
        "stock":             "Respuesta automatica con disponibilidad",
        "precio":            "Tarifa enviada automaticamente",
        "compatibilidad":    "Confirmacion de compatibilidad enviada",
        "estado_pedido":     "Estado de pedido enviado",
        "reclamacion":       "Escalado — reclamacion",
        "consulta_compleja": "Respuesta generica enviada",
    }
    return labels.get(classification.categoria, "Respuesta automatica generada")


if __name__ == "__main__":
    run()
