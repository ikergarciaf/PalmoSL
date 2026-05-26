import {
  dashboardMetrics,
  emailsData,
  stockData,
  alertasData,
} from './mock'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

export async function fetchDashboard() {
  const fallback = {
    emails_procesados_hoy: dashboardMetrics.emailsProcesadosHoy,
    emails_escalados_hoy: dashboardMetrics.emailsEscaladosHoy,
    productos_en_riesgo: dashboardMetrics.productosEnRiesgo,
    precision_ia: dashboardMetrics.precisionIA,
    total_productos: stockData.length,
    alertas_activas: alertasData.filter(a => !a.leida).length,
    mock_mode: true,
  }
  return apiFetch('/api/dashboard', fallback)
}

export async function fetchEmails(params?: { estado?: string; tipo?: string; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.estado) qs.set('estado', params.estado)
  if (params?.tipo) qs.set('tipo', params.tipo)
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiFetch(`/api/emails?${qs}`, emailsData)
}

export async function triggerEmailRun() {
  try {
    const res = await fetch(`${API_BASE}/api/emails/run`, {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
    })
    return res.ok ? res.json() : { ok: false }
  } catch {
    return { ok: false, error: 'Backend no disponible' }
  }
}

export async function fetchStock() {
  return apiFetch('/api/stock', stockData)
}

export async function triggerStockRun() {
  try {
    const res = await fetch(`${API_BASE}/api/stock/run`, {
      method: 'POST',
      signal: AbortSignal.timeout(60000),
    })
    return res.ok ? res.json() : { ok: false }
  } catch {
    return { ok: false, error: 'Backend no disponible' }
  }
}

export async function fetchAlertas() {
  return apiFetch('/api/alertas', alertasData)
}

export async function fetchConfigStatus() {
  return apiFetch('/api/config/status', {
    mock_mode: true,
    anthropic_api_key_set: false,
    gmail_credentials_set: false,
    csv_ventas_exists: false,
    csv_productos_exists: false,
    hora_ejecucion_stock: '07:30',
    dias_margen_seguridad: 5,
    semanas_historico: 12,
  })
}
