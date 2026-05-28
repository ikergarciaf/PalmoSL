"""Clasificacion de emails con Gemini y fallback mock."""

from __future__ import annotations

import logging
import re
from typing import Any

from google import genai
from jinja2 import Template

from config import LOGGER_NAME, Settings
from modulo1_email.models import EmailClassification, EmailMessage
from modulo1_email.utils import extract_json, find_quantity, load_prompt


logger = logging.getLogger(LOGGER_NAME)


class EmailClassifier:
    """Clasificador de emails de atencion al cliente."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.prompt_template = Template(load_prompt(settings.prompts_dir / "clasificacion.txt"))

    def classify(self, email: EmailMessage) -> EmailClassification:
        """Clasifica un email mediante Gemini o heuristicas mock."""

        if not self.settings.gemini_api_key:
            return self._mock_classify(email)

        try:
            prompt = self.prompt_template.render(subject=email.subject, body=email.body)
            client = genai.Client(api_key=self.settings.gemini_api_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            text = response.text
            payload = extract_json(text)
            return self._from_payload(payload)
        except Exception:
            logger.exception("Gemini fallo durante clasificacion; usando fallback mock")
            return self._mock_classify(email)

    def _mock_classify(self, email: EmailMessage) -> EmailClassification:
        """Clasificacion determinista para pruebas y entorno sin API key."""

        text = f"{email.subject} {email.body}".lower()
        rules: list[tuple[str, str, float]] = [
            ("reclamacion",      r"reclamaci[oó]n|defectuos|incidencia|fuga|no coincide|urgente solucion", 0.96),
            ("estado_pedido",    r"estado.*pedido|seguimiento|pedido\s*\d+|env[ií]o",                     0.92),
            ("compatibilidad",   r"compatible|compatibilidad|sirve|modelo|impresora",                     0.90),
            ("precio",           r"precio|presupuesto|tarifa|coste|neto",                                 0.90),
            ("stock",            r"stock|disponibilidad|ten[eé]is|unidades|reposici[oó]n",                0.90),
        ]
        for categoria, pattern, confidence in rules:
            if re.search(pattern, text):
                return EmailClassification(
                    categoria=categoria,  # type: ignore[arg-type]
                    confianza=confidence,
                    motivo=f"Coincidencia heuristica con {categoria}",
                    entidades=self._extract_entities(text),
                    ambigua=(categoria == "reclamacion"),
                )
        return EmailClassification(
            categoria="consulta_compleja",
            confianza=0.72,
            motivo="No se detecto una intencion unica",
            entidades=self._extract_entities(text),
            ambigua=True,
        )

    @staticmethod
    def _from_payload(payload: dict[str, Any]) -> EmailClassification:
        """Valida la respuesta JSON del modelo."""

        return EmailClassification(
            categoria=payload.get("categoria", "consulta_compleja"),
            confianza=float(payload.get("confianza", 0.0)),
            motivo=str(payload.get("motivo", "")),
            entidades=dict(payload.get("entidades", {})),
            ambigua=bool(payload.get("ambigua", False)),
        )

    @staticmethod
    def _extract_entities(text: str) -> dict[str, Any]:
        """Extrae entidades simples para enriquecer busquedas."""

        sku_match   = re.search(r"\bPAL-[A-Z]{2}-[A-Z]{3}-\d{4}\b", text, flags=re.IGNORECASE)
        model_match = re.search(r"\b([a-z]{2,}\s?\d{3,4}[a-z]?)\b",  text, flags=re.IGNORECASE)
        return {
            "sku":      sku_match.group(0).upper() if sku_match else None,
            "producto": model_match.group(0)       if model_match else None,
            "cantidad": find_quantity(text),
            "pedido":   _find_order(text),
        }


def _find_order(text: str) -> str | None:
    """Busca un numero de pedido en texto libre."""

    match = re.search(r"pedido\s*(\d{4,8})", text, flags=re.IGNORECASE)
    return match.group(1) if match else None
