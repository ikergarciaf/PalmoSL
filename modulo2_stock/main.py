"""Punto de entrada del modulo de stock."""

from __future__ import annotations

import logging

from config import LOGGER_NAME, configure_logging, ensure_runtime_files, get_settings
from modulo2_stock.alertas import StockAlertService
from modulo2_stock.ingesta import StockDataLoader
from modulo2_stock.prediccion import StockPredictor
from modulo2_stock.reporting import StockReporter
from modulo2_stock.sheets_client import GoogleSheetsClient


logger = logging.getLogger(LOGGER_NAME)


def run() -> int:
    """Ejecuta ingesta, prediccion, alertas y exportaciones."""

    settings = get_settings()
    configure_logging(settings)
    ensure_runtime_files(settings)

    ventas, productos, proveedores = StockDataLoader(settings).load()
    predictions = StockPredictor(settings).predict(ventas, productos, proveedores)
    alerts = StockAlertService(settings).generate_alerts(predictions, proveedores)
    reporter = StockReporter(settings)
    frame = reporter.export_csv(alerts)
    reporter.export_html(alerts)
    GoogleSheetsClient(settings).publish_alerts(frame)
    logger.info("Proceso de stock completado con %s alertas", len(alerts))
    return len(alerts)


if __name__ == "__main__":
    run()
