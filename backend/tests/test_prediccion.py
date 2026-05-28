"""Tests de prediccion de stock."""

from __future__ import annotations

from config import ensure_runtime_files, get_settings
from modulo2_stock.ingesta import StockDataLoader
from modulo2_stock.prediccion import StockPredictor


def test_predictor_generates_predictions() -> None:
    """El predictor debe generar una prediccion por producto."""

    settings = get_settings()
    ensure_runtime_files(settings)
    ventas, productos, proveedores = StockDataLoader(settings).load()
    predictions = StockPredictor(settings).predict(ventas, productos.head(25), proveedores)
    assert len(predictions) == 25
    assert all(pred.dias_restantes >= 0 for pred in predictions)


def test_weighted_average_is_positive_for_existing_sales() -> None:
    """Debe calcular demanda positiva si hay ventas recientes."""

    settings = get_settings()
    ensure_runtime_files(settings)
    ventas, productos, proveedores = StockDataLoader(settings).load()
    sku = ventas["sku"].iloc[0]
    product = productos[productos["sku"] == sku].head(1)
    prediction = StockPredictor(settings).predict(ventas, product, proveedores)[0]
    assert prediction.ventas_diarias_media > 0
