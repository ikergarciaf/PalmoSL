from __future__ import annotations

import logging
import smtplib
from datetime import date
from email.mime.text import MIMEText
from typing import Any

from config import LOGGER_NAME, Settings
from modulo2_stock.models import AlertPriority, StockAlert, StockPrediction


logger = logging.getLogger(LOGGER_NAME)


class StockAlertService:
    """Convierte predicciones en alertas accionables y las notifica."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def generate_alerts(
        self,
        predictions: list[StockPrediction],
        proveedores: list[dict[str, Any]],
    ) -> list[StockAlert]:
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

        critical = [a for a in alerts if a.prioridad in ("critica", "alta")]
        if critical:
            self._notify(critical)

        logger.info("Alertas de stock generadas: %s (criticas/altas: %s)", len(alerts), len(critical))
        return alerts

    def _notify(self, alerts: list[StockAlert]) -> None:
        """Envía notificación email al encargado de compras."""
        if not self.settings.email_compras:
            logger.info("EMAIL_COMPRAS no configurado; omitiendo notificacion")
            return

        subject = f"[Palmo IA] {len(alerts)} alertas de stock - {date.today().isoformat()}"
        lines = [
            "Se han detectado los siguientes productos con riesgo de rotura de stock:\n"
        ]
        for a in alerts[:20]:
            lines.append(
                f"  [{a.prioridad.upper()}] {a.sku} - {a.nombre}\n"
                f"    Stock: {a.stock_actual} uds | Dias restantes: {a.dias_restantes:.1f}\n"
                f"    Lead time: {a.lead_time_dias}d | Reposicion sugerida: {a.reposicion_sugerida} uds\n"
                f"    Proveedor: {a.proveedor}\n"
            )
        if len(alerts) > 20:
            lines.append(f"  ... y {len(alerts) - 20} alertas mas\n")
        lines.append("\n---\nPalmo IA - Sistema automatico de prediccion de stock")

        body = "\n".join(lines)
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = self.settings.email_atencion_cliente
        msg["To"] = self.settings.email_compras

        try:
            with smtplib.SMTP("localhost", 25, timeout=10) as server:
                server.send_message(msg)
            logger.info("Notificacion email enviada a %s", self.settings.email_compras)
        except Exception:
            logger.warning(
                "No se pudo enviar notificacion email (servidor SMTP no disponible). "
                "Las alertas estan disponibles en data/alertas_stock.csv"
            )

    @staticmethod
    def _priority(prediction: StockPrediction, threshold: int) -> AlertPriority:
        if prediction.dias_restantes <= prediction.lead_time_dias or prediction.stock_actual == 0:
            return "critica"
        if prediction.dias_restantes <= threshold:
            return "alta"
        return "media"

    @staticmethod
    def _reason(prediction: StockPrediction, threshold: int) -> str:
        reasons = []
        if prediction.dias_restantes <= threshold:
            reasons.append("dias restantes por debajo de lead time mas margen")
        if prediction.stock_actual <= prediction.stock_minimo:
            reasons.append("stock actual por debajo del minimo")
        if prediction.anomalia_detectada:
            reasons.append("pico de demanda reciente detectado")
        return "; ".join(reasons) or "riesgo preventivo de rotura"
