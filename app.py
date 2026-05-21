from __future__ import annotations

from datetime import datetime
import logging
from pathlib import Path
from typing import Any

from flask import Flask, render_template, request

from config import LOGGER_NAME, configure_logging, ensure_runtime_files, get_settings
from modulo1_email.gmail_client import GmailClient
from modulo2_stock.alertas import StockAlertService
from modulo2_stock.ingesta import StockDataLoader
from modulo2_stock.prediccion import StockPredictor

app = Flask(__name__, static_folder="static", template_folder="templates")
logger = logging.getLogger(LOGGER_NAME)


def build_dashboard_context(settings: Any) -> dict[str, Any]:
    ensure_runtime_files(settings)
    ventas, productos, proveedores = StockDataLoader(settings).load()
    predictions = StockPredictor(settings).predict(ventas, productos, proveedores)
    alerts = StockAlertService(settings).generate_alerts(predictions, proveedores)

    alert_counts = {"critica": 0, "alta": 0, "media": 0}
    for alert in alerts:
        alert_counts[alert.prioridad] += 1

    emails = GmailClient(settings).fetch_unread_emails(limit=8)
    recent_emails = sorted(emails, key=lambda item: item.received_at, reverse=True)[:6]
    total_sales = int(ventas["cantidad"].sum()) if not ventas.empty else 0
    average_days = round(sum(alert.dias_restantes for alert in alerts) / len(alerts), 1) if alerts else 0

    return {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "total_products": len(productos),
        "total_providers": len(proveedores),
        "total_alerts": len(alerts),
        "critical_alerts": alert_counts["critica"],
        "high_alerts": alert_counts["alta"],
        "medium_alerts": alert_counts["media"],
        "total_sales": total_sales,
        "average_days": average_days,
        "recent_emails": recent_emails,
        "alerts": alerts[:8],
        "active_page": "dashboard",
    }


def build_emails_context(settings: Any) -> dict[str, Any]:
    ensure_runtime_files(settings)
    emails = GmailClient(settings).fetch_unread_emails(limit=20)
    sorted_emails = sorted(emails, key=lambda email: email.received_at, reverse=True)

    return {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "emails": sorted_emails,
        "email_count": len(sorted_emails),
        "active_page": "emails",
    }


def build_stock_context(settings: Any) -> dict[str, Any]:
    ensure_runtime_files(settings)
    ventas, productos, proveedores = StockDataLoader(settings).load()
    predictions = StockPredictor(settings).predict(ventas, productos, proveedores)
    alerts = StockAlertService(settings).generate_alerts(predictions, proveedores)

    return {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "alerts": alerts,
        "products": productos,
        "providers": proveedores,
        "stock_summary": {
            "total_products": len(productos),
            "total_providers": len(proveedores),
            "total_alerts": len(alerts),
            "average_days": round(sum(alert.dias_restantes for alert in alerts) / len(alerts), 1) if alerts else 0,
        },
        "active_page": "stock",
    }


def build_reports_context(settings: Any) -> dict[str, Any]:
    ensure_runtime_files(settings)
    base_dir = settings.base_dir
    return {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "report_files": [
            {
                "name": "Alertas de stock CSV",
                "path": "data/alertas_stock.csv",
                "exists": (base_dir / "data" / "alertas_stock.csv").exists(),
            },
            {
                "name": "Reporte de stock HTML",
                "path": "data/reporte_stock.html",
                "exists": (base_dir / "data" / "reporte_stock.html").exists(),
            },
            {
                "name": "Fallback Google Sheets",
                "path": "data/google_sheets_fallback.csv",
                "exists": (base_dir / "data" / "google_sheets_fallback.csv").exists(),
            },
        ],
        "active_page": "reports",
    }


@app.route("/")
def dashboard() -> str:
    settings = get_settings()
    configure_logging(settings)
    logger.info("Generando dashboard")
    return render_template("dashboard.html", **build_dashboard_context(settings))


@app.route("/emails")
def emails() -> str:
    settings = get_settings()
    configure_logging(settings)
    logger.info("Generando pagina de emails")
    return render_template("emails.html", **build_emails_context(settings))


@app.route("/stock")
def stock() -> str:
    settings = get_settings()
    configure_logging(settings)
    logger.info("Generando pagina de stock")
    return render_template("stock.html", **build_stock_context(settings))


@app.route("/reports")
def reports() -> str:
    settings = get_settings()
    configure_logging(settings)
    logger.info("Generando pagina de informes")
    return render_template("reports.html", **build_reports_context(settings))


@app.route("/health")
def health_check() -> str:
    return "ok"


if __name__ == "__main__":
    settings = get_settings()
    configure_logging(settings)
    app.run(host="0.0.0.0", port=8000)
