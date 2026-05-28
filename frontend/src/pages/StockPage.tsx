import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import {
  RiskBadge, DaysBar, Card, SectionHeader,
  TableWrapper, Th, Td, SearchInput, FilterTabs, EmptyState, Skeleton,
} from '../components/ui'
import { fetchStock } from '../data/api'
import type { StockRecord } from '../data/mock'

type FilterRiesgo = 'todos' | 'critica' | 'alta' | 'media'

const riesgoFilterOptions: { value: FilterRiesgo; label: string }[] = [
  { value: 'todos',   label: 'Todos' },
  { value: 'critica', label: 'Crítico' },
  { value: 'alta',    label: 'Alto' },
  { value: 'media',   label: 'Medio' },
]

export default function StockPage() {
  const [stock, setStock]           = useState<StockRecord[]>([])
  const [loading, setLoading]       = useState(true)
  const [filterRiesgo, setFilterRiesgo] = useState<FilterRiesgo>('todos')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    fetchStock().then(data => {
      setStock(data as StockRecord[])
      setLoading(false)
    })
  }, [])

  const filtered = stock.filter(s => {
    if (filterRiesgo !== 'todos' && s.riesgo !== filterRiesgo) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !s.nombre.toLowerCase().includes(q) &&
        !s.sku.toLowerCase().includes(q) &&
        !s.proveedor.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const counts = {
    critica: stock.filter(s => s.riesgo === 'critica').length,
    alta:    stock.filter(s => s.riesgo === 'alta').length,
    media:   stock.filter(s => s.riesgo === 'media').length,
  }

  return (
    <div className="max-w-[1200px] mx-auto">

      {/* Summary */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-lg p-4">
              <Skeleton className="h-3 w-28 mb-2" />
              <Skeleton className="h-7 w-10 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide mb-1">SKUs monitorizados</p>
            <p className="text-2xl font-semibold text-stone-900 tabular-nums">{stock.length}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">última sync 07:45</p>
          </div>
          <div className="bg-white border border-red-100 rounded-lg p-4">
            <p className="text-[11px] text-red-400 font-medium uppercase tracking-wide mb-1">Riesgo crítico</p>
            <p className="text-2xl font-semibold text-red-600 tabular-nums">{counts.critica}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">rotura &lt; lead time</p>
          </div>
          <div className="bg-white border border-amber-100 rounded-lg p-4">
            <p className="text-[11px] text-amber-500 font-medium uppercase tracking-wide mb-1">Riesgo alto</p>
            <p className="text-2xl font-semibold text-amber-600 tabular-nums">{counts.alta}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">bajo margen de seguridad</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <p className="text-[11px] text-blue-400 font-medium uppercase tracking-wide mb-1">Riesgo medio</p>
            <p className="text-2xl font-semibold text-blue-600 tabular-nums">{counts.media}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">vigilancia preventiva</p>
          </div>
        </div>
      )}

      <Card>
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-stone-100 flex flex-wrap items-center gap-3">
          <SectionHeader title="Predicción de stock" />
          <div className="flex-1" />
          <SearchInput value={search} onChange={setSearch} placeholder="SKU, producto, proveedor…" />
          <FilterTabs options={riesgoFilterOptions} value={filterRiesgo} onChange={setFilterRiesgo} />
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
                <Th>Referencia / Producto</Th>
                <Th>Proveedor</Th>
                <Th right>Stock actual</Th>
                <Th right>Stk. mínimo</Th>
                <Th right>Venta/día</Th>
                <Th>Días restantes</Th>
                <Th>Riesgo</Th>
                <Th right>Pedido sugerido</Th>
                <Th>Notas</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <StockRow key={item.sku} item={item} />
              ))}
            </tbody>
          </TableWrapper>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState message="No se encontraron productos con los filtros aplicados." />
        )}

        <div className="px-4 py-2.5 border-t border-stone-100">
          <p className="text-[11px] text-stone-400">
            {filtered.length} productos · La línea vertical en la barra indica el lead time del proveedor
          </p>
        </div>
      </Card>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-5 px-1">
        <p className="text-[11px] text-stone-400 font-medium">Leyenda días restantes:</p>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-1.5 bg-red-400 rounded-sm" />
          <span className="text-[11px] text-stone-500">≤ lead time (rojo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-1.5 bg-amber-400 rounded-sm" />
          <span className="text-[11px] text-stone-500">lead time + 5d (ámbar)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-1.5 bg-emerald-500 rounded-sm" />
          <span className="text-[11px] text-stone-500">margen suficiente (verde)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-px h-3 bg-stone-400 opacity-60" />
          <span className="text-[11px] text-stone-400">línea = lead time</span>
        </div>
      </div>
    </div>
  )
}

function StockRow({ item }: { item: StockRecord }) {
  const stockPct = item.stockMinimo > 0 ? item.stockActual / item.stockMinimo : 1
  return (
    <tr className="hover:bg-stone-50/60 transition-colors">
      <Td>
        <p className="font-mono text-[11px] text-stone-400">{item.sku}</p>
        <p className="font-medium text-stone-800 text-[12px] mt-0.5 max-w-[220px] truncate">{item.nombre}</p>
      </Td>
      <Td className="text-stone-500 text-[11px]">{item.proveedor}</Td>
      <Td className="text-right">
        <span className={`text-[12px] font-semibold tabular-nums ${stockPct < 0.8 ? 'text-red-600' : 'text-stone-800'}`}>
          {item.stockActual}
        </span>
        <span className="text-[10px] text-stone-400 ml-1">uds</span>
      </Td>
      <Td className="text-right text-[12px] text-stone-500 tabular-nums">{item.stockMinimo}</Td>
      <Td className="text-right text-[12px] text-stone-500 tabular-nums">{item.ventasDiarias.toFixed(1)}</Td>
      <Td><DaysBar dias={item.diasRestantes} leadTime={item.leadTime} /></Td>
      <Td><RiskBadge riesgo={item.riesgo} /></Td>
      <Td className="text-right">
        {item.reposicionSugerida > 0 ? (
          <span className="text-[12px] font-semibold text-stone-800 tabular-nums">
            {item.reposicionSugerida} <span className="text-[10px] text-stone-400 font-normal">uds</span>
          </span>
        ) : (
          <span className="text-[11px] text-stone-300">—</span>
        )}
      </Td>
      <Td>
        <div className="flex flex-col gap-0.5">
          {item.anomalia && (
            <div className="flex items-center gap-1">
              <AlertTriangle size={11} className="text-amber-500 flex-shrink-0" />
              <span className="text-[10px] text-amber-600">Pico demanda</span>
            </div>
          )}
          {item.stockActual < item.stockMinimo && (
            <div className="flex items-center gap-1">
              <TrendingDown size={11} className="text-red-500 flex-shrink-0" />
              <span className="text-[10px] text-red-600">Bajo mínimo</span>
            </div>
          )}
        </div>
      </Td>
    </tr>
  )
}
