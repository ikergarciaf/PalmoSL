"""Generacion de alertas de compra."""

from __future__ import annotations

import logging
from datetime import date
from typing import Any

from config import LOGGER_NAME, Settings
from modulo2_stock.models import AlertPriority, StockAlert, StockPrediction


logger = logging.getLogger(LOGGER_NAME)


class StockAlertService:
    """Convierte predicciones en alertas accionables."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def generate_alerts(
        self,
        predictions: list[StockPrediction],
        proveedores: list[dict[str, Any]],
    ) -> list[StockAlert]:
        """Genera alertas si el stock no cubre lead time y margen."""

        provider_names = {str(p["id"]): str(p["nombre"]) for p in proveedores}
        alerts: list[StockAlert] = []
        for prediction in predictions:
            threshold = prediction.lead_time_dias + self.settings.dias_margen_seguridad
            if prediction.dias_restantes > threshold and prediction.stock_actual > prediction.stock_minimo:
                continue
            priority = self._priority(prediction, threshold)
            alerts.append(
                StockAlert(
                    sku=prediction.sku,
                    nombre=prediction.nombre,
                    proveedor_id=prediction.proveedor_id,
                    proveedor=provider_names.get(prediction.proveedor_id, prediction.proveedor_id),
                    stock_actual=prediction.stock_actual,
                    dias_restantes=prediction.dias_restantes,
                    lead_time_dias=prediction.lead_time_dias,
                    prioridad=priority,
                    reposicion_sugerida=max(1, prediction.reposicion_sugerida),
                    motivo=self._reason(prediction, threshold),
                    generated_at=date.today(),
                )
            )
        alerts.sort(key=lambda alert: {"critica": 0, "alta": 1, "media": 2}[alert.prioridad])
        logger.info("Alertas de stock generadas: %s", len(alerts))
        return alerts

    @staticmethod
    def _priority(prediction: StockPrediction, threshold: int) -> AlertPriority:
        """Calcula prioridad de compra."""

        if prediction.dias_restantes <= prediction.lead_time_dias or prediction.stock_actual == 0:
            return "critica"
        if prediction.dias_restantes <= threshold:
            return "alta"
        return "media"

    @staticmethod
    def _reason(prediction: StockPrediction, threshold: int) -> str:
        """Explica la razon de la alerta."""

        reasons = []
        if prediction.dias_restantes <= threshold:
            reasons.append("dias restantes por debajo de lead time mas margen")
        if prediction.stock_actual <= prediction.stock_minimo:
            reasons.append("stock actual por debajo del minimo")
        if prediction.anomalia_detectada:
            reasons.append("pico de demanda reciente detectado")
        return "; ".join(reasons) or "riesgo preventivo de rotura"
