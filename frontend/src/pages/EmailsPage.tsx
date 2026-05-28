import { useState, useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import {
  Badge, ConfianzaBar, Card, SectionHeader,
  TableWrapper, Th, Td, SearchInput, FilterTabs, EmptyState, Skeleton,
} from '../components/ui'
import { fetchEmails } from '../data/api'
import type { EmailRecord } from '../data/mock'

type FilterEstado = 'todos' | 'respondido' | 'escalado' | 'pendiente'
type FilterTipo   = 'todos' | 'stock' | 'precio' | 'compatibilidad' | 'estado_pedido' | 'reclamacion' | 'consulta_compleja'

const categoriaLabel: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' }> = {
  stock:             { label: 'Stock',            variant: 'info' },
  precio:            { label: 'Precio',           variant: 'default' },
  compatibilidad:    { label: 'Compatibilidad',   variant: 'muted' },
  estado_pedido:     { label: 'Estado pedido',    variant: 'default' },
  reclamacion:       { label: 'Reclamación',      variant: 'danger' },
  consulta_compleja: { label: 'Consulta compleja',variant: 'warning' },
}

const estadoLabel: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted' }> = {
  respondido: { label: 'Respondido auto.', variant: 'success' },
  escalado:   { label: 'Escalado',         variant: 'warning' },
  pendiente:  { label: 'Pendiente',        variant: 'muted' },
}

const estadoFilterOptions: { value: FilterEstado; label: string }[] = [
  { value: 'todos',      label: 'Todos' },
  { value: 'respondido', label: 'Respondidos' },
  { value: 'escalado',   label: 'Escalados' },
  { value: 'pendiente',  label: 'Pendientes' },
]

export default function EmailsPage() {
  const [emails, setEmails]         = useState<EmailRecord[]>([])
  const [loading, setLoading]       = useState(true)
  const [filterEstado, setFilterEstado] = useState<FilterEstado>('todos')
  const [filterTipo,   setFilterTipo]   = useState<FilterTipo>('todos')
  const [search, setSearch]         = useState('')
  const [detailEmail, setDetailEmail]   = useState<EmailRecord | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchEmails().then(data => {
      setEmails(data as EmailRecord[])
      setLoading(false)
    })
  }, [])

  const filtered = emails.filter(e => {
    if (filterEstado !== 'todos' && e.estado !== filterEstado) return false
    if (filterTipo   !== 'todos' && e.tipo   !== filterTipo)   return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !e.cliente.toLowerCase().includes(q) &&
        !e.empresa.toLowerCase().includes(q) &&
        !e.id.toLowerCase().includes(q) &&
        !e.asunto.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const counts = {
    respondido: emails.filter(e => e.estado === 'respondido').length,
    escalado:   emails.filter(e => e.estado === 'escalado').length,
    pendiente:  emails.filter(e => e.estado === 'pendiente').length,
  }

  return (
    <div className="max-w-[1200px] mx-auto">

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-lg p-4">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-7 w-12 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total procesados',   value: emails.length,       sub: 'últimas 48h',       accent: '' },
            { label: 'Respondidos auto.',  value: counts.respondido,   sub: emails.length ? `${Math.round((counts.respondido / emails.length) * 100)}% del total` : '—', accent: 'text-emerald-700' },
            { label: 'Escalados a humano', value: counts.escalado,     sub: 'requieren atención', accent: 'text-amber-700' },
            { label: 'Pendientes',         value: counts.pendiente,    sub: 'en cola',            accent: 'text-stone-600' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-stone-200 rounded-lg p-4">
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">{c.label}</p>
              <p className={`text-2xl font-semibold tabular-nums ${c.accent || 'text-stone-900'}`}>{c.value}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>
      )}

      <Card>
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-stone-100 flex flex-wrap items-center gap-3">
          <SectionHeader title="Registro de emails" />
          <div className="flex-1" />
          <SearchInput value={search} onChange={setSearch} placeholder="Cliente, empresa, ID…" />
          <FilterTabs options={estadoFilterOptions} value={filterEstado} onChange={setFilterEstado} />
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value as FilterTipo)}
            className="text-[11px] text-stone-600 bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none"
          >
            <option value="todos">Todos los tipos</option>
            <option value="stock">Stock</option>
            <option value="precio">Precio</option>
            <option value="compatibilidad">Compatibilidad</option>
            <option value="estado_pedido">Estado pedido</option>
            <option value="reclamacion">Reclamación</option>
            <option value="consulta_compleja">Consulta compleja</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <TableWrapper>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>Asunto</Th>
                <Th>Tipo consulta</Th>
                <Th>Confianza IA</Th>
                <Th>Estado</Th>
                <Th>Acción tomada</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(email => (
                <EmailRow key={email.id} email={email} onDetail={setDetailEmail} />
              ))}
            </tbody>
          </TableWrapper>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState message="No se encontraron emails con los filtros aplicados." />
        )}

        <div className="px-4 py-2.5 border-t border-stone-100">
          <p className="text-[11px] text-stone-400">{filtered.length} registros</p>
        </div>
      </Card>

      {detailEmail && <EmailDetail email={detailEmail} onClose={() => setDetailEmail(null)} />}
    </div>
  )
}

function EmailRow({ email, onDetail }: { email: EmailRecord; onDetail: (e: EmailRecord) => void }) {
  const cat = categoriaLabel[email.tipo]    ?? { label: email.tipo,   variant: 'muted' as const }
  const est = estadoLabel[email.estado]     ?? { label: email.estado, variant: 'muted' as const }
  return (
    <tr className="hover:bg-stone-50/60 transition-colors">
      <Td>
        <p className="font-medium text-stone-800 text-[12px]">{email.cliente}</p>
        <p className="text-[10px] text-stone-400">{email.empresa}</p>
        <p className="text-[10px] text-stone-400 font-mono">{email.fecha} · {email.hora}</p>
      </Td>
      <Td className="max-w-[200px]">
        <p className="text-[12px] text-stone-700 truncate" title={email.asunto}>{email.asunto}</p>
        {email.ambigua && <span className="text-[10px] text-amber-500">⚠ Ambigua</span>}
      </Td>
      <Td><Badge variant={cat.variant}>{cat.label}</Badge></Td>
      <Td><ConfianzaBar value={email.confianza} /></Td>
      <Td><Badge variant={est.variant}>{est.label}</Badge></Td>
      <Td className="max-w-[200px]">
        <p className="text-[11px] text-stone-600 truncate">{email.accion}</p>
      </Td>
      <Td>
        <button
          onClick={() => onDetail(email)}
          className="p-1.5 hover:bg-stone-100 rounded transition-colors"
          title="Ver detalle"
        >
          <ExternalLink size={12} className="text-stone-400" />
        </button>
      </Td>
    </tr>
  )
}

function EmailDetail({ email, onClose }: { email: EmailRecord; onClose: () => void }) {
  const cat = categoriaLabel[email.tipo]  ?? { label: email.tipo,   variant: 'muted' as const }
  const est = estadoLabel[email.estado]   ?? { label: email.estado, variant: 'muted' as const }
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-stone-200 rounded-lg shadow-xl z-50 w-[520px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-900">Detalle del email</h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded transition-colors">
            <X size={14} className="text-stone-400" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-[12px]">
            <div>
              <p className="text-stone-400 mb-0.5">ID</p>
              <p className="font-mono text-stone-700">{email.id}</p>
            </div>
            <div>
              <p className="text-stone-400 mb-0.5">Fecha</p>
              <p className="text-stone-700">{email.fecha} · {email.hora}</p>
            </div>
            <div>
              <p className="text-stone-400 mb-0.5">Cliente</p>
              <p className="text-stone-700 truncate">{email.cliente}</p>
            </div>
          </div>
          <div>
            <p className="text-[12px] text-stone-400 mb-0.5">Empresa</p>
            <p className="text-[13px] text-stone-700">{email.empresa}</p>
          </div>
          <div>
            <p className="text-[12px] text-stone-400 mb-0.5">Asunto</p>
            <p className="text-[13px] text-stone-700">{email.asunto}</p>
          </div>
          <div>
            <p className="text-[12px] text-stone-400 mb-0.5">Cuerpo del mensaje</p>
            <p className="text-[12px] text-stone-600 bg-stone-50 border border-stone-100 rounded-md p-3 leading-relaxed whitespace-pre-wrap">
              {email.cuerpo || '(sin contenido)'}
            </p>
          </div>
          <div className="flex gap-4 text-[12px]">
            <div>
              <p className="text-stone-400 mb-0.5">Tipo</p>
              <Badge variant={cat.variant}>{cat.label}</Badge>
            </div>
            <div>
              <p className="text-stone-400 mb-1">Confianza</p>
              <ConfianzaBar value={email.confianza} />
            </div>
            <div>
              <p className="text-stone-400 mb-0.5">Estado</p>
              <Badge variant={est.variant}>{est.label}</Badge>
            </div>
          </div>
          <div>
            <p className="text-[12px] text-stone-400 mb-0.5">Acción tomada</p>
            <p className="text-[12px] text-stone-700 font-medium">{email.accion}</p>
          </div>
        </div>
      </div>
    </>
  )
}
