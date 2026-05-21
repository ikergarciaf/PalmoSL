# palmo-ia

Sistema profesional de automatizacion empresarial con inteligencia artificial para **Palmo Suministro Integral**, empresa distribuidora de consumibles de impresion.

El proyecto automatiza dos procesos:

- Atencion automatica de emails mediante IA.
- Prediccion inteligente de stock y alertas de compra.

El sistema funciona aunque todavia no existan datos ni credenciales reales. En ese caso genera datos mock y activa modo simulacion automaticamente.

## Como arrancarlo

Desde PowerShell:

```powershell
cd C:\Users\A8-03m.DTOLEDO.001\palmo-ia
pip install -r requirements.txt
python scheduler.py --run all
```

Para ejecutar por consola:

```powershell
python scheduler.py --run emails
python scheduler.py --run stock
python scheduler.py --run all
python scheduler.py
```

`python scheduler.py` deja el sistema funcionando continuamente: emails cada 10 minutos y stock una vez al dia.

## Estructura

```text
palmo-ia/
├── scheduler.py
├── config.py
├── requirements.txt
├── .env.example
├── data/
│   ├── ventas.csv
│   ├── productos.csv
│   ├── proveedores.json
│   ├── emails_mock.json
│   └── prompts/
├── modulo1_email/
├── modulo2_stock/
├── templates/
└── tests/
```

## Cargar datos reales de la empresa

Cuando la empresa entregue los datos, tienes dos opciones.

1. Prepara tus archivos:

```text
productos.csv
ventas.csv
proveedores.json
```

2. Copialos directamente en `data/` o utiliza los paths configurados en `.env`.
3. Si deseas ejecutar el flujo completo, usa:

```powershell
python scheduler.py --run all
```

4. Para revisar el estado de logs y resultados, inspecciona `logs/` y `data/alertas_stock.csv`.

El sistema crea copias de seguridad automaticas en:

```text
data/backups/
```

Opcion manual: sustituir archivos directamente en:

```text
C:\Users\A8-03m.DTOLEDO.001\palmo-ia\data
```

## Formato de datos

`productos.csv` debe tener:

```csv
sku,nombre,categoria,marca,modelo_impresora,compatible_con,stock_actual,stock_minimo,precio_compra,precio_venta,proveedor_id,activo
```

`ventas.csv` debe tener:

```csv
fecha,sku,cantidad,cliente_id,canal
```

`proveedores.json` debe tener:

```json
[
  {
    "id": "PROV001",
    "nombre": "Proveedor Ejemplo",
    "lead_time_dias": 7,
    "email": "compras@proveedor.com",
    "pedido_minimo": 150.0
  }
]
```

Importante: `productos.csv` usa `proveedor_id`, y ese valor debe existir como `id` en `proveedores.json`.

## Configuracion

Copia `.env.example` a `.env`:

```powershell
copy .env.example .env
```

Variables disponibles:

```env
ANTHROPIC_API_KEY=
GMAIL_CREDENTIALS_FILE=
GMAIL_TOKEN_FILE=
EMAIL_ATENCION_CLIENTE=atencion@palmosuministro.es
EMAIL_ESCALADO=soporte@palmosuministro.es
SHEETS_CREDENTIALS_FILE=
SHEETS_ID=
HORA_EJECUCION_STOCK=07:30
DIAS_MARGEN_SEGURIDAD=5
SEMANAS_HISTORICO=12
CSV_VENTAS=data/ventas.csv
CSV_PRODUCTOS=data/productos.csv
JSON_PROVEEDORES=data/proveedores.json
```

Si una credencial falta, el sistema no se rompe:

- sin `ANTHROPIC_API_KEY`: usa clasificacion y respuestas mock,
- sin Gmail: lee `data/emails_mock.json`,
- sin Sheets: exporta `data/google_sheets_fallback.csv`.

## Modulo 1: emails con IA

Flujo:

1. Lee emails no leidos desde Gmail o mocks.
2. Clasifica con Claude o fallback local.
3. Detecta stock, precio, compatibilidad, estado de pedido, reclamacion o consulta compleja.
4. Busca informacion en `productos.csv`.
5. Genera respuesta profesional en espanol.
6. Escala a humano si hay baja confianza, reclamacion o ambiguedad.

Los prompts editables estan en:

```text
data/prompts/clasificacion.txt
data/prompts/respuesta.txt
```

## Modulo 2: prediccion de stock

El algoritmo calcula:

- media movil ponderada,
- deteccion simple de anomalias,
- dias restantes de stock,
- comparacion contra lead time y margen,
- sugerencia automatica de reposicion.

Salidas:

```text
data/alertas_stock.csv
data/reporte_stock.html
data/google_sheets_fallback.csv
```

## Tests

```powershell
python -m pytest
```

Los tests cubren clasificacion, escalado, busqueda de productos, prediccion y alertas.

## Puesta en produccion

Pasos recomendados:

1. Colocar los datos reales en `data/` o en los paths configurados en `.env`.
2. Crear `.env` con credenciales reales.
3. Probar con `python scheduler.py --run all`.
4. Ejecutar `python -m pytest`.
5. Dejar `python scheduler.py` funcionando como servicio con systemd, supervisor, Docker o Programador de tareas de Windows.

## Roadmap

- Dockerfile y docker-compose.
- Base de datos PostgreSQL.
- API REST con FastAPI.
- Panel de revision humana para emails escalados.
- Busqueda semantica avanzada en catalogo.
- Integracion con ERP.
