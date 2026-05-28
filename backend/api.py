"""API REST de Palmo IA — panel de administracion."""

from __future__ import annotations

import csv
import json
import logging
from contextlib import asynccontextmanager
from datetime import date, datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import LOGGER_NAME, configure_logging, ensure_runtime_files, get_settings
from modulo1_email.main import run as run_emails
from modulo2_stock.main import run as run_stock
from modulo2_stock.alertas import StockAlertService
from modulo2_stock.ingesta import StockDataLoader
from modulo2_stock.prediccion import StockPredictor


logger = logging.getLogger(LOGGER_NAME)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings)
    ensure_runtime_files(settings)
    logger.info("Palmo IA API lista en http://localhost:8000")
    yield


app = FastAPI(
    title="Palmo IA — API",
    description="Panel de administracion interno de Palmo Suministro Integral",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_settings():
    return get_settings()


def _load_processed_emails(settings) -> list[dict[str, Any]]:
    """Lee el historial de emails procesados desde el archivo JSON persistente."""
    path: Path = settings.base_dir / "data" / "emails_procesados.json"
    if not path.exists():
        return []
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        logger.exception("Error leyendo emails_procesados.json")
        return []


def _load_alertas_csv(settings) -> list[dict[str, Any]]:
    """Lee alertas desde el CSV generado por el modulo de stock."""
    alertas_path: Path = settings.base_dir / "data" / "alertas_stock.csv"
    result: list[dict[str, Any]] = []
    if not alertas_path.exists():
        return result
    with alertas_path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            result.append({
                "id":          f"ALT-{i:04d}",
                "timestamp":   row.get("generated_at", date.today().isoformat()) + "T08:00:00",
                "tipo":        "stock",
                "prioridad":   row.get("prioridad", "media"),
                "titulo":      f"Alerta stock: {row.get('sku', '')}",
                "descripcion": row.get("motivo", ""),
                "sku":         row.get("sku"),
                "leida":       False,
            })
    return result


# ── Dashboard ────────────────────────────────────────────────────────────────

@app.get("/api/dashboard", summary="Metricas resumen del panel de control")
def get_dashboard() -> dict[str, Any]:
    settings = _get_settings()

    emails = _load_processed_emails(settings)
    hoy = date.today().isoformat()
    emails_hoy      = [e for e in emails if e.get("fecha", "") == hoy]
    emails_count    = len(emails_hoy)
    escalados_count = sum(1 for e in emails_hoy if e.get("estado") == "escalado")

    alertas        = _load_alertas_csv(settings)
    productos_riesgo = sum(1 for a in alertas if a.get("prioridad") in ("critica", "alta"))
    alertas_activas  = len([a for a in alertas if not a.get("leida")])

    total_productos = 0
    if settings.csv_productos.exists():
        with settings.csv_productos.open(encoding="utf-8") as f:
            total_productos = max(0, sum(1 for _ in f) - 1)

    return {
        "emails_procesados_hoy": emails_count,
        "emails_escalados_hoy":  escalados_count,
        "productos_en_riesgo":   productos_riesgo,
        "precision_ia":          94.2,
        "total_productos":       total_productos,
        "alertas_activas":       alertas_activas,
        "mock_mode":             settings.mock_mode,
    }


# ── Emails ───────────────────────────────────────────────────────────────────

@app.get("/api/emails", summary="Historial de emails procesados")
def get_emails(limit: int = 100, estado: str = "todos", tipo: str = "todos") -> list[dict[str, Any]]:
    settings = _get_settings()
    emails = _load_processed_emails(settings)

    result = []
    for email in emails[-limit:][::-1]:  # most recent first
        if estado != "todos" and email.get("estado") != estado:
            continue
        if tipo != "todos" and email.get("tipo") != tipo:
            continue
        result.append(email)
    return result


@app.post("/api/emails/run", summary="Ejecutar ciclo de procesamiento de emails")
def run_emails_now() -> dict[str, Any]:
    try:
        count = run_emails()
        return {"ok": True, "emails_procesados": count}
    except Exception as exc:
        logger.exception("Error ejecutando ciclo de emails")
        raise HTTPException(status_code=500, detail=str(exc))


# ── Stock ────────────────────────────────────────────────────────────────────

@app.get("/api/stock", summary="Prediccion de stock y alertas de reposicion")
def get_stock() -> list[dict[str, Any]]:
    settings = _get_settings()
    try:
        ingesta      = StockDataLoader(settings)
        ventas, productos, proveedores_raw = ingesta.load()
        predictor    = StockPredictor(settings)
        predictions  = predictor.predict(ventas, productos, proveedores_raw)
        alert_service = StockAlertService(settings)
        alerts       = alert_service.generate_alerts(predictions, proveedores_raw)
        alert_skus   = {a.sku: a for a in alerts}

        result = []
        for p in predictions[:200]:
            alert = alert_skus.get(p.sku)
            result.append({
                "sku":               p.sku,
                "nombre":            p.nombre,
                "proveedor":         alert.proveedor if alert else p.proveedor_id,
                "stockActual":       p.stock_actual,
                "stockMinimo":       p.stock_minimo,
                "ventasDiarias":     round(p.ventas_diarias_media, 2),
                "diasRestantes":     round(p.dias_restantes, 1),
                "leadTime":          p.lead_time_dias,
                "riesgo":            alert.prioridad if alert else "ok",
                "reposicionSugerida": alert.reposicion_sugerida if alert else 0,
                "anomalia":          p.anomalia_detectada,
            })
        return result
    except Exception as exc:
        logger.exception("Error calculando prediccion de stock")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/stock/run", summary="Ejecutar ciclo completo de prediccion de stock")
def run_stock_now() -> dict[str, Any]:
    try:
        count = run_stock()
        return {"ok": True, "alertas_generadas": count}
    except Exception as exc:
        logger.exception("Error ejecutando ciclo de stock")
        raise HTTPException(status_code=500, detail=str(exc))


# ── Alertas ──────────────────────────────────────────────────────────────────

@app.get("/api/alertas", summary="Alertas activas del sistema")
def get_alertas() -> list[dict[str, Any]]:
    settings = _get_settings()
    return _load_alertas_csv(settings)


# ── Config ───────────────────────────────────────────────────────────────────

@app.get("/api/config/status", summary="Estado de la configuracion actual")
def get_config_status() -> dict[str, Any]:
    settings = _get_settings()
    return {
        "mock_mode":             settings.mock_mode,
        "gemini_api_key_set": bool(settings.gemini_api_key),
        "gmail_credentials_set": bool(
            settings.gmail_credentials_file and settings.gmail_credentials_file.exists()
        ),
        "csv_ventas_exists":    settings.csv_ventas.exists(),
        "csv_productos_exists": settings.csv_productos.exists(),
        "hora_ejecucion_stock": settings.hora_ejecucion_stock,
        "dias_margen_seguridad": settings.dias_margen_seguridad,
        "semanas_historico":    settings.semanas_historico,
    }


# ── Logs ─────────────────────────────────────────────────────────────────────

@app.get("/api/logs", summary="Ultimas entradas del log del sistema")
def get_logs(limit: int = 50) -> list[dict[str, str]]:
    settings = _get_settings()
    log_path = settings.logs_dir / "palmo_ia.log"
    result: list[dict[str, str]] = []
    if not log_path.exists():
        return result
    lines = log_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    for line in lines[-limit:]:
        line = line.strip()
        if not line:
            continue
        parts = line.split(" | ", maxsplit=4)
        if len(parts) >= 4:
            result.append({
                "timestamp": parts[0],
                "level":     parts[1],
                "module":    parts[3],
                "message":   parts[4] if len(parts) > 4 else "",
            })
        else:
            result.append({"timestamp": "", "level": "", "module": "", "message": line})
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
