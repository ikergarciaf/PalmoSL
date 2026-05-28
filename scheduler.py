"""Scheduler principal de palmo-ia."""

from __future__ import annotations

import argparse
import logging
from typing import Callable

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from config import LOGGER_NAME, configure_logging, ensure_runtime_files, get_settings
from modulo1_email.main import run as run_emails
from modulo2_stock.main import run as run_stock


logger = logging.getLogger(LOGGER_NAME)


def _safe_job(name: str, job: Callable[[], int]) -> None:
    """Ejecuta un job protegiendo el scheduler de excepciones."""

    try:
        logger.info("Inicio job: %s", name)
        result = job()
        logger.info("Fin job: %s | resultado=%s", name, result)
    except Exception:
        logger.exception("Fallo no controlado en job: %s", name)


def start_scheduler() -> None:
    """Arranca APScheduler con emails cada 10 min y stock diario."""

    settings = get_settings()
    configure_logging(settings)
    ensure_runtime_files(settings)

    hour, minute = _parse_hour(settings.hora_ejecucion_stock)
    scheduler = BlockingScheduler(timezone="Europe/Madrid")
    scheduler.add_job(
        lambda: _safe_job("emails", run_emails),
        IntervalTrigger(minutes=10),
        id="emails_cada_10_min",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        lambda: _safe_job("stock", run_stock),
        CronTrigger(hour=hour, minute=minute),
        id="stock_diario",
        replace_existing=True,
        max_instances=1,
    )

    logger.info("Scheduler iniciado: emails cada 10 min, stock diario a las %02d:%02d", hour, minute)
    logger.info("Ejecutando ciclo inicial de comprobacion")
    _safe_job("emails", run_emails)
    _safe_job("stock", run_stock)
    scheduler.start()


def _parse_hour(value: str) -> tuple[int, int]:
    """Parsea HH:MM con fallback a 07:30."""

    try:
        hour, minute = value.split(":", maxsplit=1)
        return int(hour), int(minute)
    except Exception:
        logger.warning("HORA_EJECUCION_STOCK invalida: %s. Usando 07:30", value)
        return 7, 30


def main() -> None:
    """CLI para ejecucion individual o scheduler continuo."""

    parser = argparse.ArgumentParser(description="Automatizacion Palmo IA")
    parser.add_argument(
        "--run",
        choices=["emails", "stock", "all", "scheduler"],
        default="scheduler",
        help="Ejecucion individual o scheduler continuo",
    )
    args = parser.parse_args()

    settings = get_settings()
    configure_logging(settings)
    ensure_runtime_files(settings)

    if args.run == "emails":
        _safe_job("emails", run_emails)
    elif args.run == "stock":
        _safe_job("stock", run_stock)
    elif args.run == "all":
        _safe_job("emails", run_emails)
        _safe_job("stock", run_stock)
    else:
        start_scheduler()


if __name__ == "__main__":
    main()
