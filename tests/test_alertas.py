"""Tests de alertas de stock."""

from __future__ import annotations

from config import get_settings
from modulo2_stock.alertas import StockAlertService
from modulo2_stock.models import StockPrediction


def test_alert_service_generates_critical_alert() -> None:
    """Una rotura inmediata debe producir alerta critica."""

    settings = get_settings()
    prediction = StockPrediction(
        sku="PAL-HP-TON-0001",
        nombre="Toner compatible HP",
        proveedor_id="PROV001",
        stock_actual=0,
        stock_minimo=10,
        ventas_diarias_media=2.0,
        dias_restantes=0.0,
        lead_time_dias=7,
        anomalia_detectada=False,
        reposicion_sugerida=80,
    )
    alerts = StockAlertService(settings).generate_alerts(
        [prediction],
        [{"id": "PROV001", "nombre": "Proveedor Test", "lead_time_dias": 7}],
    )
    assert len(alerts) == 1
    assert alerts[0].prioridad == "critica"
    assert alerts[0].reposicion_sugerida == 80
