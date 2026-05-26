"""Reporting HTML y CSV para alertas de stock."""

from __future__ import annotations

import logging
from dataclasses import asdict

import pandas as pd
from jinja2 import Environment, FileSystemLoader, select_autoescape

from config import LOGGER_NAME, Settings
from modulo2_stock.models import StockAlert
from modulo2_stock.utils import export_dataframe


logger = logging.getLogger(LOGGER_NAME)


class StockReporter:
    """Genera salidas de reporting para compras."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.env = Environment(
            loader=FileSystemLoader(str(settings.templates_dir)),
            autoescape=select_autoescape(["html"]),
        )

    def alerts_to_dataframe(self, alerts: list[StockAlert]) -> pd.DataFrame:
        """Convierte alertas en tabla."""

        return pd.DataFrame([asdict(alert) for alert in alerts])

    def export_csv(self, alerts: list[StockAlert]) -> pd.DataFrame:
        """Exporta alertas a CSV local."""

        frame = self.alerts_to_dataframe(alerts)
        export_dataframe(frame, self.settings.base_dir / "data" / "alertas_stock.csv")
        return frame

    def export_html(self, alerts: list[StockAlert]) -> str:
        """Genera email HTML de alertas."""

        template = self.env.get_template("alerta_stock.html")
        html = template.render(alertas=alerts)
        output = self.settings.base_dir / "data" / "reporte_stock.html"
        output.write_text(html, encoding="utf-8")
        logger.info("Reporte HTML generado: %s", output)
        return html
