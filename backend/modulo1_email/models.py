"""Modelos de dominio para el modulo de emails."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal


EmailCategory = Literal["stock", "precio", "compatibilidad", "estado_pedido", "reclamacion", "consulta_compleja"]


@dataclass(frozen=True)
class EmailMessage:
    """Email entrante normalizado."""

    id: str
    from_email: str
    subject: str
    body: str
    received_at: datetime


@dataclass(frozen=True)
class EmailClassification:
    """Resultado de clasificacion de un email."""

    categoria: EmailCategory
    confianza: float
    motivo: str
    entidades: dict[str, Any] = field(default_factory=dict)
    ambigua: bool = False

    @property
    def requires_human_review(self) -> bool:
        """Indica si el email debe ser revisado por una persona."""

        return self.confianza < 0.85 or self.categoria == "reclamacion" or self.ambigua


@dataclass(frozen=True)
class ProductContext:
    """Contexto de producto obtenido de la base de conocimiento."""

    matches: list[dict[str, Any]]
    query: str
    exact_match: bool


@dataclass(frozen=True)
class EmailResponse:
    """Respuesta generada para un email."""

    email_id: str
    to_email: str
    subject: str
    body: str
    escalated: bool
    metadata: dict[str, Any] = field(default_factory=dict)
