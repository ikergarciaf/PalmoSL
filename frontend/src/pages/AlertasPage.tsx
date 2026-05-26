import { useState } from 'react'
import { Info, Package, Mail, Activity, Server, Check } from 'lucide-react'
import { Badge, Card, SectionHeader } from '../components/ui'
import { alertasData, type AlertRecord } from '../data/mock'
import { useNotifications } from '../context/notifications'

const tipoIcon: Record<string, React.ElementType> = {
  stock: Package,
  email: Mail,
  api: Activity,
  sistema: Server,
}

const tipoLabel: Record<string, string> = {
  stock: 'Stock',
  email: 'Email',
  api: 'API',
  sistema: 'Sistema',
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function AlertasPage() {
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterPrioridad, setFilterPrioridad] = useState('todos')
  const [soloNoLeidas, setSoloNoLeidas] = useState(false)
  const { alertaReadIds, markAlertaRead, markAllAlertasRead } = useNotifications()

  const filtered = alertasData.filter(a => {
    if (filterTipo !== 'todos' && a.tipo !== filterTipo) return false
    if (filterPrioridad !== 'todos' && a.prioridad !== filterPrioridad) return false
    if (soloNoLeidas && alertaReadIds.has(a.id)) return false
    return true
  })

  const noLeidas = alertasData.filter(a => !alertaReadIds.has(a.id)).length

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold text-stone-900">Alertas</h1>
          <p className="text-[12px] text-stone-400 mt-0.5">Notificaciones del sistema Palmo IA</p>
        </div>
        {noLeidas > 0 && (
          <button
            onClick={markAllAlertasRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 transition-colors"
          >
            <Check size={12} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Sin leer', value: noLeidas, accent: noLeidas > 0 ? 'text-stone-900' : 'text-stone-400' },
          { label: 'Críticas', value: alertasData.filter(a => a.prioridad === 'critica').length, accent: 'text-red-600' },
          { label: 'Alta prioridad', value: alertasData.filter(a => a.prioridad === 'alta').length, accent: 'text-amber-700' },
          { label: 'Total hoy', value: alertasData.filter(a => a.timestamp.startsWith(new Date().toISOString().slice(0, 10))).length, accent: 'text-stone-700' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-stone-200 rounded-lg p-4">
            <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">{c.label}</p>
            <p className={`text-2xl font-semibold tabular-nums ${c.accent}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3 flex-wrap">
          <SectionHeader title="Registro de alertas" />
          <div className="flex-1" />
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={soloNoLeidas}
              onChange={e => setSoloNoLeidas(e.target.checked)}
              className="w-3 h-3 accent-stone-900"
            />
            <span className="text-[11px] text-stone-600">Solo no leídas</span>
          </label>
          <select
            value={filterPrioridad}
            onChange={e => setFilterPrioridad(e.target.value)}
            className="text-[11px] text-stone-600 bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none"
          >
            <option value="todos">Todas las prioridades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
          </select>
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="text-[11px] text-stone-600 bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none"
          >
            <option value="todos">Todos los tipos</option>
            <option value="stock">Stock</option>
            <option value="email">Email</option>
            <option value="api">API</option>
            <option value="sistema">Sistema</option>
          </select>
        </div>

        <div className="divide-y divide-stone-50">
          {filtered.map(alerta => (
            <AlertRow key={alerta.id} alerta={alerta} leida={alertaReadIds.has(alerta.id)} onRead={() => markAlertaRead(alerta.id)} />
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-[12px] text-stone-400">
              No hay alertas con los filtros aplicados.
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-stone-100">
          <p className="text-[11px] text-stone-400">{filtered.length} alertas</p>
        </div>
      </Card>
    </div>
  )
}

function AlertRow({ alerta, leida, onRead }: { alerta: AlertRecord; leida: boolean; onRead: () => void }) {
  const Icon = tipoIcon[alerta.tipo] ?? Info
  const prioColors = {
    critica: { border: 'border-l-red-400', bg: leida ? '' : 'bg-red-50/30', dot: 'bg-red-500', badge: 'danger' as const },
    alta: { border: 'border-l-amber-400', bg: leida ? '' : 'bg-amber-50/30', dot: 'bg-amber-500', badge: 'warning' as const },
    media: { border: 'border-l-blue-300', bg: leida ? '' : 'bg-blue-50/20', dot: 'bg-blue-400', badge: 'info' as const },
  }
  const style = prioColors[alerta.prioridad]

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 border-l-2 transition-colors hover:bg-stone-50 ${style.border} ${leida ? '' : style.bg}`}>
      <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${leida ? 'bg-stone-100' : 'bg-white border border-stone-200'}`}>
        <Icon size={14} className={leida ? 'text-stone-400' : 'text-stone-600'} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {!leida && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />}
          <p className={`text-[12.5px] font-medium ${leida ? 'text-stone-500' : 'text-stone-900'}`}>
            {alerta.titulo}
          </p>
          <Badge variant={style.badge}>{alerta.prioridad === 'critica' ? 'Crítica' : alerta.prioridad === 'alta' ? 'Alta' : 'Media'}</Badge>
          <Badge variant="muted">{tipoLabel[alerta.tipo]}</Badge>
        </div>
        <p className="text-[11.5px] text-stone-500">{alerta.descripcion}</p>
        {alerta.sku && (
          <p className="text-[10px] text-stone-400 font-mono mt-1">{alerta.sku}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-[10px] text-stone-400">{formatTime(alerta.timestamp)}</span>
        {leida ? (
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
            <Check size={10} /> Leída
          </span>
        ) : (
          <button
            onClick={onRead}
            className="text-[10px] text-stone-400 hover:text-stone-700 px-2 py-0.5 hover:bg-stone-100 rounded transition-colors"
          >
            Marcar leída
          </button>
        )}
      </div>
    </div>
  )
}
