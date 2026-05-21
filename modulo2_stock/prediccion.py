"""Algoritmos de prediccion de roturas de stock."""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

import numpy as np
import pandas as pd

from config import LOGGER_NAME, Settings
from modulo2_stock.models import StockPrediction
from modulo2_stock.utils import safe_divide


logger = logging.getLogger(LOGGER_NAME)


class StockPredictor:
    """Calcula demanda media ponderada, anomalias y reposicion."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def predict(
        self,
        ventas: pd.DataFrame,
        productos: pd.DataFrame,
        proveedores: list[dict[str, Any]],
    ) -> list[StockPrediction]:
        """Genera predicciones por producto."""

        provider_lead_times = {str(p["id"]): int(p["lead_time_dias"]) for p in proveedores}
        end_date = ventas["fecha"].max()
        start_date = end_date - timedelta(weeks=self.settings.semanas_historico)
        recent_sales = ventas[ventas["fecha"] >= start_date]

        predictions: list[StockPrediction] = []
        for product in productos.to_dict(orient="records"):
            sku = str(product["sku"])
            product_sales = recent_sales[recent_sales["sku"] == sku]
            daily_average = self._weighted_daily_average(product_sales)
            anomaly = self._has_recent_anomaly(ventas[ventas["sku"] == sku])
            stock_actual = int(product["stock_actual"])
            dias_restantes = safe_divide(stock_actual, daily_average)
            lead_time = provider_lead_times.get(str(product["proveedor_id"]), 7)
            target_days = lead_time + self.settings.dias_margen_seguridad + 30
            suggested = max(0, int(np.ceil((target_days * daily_average) - stock_actual)))
            predictions.append(
                StockPrediction(
                    sku=sku,
                    nombre=str(product["nombre"]),
                    proveedor_id=str(product["proveedor_id"]),
                    stock_actual=stock_actual,
                    stock_minimo=int(product["stock_minimo"]),
                    ventas_diarias_media=round(daily_average, 4),
                    dias_restantes=round(dias_restantes, 2),
                    lead_time_dias=lead_time,
                    anomalia_detectada=anomaly,
                    reposicion_sugerida=suggested,
                )
            )
        logger.info("Predicciones generadas: %s", len(predictions))
        return predictions

    @staticmethod
    def _weighted_daily_average(product_sales: pd.DataFrame) -> float:
        """Calcula media movil ponderada semanal."""

        if product_sales.empty:
            return 0.0
        weekly = (
            product_sales.set_index("fecha")
            .resample("W")["cantidad"]
            .sum()
            .tail(12)
            .reset_index(drop=True)
        )
        if weekly.empty:
            return 0.0
        weights = np.arange(1, len(weekly) + 1, dtype=float)
        weighted_weekly = float(np.average(weekly.to_numpy(dtype=float), weights=weights))
        return weighted_weekly / 7.0

    @staticmethod
    def _has_recent_anomaly(product_sales: pd.DataFrame) -> bool:
        """Detecta picos simples en ventas semanales recientes."""

        if len(product_sales) < 8:
            return False
        weekly = product_sales.set_index("fecha").resample("W")["cantidad"].sum().tail(16)
        if len(weekly) < 8:
            return False
        historical = weekly.iloc[:-1]
        std = float(historical.std(ddof=0))
        if std == 0:
            return False
        return bool(weekly.iloc[-1] > historical.mean() + 3 * std)
