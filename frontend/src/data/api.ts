import {
  dashboardMetrics,
  emailsData,
  stockData,
  alertasData,
} from './mock'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string, fallback: T, timeoutMs = 8000): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

// ── Dashboard ─────────────────────────────────────────────────────
export async function fetchDashboard() {
  const fallback = {
    emails_procesados_hoy:  dashboardMetrics.emailsProcesadosHoy,
    emails_escalados_hoy:   dashboardMetrics.emailsEscaladosHoy,
    productos_en_riesgo:    dashboardMetrics.productosEnRiesgo,
    precision_ia:           dashboardMetrics.precisionIA,
    total_productos:        stockData.length,
    alertas_activas:        alertasData.filter(a => !a.leida).length,
    mock_mode:              true,
  }
  return apiFetch('/api/dashboard', fallback)
}

// ── Emails ────────────────────────────────────────────────────────
export async function fetchEmails(params?: { estado?: string; tipo?: string; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.estado) qs.set('estado', params.estado)
  if (params?.tipo)   qs.set('tipo',   params.tipo)
  if (params?.limit)  qs.set('limit',  String(params.limit))
  const path = `/api/emails${qs.toString() ? '?' + qs : ''}`
  return apiFetch(path, emailsData)
}

export async function triggerEmailRun(): Promise<{ ok: boolean; emails_procesados?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/emails/run`, {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
    })
    return res.ok ? res.json() : { ok: false, error: `HTTP ${res.status}` }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Backend no disponible' }
  }
}

// ── Stock ─────────────────────────────────────────────────────────
export async function fetchStock() {
  return apiFetch('/api/stock', stockData)
}

export async function triggerStockRun(): Promise<{ ok: boolean; alertas_generadas?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/stock/run`, {
      method: 'POST',
      signal: AbortSignal.timeout(60000),
    })
    return res.ok ? res.json() : { ok: false, error: `HTTP ${res.status}` }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Backend no disponible' }
  }
}

// ── Alertas ───────────────────────────────────────────────────────
export async function fetchAlertas() {
  return apiFetch('/api/alertas', alertasData)
}

// ── Config ────────────────────────────────────────────────────────
export async function fetchConfigStatus() {
  return apiFetch('/api/config/status', {
    mock_mode:               true,
    anthropic_api_key_set:   false,
    gmail_credentials_set:   false,
    csv_ventas_exists:       false,
    csv_productos_exists:    false,
    hora_ejecucion_stock:    '07:30',
    dias_margen_seguridad:   5,
    semanas_historico:       12,
  })
}

// ── Logs ──────────────────────────────────────────────────────────
export async function fetchLogs(limit = 50) {
  return apiFetch(`/api/logs?limit=${limit}`, [] as { timestamp: string; level: string; module: string; message: string }[])
}
