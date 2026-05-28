"""Modelos de dominio para prediccion de stock."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal


AlertPriority = Literal["critica", "alta", "media"]


@dataclass(frozen=True)
class StockPrediction:
    """Prediccion de consumo y dias restantes para un producto."""

    sku: str
    nombre: str
    proveedor_id: str
    stock_actual: int
    stock_minimo: int
    ventas_diarias_media: float
    dias_restantes: float
    lead_time_dias: int
    anomalia_detectada: bool
    reposicion_sugerida: int


@dataclass(frozen=True)
class StockAlert:
    """Alerta accionable de compra."""

    sku: str
    nombre: str
    proveedor_id: str
    proveedor: str
    stock_actual: int
    dias_restantes: float
    lead_time_dias: int
    prioridad: AlertPriority
    reposicion_sugerida: int
    motivo: str
    generated_at: date
