# Palmo IA

Sistema de automatización inteligente para **Palmo Suministro Integral**.

Automatiza la gestión de emails de clientes y la predicción de stock.

---

## Inicio rápido

### Windows (PowerShell)
```powershell
cd palmo-ia-monorepo
.\run.ps1
```

### Mac / Linux
```bash
cd palmo-ia-monorepo
bash run.sh
```

Abre el navegador en **http://localhost:5173**

---

## Estructura

```
palmo-ia-monorepo/
├── backend/               # Python — lógica de IA y API
│   ├── api.py             # API REST (FastAPI)
│   ├── scheduler.py       # Planificador automático
│   ├── config.py          # Configuración centralizada
│   ├── modulo1_email/     # Clasificación y respuesta de emails
│   ├── modulo2_stock/     # Predicción de stock y alertas
│   ├── data/              # CSV, JSON, prompts, logs
│   ├── templates/         # Plantillas HTML de emails
│   └── requirements.txt
├── frontend/              # React — panel de control web
│   └── src/
│       ├── pages/         # Dashboard, Emails, Stock, Alertas, Manual
│       ├── components/    # UI reutilizable
│       └── data/          # API client + mock data
├── run.ps1                # Arranque Windows
└── run.sh                 # Arranque Mac/Linux
```

---

## Configuración

Copia `backend/.env.example` → `backend/.env` y rellena:

| Variable | Descripción |
|---|---|
| `GEMINI_API_KEY` | Clave de Google Gemini (opcional — sin ella usa modo demo) |
| `GMAIL_CREDENTIALS_FILE` | Credenciales Gmail OAuth2 |
| `EMAIL_ATENCION_CLIENTE` | Dirección de envío al cliente |
| `EMAIL_ESCALADO` | Dirección para emails escalados |
| `EMAIL_COMPRAS` | Dirección para alertas de stock |
| `HORA_EJECUCION_STOCK` | Hora análisis de stock diario (HH:MM) |
| `DIAS_MARGEN_SEGURIDAD` | Días extra sobre lead time |

---

## Arranque manual (paso a paso)

**Backend API:**
```bash
cd backend
pip install -r requirements.txt
python api.py
# → http://localhost:8000
# → http://localhost:8000/docs  (documentación interactiva)
```

**Scheduler automático** (emails cada 10min + stock diario):
```bash
cd backend
python scheduler.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Tests

```bash
cd backend
pytest tests/ -v
```

---

## Modo demo

Si no hay `GEMINI_API_KEY` configurada, el sistema arranca en **modo demo**:
- La IA usa clasificación por reglas de palabras clave
- Los emails se leen desde `data/emails_mock.json`
- El stock se calcula con datos sintéticos generados automáticamente
- Todo el panel funciona con normalidad

