"""Configuracion centralizada y datos mock para palmo-ia."""

from __future__ import annotations

import json
import logging
import os
import random
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
LOGGER_NAME = "palmo_ia"
logger = logging.getLogger(LOGGER_NAME)


@dataclass(frozen=True)
class Settings:
    """Valores de configuracion de la aplicacion."""

    base_dir: Path
    gemini_api_key: str | None
    gmail_credentials_file: Path | None
    gmail_token_file: Path | None
    email_atencion_cliente: str
    email_escalado: str
    email_compras: str
    sheets_credentials_file: Path | None
    sheets_id: str | None
    hora_ejecucion_stock: str
    dias_margen_seguridad: int
    semanas_historico: int
    csv_ventas: Path
    csv_productos: Path
    json_proveedores: Path
    emails_mock: Path
    prompts_dir: Path
    logs_dir: Path
    templates_dir: Path
    mock_mode: bool


def _resolve_path(value: str | None) -> Path | None:
    """Resuelve rutas relativas al directorio del proyecto."""

    if not value:
        return None
    path = Path(value)
    return path if path.is_absolute() else BASE_DIR / path


def get_settings() -> Settings:
    """Carga variables de entorno y devuelve un objeto de configuracion."""

    load_dotenv(BASE_DIR / ".env")
    gemini_key = os.getenv("GEMINI_API_KEY") or None
    gmail_credentials = _resolve_path(os.getenv("GMAIL_CREDENTIALS_FILE"))
    sheets_credentials = _resolve_path(os.getenv("SHEETS_CREDENTIALS_FILE"))
    sheets_id = os.getenv("SHEETS_ID") or None
    mock_mode = not gemini_key

    return Settings(
        base_dir=BASE_DIR,
        gemini_api_key=gemini_key,
        gmail_credentials_file=gmail_credentials,
        gmail_token_file=_resolve_path(os.getenv("GMAIL_TOKEN_FILE")),
        email_atencion_cliente=os.getenv("EMAIL_ATENCION_CLIENTE", "atencion@palmosuministro.es"),
        email_escalado=os.getenv("EMAIL_ESCALADO", "soporte@palmosuministro.es"),
        email_compras=os.getenv("EMAIL_COMPRAS", "compras@palmosuministro.es"),
        sheets_credentials_file=sheets_credentials,
        sheets_id=sheets_id,
        hora_ejecucion_stock=os.getenv("HORA_EJECUCION_STOCK", "07:30"),
        dias_margen_seguridad=int(os.getenv("DIAS_MARGEN_SEGURIDAD", "5")),
        semanas_historico=int(os.getenv("SEMANAS_HISTORICO", "12")),
        csv_ventas=_resolve_path(os.getenv("CSV_VENTAS", "data/ventas.csv")) or BASE_DIR / "data/ventas.csv",
        csv_productos=_resolve_path(os.getenv("CSV_PRODUCTOS", "data/productos.csv"))
        or BASE_DIR / "data/productos.csv",
        json_proveedores=_resolve_path(os.getenv("JSON_PROVEEDORES", "data/proveedores.json"))
        or BASE_DIR / "data/proveedores.json",
        emails_mock=_resolve_path(os.getenv("EMAILS_MOCK", "data/emails_mock.json"))
        or BASE_DIR / "data/emails_mock.json",
        prompts_dir=BASE_DIR / "data" / "prompts",
        logs_dir=BASE_DIR / "logs",
        templates_dir=BASE_DIR / "templates",
        mock_mode=mock_mode,
    )


def configure_logging(settings: Settings | None = None) -> logging.Logger:
    """Configura logging de consola y fichero para toda la aplicacion."""

    resolved = settings or get_settings()
    resolved.logs_dir.mkdir(parents=True, exist_ok=True)
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(module)s:%(lineno)d | %(message)s"
    )
    file_handler = logging.FileHandler(resolved.logs_dir / "palmo_ia.log", encoding="utf-8")
    file_handler.setFormatter(formatter)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    return logger


def ensure_runtime_files(settings: Settings | None = None) -> None:
    """Crea directorios y datos funcionales si faltan."""

    resolved = settings or get_settings()
    for directory in [
        resolved.logs_dir,
        resolved.csv_productos.parent,
        resolved.csv_ventas.parent,
        resolved.prompts_dir,
        resolved.templates_dir,
    ]:
        directory.mkdir(parents=True, exist_ok=True)

    excel_path = resolved.base_dir / "data" / "stock_real.xlsx"
    excel_imported = False
    if excel_path.exists():
        try:
            from modulo2_stock.excel_importer import run_import as excel_import
            excel_imported = excel_import(excel_path, resolved.csv_productos.parent)
        except Exception:
            logger.exception("Error importando Excel real; usando datos mock")

    if not excel_imported:
        if _csv_needs_generation(resolved.csv_productos, minimum_rows=500):
            _generate_products(resolved.csv_productos, resolved.json_proveedores)
        if _csv_needs_generation(resolved.csv_ventas, minimum_rows=5000):
            _generate_sales(resolved.csv_ventas, resolved.csv_productos)
        if _json_needs_generation(resolved.json_proveedores, minimum_items=8):
            _generate_providers(resolved.json_proveedores)

    if _json_needs_generation(resolved.emails_mock, minimum_items=10):
        _generate_mock_emails(resolved.emails_mock)

    _create_prompt_file(resolved.prompts_dir / "clasificacion.txt", _DEFAULT_CLASSIFICATION_PROMPT)
    _create_prompt_file(resolved.prompts_dir / "respuesta.txt", _DEFAULT_RESPONSE_PROMPT)
    _create_template_file(resolved.templates_dir / "email_respuesta.html", _DEFAULT_EMAIL_RESPONSE_TEMPLATE)
    _create_template_file(resolved.templates_dir / "alerta_stock.html", _DEFAULT_ALERTA_STOCK_TEMPLATE)


def _csv_needs_generation(path: Path, minimum_rows: int) -> bool:
    """Indica si un CSV falta, esta vacio o no tiene suficientes filas."""

    if not path.exists() or path.stat().st_size == 0:
        return True
    try:
        return len(pd.read_csv(path)) < minimum_rows
    except Exception:
        return True


def _json_needs_generation(path: Path, minimum_items: int) -> bool:
    """Indica si un JSON falta o no contiene suficientes elementos."""

    if not path.exists() or path.stat().st_size == 0:
        return True
    try:
        with path.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        return not isinstance(data, list) or len(data) < minimum_items
    except Exception:
        return True


def _generate_providers(path: Path) -> list[dict[str, Any]]:
    """Genera proveedores simulados."""

    providers = [
        {
            "id": f"PROV{i:03d}",
            "nombre": name,
            "lead_time_dias": lead_time,
            "email": email,
            "pedido_minimo": float(minimum),
        }
        for i, (name, lead_time, email, minimum) in enumerate(
            [
                ("IberToner Mayoristas", 6, "compras@ibertoner.example", 150),
                ("PrintEuropa Distribucion", 9, "pedidos@printeuropa.example", 250),
                ("Consumibles Levante", 4, "ventas@consumibleslevante.example", 100),
                ("LaserParts Iberia", 12, "supply@laserparts.example", 300),
                ("OfiInk Central", 7, "operaciones@ofiink.example", 180),
                ("TonerPro Canal", 5, "canal@tonerpro.example", 120),
                ("Repuestos PrintMax", 10, "orders@printmax.example", 220),
                ("Distribuciones Grafica Sur", 8, "compras@graficasur.example", 160),
            ],
            start=1,
        )
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(providers, ensure_ascii=True, indent=2), encoding="utf-8")
    return providers


def _generate_products(products_path: Path, providers_path: Path) -> None:
    """Genera 500 productos de impresion con stock y precios realistas."""

    if providers_path.exists() and providers_path.stat().st_size > 0:
        try:
            with providers_path.open("r", encoding="utf-8") as fh:
                providers = json.load(fh)
        except Exception:
            providers = _generate_providers(providers_path)
    else:
        providers = _generate_providers(providers_path)

    random.seed(42)
    np.random.seed(42)
    marcas = ["HP", "Brother", "Canon", "Epson", "Samsung", "Lexmark", "Xerox", "Kyocera"]
    categorias = ["toner", "tinta", "tambor", "fusor", "cinta", "kit mantenimiento"]
    colores = ["negro", "cyan", "magenta", "amarillo", "tricolor"]
    rows: list[dict[str, Any]] = []

    for index in range(1, 501):
        marca = random.choice(marcas)
        categoria = random.choice(categorias)
        color = random.choice(colores)
        serie = random.randint(100, 999)
        sku = f"PAL-{marca[:2].upper()}-{categoria[:3].upper()}-{index:04d}"
        coste = round(random.uniform(8.0, 130.0), 2)
        margen = random.uniform(1.22, 1.65)
        stock_minimo = random.randint(5, 40)
        stock_actual = max(0, int(np.random.normal(stock_minimo * 3, stock_minimo)))
        proveedor = random.choice(providers)
        rows.append(
            {
                "sku": sku,
                "nombre": f"{categoria.title()} compatible {marca} {serie} {color}",
                "categoria": categoria,
                "marca": marca,
                "modelo_impresora": f"{marca} LaserJet {serie}",
                "compatible_con": f"{marca} {serie}, {marca} {serie + 1}, {marca} {serie + 2}",
                "stock_actual": stock_actual,
                "stock_minimo": stock_minimo,
                "precio_compra": coste,
                "precio_venta": round(coste * margen, 2),
                "proveedor_id": proveedor["id"],
                "activo": True,
            }
        )

    pd.DataFrame(rows).to_csv(products_path, index=False)


def _generate_sales(sales_path: Path, products_path: Path) -> None:
    """Genera ventas simuladas para 24 meses."""

    products = pd.read_csv(products_path)
    rng = np.random.default_rng(43)
    start = date.today().replace(day=1) - timedelta(days=730)
    end = date.today()
    dates = pd.date_range(start=start, end=end, freq="D")
    rows: list[dict[str, Any]] = []
    canales = ["email", "telefono", "web", "comercial"]

    sampled_products = products.sample(n=min(500, len(products)), random_state=44)
    for _, product in sampled_products.iterrows():
        base_demand = rng.uniform(0.03, 1.8)
        seasonality = rng.uniform(0.7, 1.35)
        for current in dates:
            if rng.random() > min(0.85, base_demand / 2.2):
                continue
            month_factor = 1.0 + 0.18 * np.sin((current.month / 12.0) * 2 * np.pi) * seasonality
            quantity = int(max(1, rng.poisson(max(0.2, base_demand * 3 * month_factor))))
            if rng.random() < 0.01:
                quantity *= int(rng.integers(3, 8))
            rows.append(
                {
                    "fecha": current.date().isoformat(),
                    "sku": product["sku"],
                    "cantidad": quantity,
                    "cliente_id": f"CLI{int(rng.integers(1, 180)):04d}",
                    "canal": random.choice(canales),
                }
            )

    pd.DataFrame(rows).to_csv(sales_path, index=False)


def _generate_mock_emails(path: Path) -> None:
    """Genera emails simulados para el modulo de atencion."""

    now = datetime.now().replace(microsecond=0)
    templates = [
        (
            "Stock toner HP 415A",
            "Necesitamos 20 unidades de toner compatible HP 415A negro. Confirmad stock y plazo.",
        ),
        (
            "Precio para distribuidor",
            "Buenos dias, podeis indicarnos precio neto del tambor Brother DR2400 para 12 unidades?",
        ),
        (
            "Compatibilidad Epson",
            "El cartucho PAL-EP-TIN-0012 sirve para Epson Workforce 2760?",
        ),
        (
            "Estado pedido 45891",
            "Solicito estado del pedido 45891 realizado la semana pasada.",
        ),
        (
            "Reclamacion material defectuoso",
            "Hemos recibido varios toners con fuga de polvo. Necesitamos solucion urgente.",
        ),
        (
            "Consulta varias referencias",
            "Necesito alternativa para equipos HP, Canon y Brother con entrega esta semana.",
        ),
        (
            "Disponibilidad Canon",
            "Teneis stock de tinta Canon 545 negro? Necesito 35 unidades.",
        ),
        (
            "Presupuesto mensual",
            "Enviadnos presupuesto para 80 unidades de consumibles mixtos para oficina.",
        ),
        (
            "Incidencia factura",
            "La factura del pedido 46210 no coincide con las unidades recibidas.",
        ),
        (
            "Reposicion urgente",
            "Necesitamos toner Kyocera compatible antes del viernes. Indicad opciones disponibles.",
        ),
    ]
    emails = [
        {
            "id": f"mock-{idx:03d}",
            "from_email": f"cliente{idx}@distribuidor.example",
            "subject": subject,
            "body": body,
            "received_at": (now - timedelta(minutes=idx * 17)).isoformat(),
        }
        for idx, (subject, body) in enumerate(templates, start=1)
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(emails, ensure_ascii=True, indent=2), encoding="utf-8")


_DEFAULT_CLASSIFICATION_PROMPT = """Eres un asistente de clasificacion para Palmo Suministro Integral, distribuidora de consumibles de impresion.

Clasifica el email del cliente en una de estas categorias:
- stock
- precio
- compatibilidad
- estado_pedido
- reclamacion
- consulta_compleja

Devuelve exclusivamente JSON valido con:
{
  "categoria": "...",
  "confianza": 0.0,
  "motivo": "...",
  "entidades": {
    "sku": null,
    "producto": null,
    "cantidad": null,
    "pedido": null
  },
  "ambigua": false
}

Email:
Asunto: {{ subject }}
Cuerpo: {{ body }}
"""


_DEFAULT_RESPONSE_PROMPT = """Eres el equipo de atencion al cliente de Palmo Suministro Integral.

Redacta una respuesta profesional, clara y cordial en espanol para un distribuidor.
Usa el contexto de producto proporcionado. No inventes datos que no aparezcan.
Si falta informacion critica, indica que un asesor revisara el caso.

Datos del email:
Asunto: {{ subject }}
Cuerpo: {{ body }}

Clasificacion:
{{ classification }}

Contexto de producto:
{{ product_context }}
"""


_DEFAULT_EMAIL_RESPONSE_TEMPLATE = """Estimado/a cliente:

{{ cuerpo }}

Quedamos a su disposicion para cualquier aclaracion adicional.

Atentamente,
Equipo de Atencion al Cliente
Palmo Suministro Integral
"""


_DEFAULT_ALERTA_STOCK_TEMPLATE = """<!doctype html>
<html lang=\"es\">
  <head>
    <meta charset=\"utf-8\">
    <title>Alertas de stock - Palmo Suministro Integral</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 24px; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      p { color: #4b5563; }
      table { border-collapse: collapse; width: 100%; margin-top: 18px; }
      th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 13px; }
      th { background: #f3f4f6; }
      .critica { color: #b91c1c; font-weight: 700; }
      .alta { color: #c2410c; font-weight: 700; }
      .media { color: #92400e; font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>Alertas de stock</h1>
    <p>Resumen automatico generado para compras de Palmo Suministro Integral.</p>
    <table>
      <thead>
        <tr>
          <th>Prioridad</th>
          <th>SKU</th>
          <th>Producto</th>
          <th>Proveedor</th>
          <th>Stock</th>
          <th>Dias restantes</th>
          <th>Lead time</th>
          <th>Reposicion sugerida</th>
        </tr>
      </thead>
      <tbody>
        {% for alerta in alertas %}
        <tr>
          <td class=\"{{ alerta.prioridad }}\">{{ alerta.prioridad|upper }}</td>
          <td>{{ alerta.sku }}</td>
          <td>{{ alerta.nombre }}</td>
          <td>{{ alerta.proveedor }}</td>
          <td>{{ alerta.stock_actual }}</td>
          <td>{{ "%.1f"|format(alerta.dias_restantes) }}</td>
          <td>{{ alerta.lead_time_dias }}</td>
          <td>{{ alerta.reposicion_sugerida }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </body>
</html>
"""


def _create_prompt_file(path: Path, content: str) -> None:
    """Crea un prompt default si no existe."""

    if path.exists() and path.stat().st_size > 0:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _create_template_file(path: Path, content: str) -> None:
    """Crea una plantilla default si no existe."""

    if path.exists() and path.stat().st_size > 0:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
