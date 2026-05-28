import { useState, useEffect } from 'react'
import { Mail, Package, Bell, Play, RefreshCw, CheckCircle, Activity } from 'lucide-react'
import { MetricCard, Card, Badge, SectionHeader, TableWrapper, Th, Td, Skeleton, ConfianzaBar, Toast } from '../components/ui'
import { fetchDashboard, triggerEmailRun, triggerStockRun } from '../data/api'
import { emailsData, stockData, alertasData } from '../data/mock'

interface DashboardData {
  emails_procesados_hoy: number
  emails_escalados_hoy:  number
  productos_en_riesgo:   number
  precision_ia:          number
  total_productos:       number
  alertas_activas:       number
  mock_mode:             boolean
}

type ToastState = { message: string; variant: 'success' | 'error' | 'info' } | null

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<'idle' | 'emails' | 'stock'>('idle')
  const [lastRunEmail, setLastRunEmail] = useState<string | null>(null)
  const [toast, setToast]     = useState<ToastState>(null)

  const showToast = (message: string, variant: 'success' | 'error' | 'info') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3500)
  }

  const load = () => fetchDashboard().then(d => { setData(d as DashboardData); setLoading(false) })

  useEffect(() => { load() }, [])

  const runEmails = async () => {
    setRunning('emails')
    const res = await triggerEmailRun()
    setRunning('idle')
    if (res.ok) {
      setLastRunEmail(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
      showToast(`${res.emails_procesados ?? 0} emails procesados`, 'success')
    } else {
      showToast(res.error ?? 'Error al procesar emails', 'error')
    }
    load()
  }

  const runStock = async () => {
    setRunning('stock')
    const res = await triggerStockRun()
    setRunning('idle')
    if (res.ok) {
      showToast(`${res.alertas_generadas ?? 0} alertas generadas`, 'success')
    } else {
      showToast(res.error ?? 'Error al calcular stock', 'error')
    }
    load()
  }

  const m = data
  const recentEmails   = emailsData.slice(0, 4)
  const recentAlertas  = alertasData.filter(a => !a.leida).slice(0, 4)

  return (
    <div className="max-w-[1200px] mx-auto">

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 mb-5">
        <button
          onClick={runEmails}
          disabled={running === 'emails'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-white border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-50 transition-colors"
        >
          <Play size={11} className={running === 'emails' ? 'animate-pulse' : ''} />
          {running === 'emails' ? 'Procesando...' : 'Procesar emails'}
        </button>
        <button
          onClick={runStock}
          disabled={running === 'stock'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-stone-900 text-white rounded-md hover:bg-stone-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={11} className={running === 'stock' ? 'animate-spin' : ''} />
          {running === 'stock' ? 'Calculando...' : 'Calcular stock'}
        </button>
      </div>

      {/* KPI row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-lg p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
          <MetricCard label="Emails procesados" value={m?.emails_procesados_hoy ?? '-'} sub={lastRunEmail ? `último: ${lastRunEmail}` : 'hoy'} />
          <MetricCard label="Escalados"   value={m?.emails_escalados_hoy ?? '-'} sub="requieren atención"
            accent={(m?.emails_escalados_hoy ?? 0) > 8 ? 'warning' : 'default'} />
          <MetricCard label="En riesgo"   value={m?.productos_en_riesgo ?? '-'}  sub="críticos + altos"
            accent={(m?.productos_en_riesgo ?? 0) > 10 ? 'danger' : 'warning'} />
          <MetricCard label="Precisión IA" value={m ? `${m.precision_ia}%` : '-'} sub="últimas 500" accent="success" />
          <MetricCard label="Alertas activas" value={m?.alertas_activas ?? '-'}  sub="sin leer"
            accent={(m?.alertas_activas ?? 0) > 0 ? 'warning' : 'default'} />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Recent emails */}
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <SectionHeader title="Últimos emails" />
            <span className="text-[11px] text-stone-400">
              <CheckCircle size={11} className="inline mr-1 text-emerald-500" />
              {recentEmails.filter(e => e.estado === 'respondido').length} respondidos
            </span>
          </div>
          <TableWrapper>
            <thead>
              <tr>
                <Th>Hora</Th>
                <Th>Cliente</Th>
                <Th>Tipo</Th>
                <Th>Confianza</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {recentEmails.map(email => (
                <tr key={email.id} className="hover:bg-stone-50/60 transition-colors">
                  <Td className="text-stone-400 font-mono text-[11px]">{email.hora}</Td>
                  <Td>
                    <p className="font-medium text-stone-800 text-[12px]">{email.cliente}</p>
                    <p className="text-[10px] text-stone-400">{email.empresa}</p>
                  </Td>
                  <Td><CategoriaBadge tipo={email.tipo} /></Td>
                  <Td><ConfianzaBar value={email.confianza} /></Td>
                  <Td><EstadoBadge estado={email.estado} /></Td>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        </Card>

        {/* Active alerts */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <SectionHeader title="Alertas activas" />
            <Badge variant="danger">{recentAlertas.length} sin leer</Badge>
          </div>
          <div className="divide-y divide-stone-50">
            {recentAlertas.length === 0 && (
              <div className="px-4 py-8 text-center text-[12px] text-stone-400">
                No hay alertas pendientes
              </div>
            )}
            {recentAlertas.map(alerta => (
              <div key={alerta.id} className="px-4 py-3 hover:bg-stone-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[12px] font-medium text-stone-800 truncate">{alerta.titulo}</p>
                  <PrioridadBadge prioridad={alerta.prioridad} />
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">{alerta.descripcion}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Package,  label: 'Stock',   value: m?.total_productos ?? '-', sub: 'SKUs monitorizados',
            extra: `${stockData.filter(s => s.riesgo === 'critica').length} críticos · ${stockData.filter(s => s.riesgo === 'alta').length} altos` },
          { icon: Mail,     label: 'Emails',  value: m?.emails_procesados_hoy ?? '-', sub: 'procesados hoy',
            extra: m ? `${((m.emails_procesados_hoy - m.emails_escalados_hoy) / Math.max(m.emails_procesados_hoy, 1) * 100).toFixed(0)}% automáticos` : '' },
          { icon: Bell,     label: 'Alertas', value: m?.alertas_activas ?? '-', sub: 'pendientes de revisión', extra: '' },
          { icon: Activity, label: 'Sistema', value: 'Palmo IA', sub: 'v1.0.0 · Activo', extra: '' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={13} className="text-stone-400" />
              <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">{card.label}</span>
            </div>
            <p className="text-2xl font-semibold text-stone-900 tabular-nums">{card.value}</p>
            <p className="text-[11px] text-stone-400 mt-1">{card.sub}</p>
            {card.extra && (
              <div className="mt-2 flex flex-wrap gap-1">
                {card.extra.split('·').map((part, i) => (
                  <span key={i} className="text-[10px] bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded font-medium">{part.trim()}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
    </div>
  )
}

function CategoriaBadge({ tipo }: { tipo: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' }> = {
    stock:           { label: 'Stock',          variant: 'info' },
    precio:          { label: 'Precio',         variant: 'default' },
    compatibilidad:  { label: 'Compatibil.',    variant: 'muted' },
    estado_pedido:   { label: 'Estado pedido',  variant: 'default' },
    reclamacion:     { label: 'Reclamación',    variant: 'danger' },
    consulta_compleja:{ label: 'Compleja',      variant: 'warning' },
  }
  const { label, variant } = map[tipo] ?? { label: tipo, variant: 'muted' as const }
  return <Badge variant={variant}>{label}</Badge>
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' }> = {
    respondido: { label: 'Respondido', variant: 'success' },
    escalado:   { label: 'Escalado',   variant: 'warning' },
    pendiente:  { label: 'Pendiente',  variant: 'muted' },
  }
  const { label, variant } = map[estado] ?? { label: estado, variant: 'muted' as const }
  return <Badge variant={variant}>{label}</Badge>
}

function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' }> = {
    critica: { label: 'Crítica', variant: 'danger' },
    alta:    { label: 'Alta',    variant: 'warning' },
    media:   { label: 'Media',   variant: 'info' },
  }
  const { label, variant } = map[prioridad] ?? { label: prioridad, variant: 'muted' as const }
  return <Badge variant={variant}>{label}</Badge>
}
