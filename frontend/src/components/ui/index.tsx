import { clsx } from 'clsx'
import type { ReactNode } from 'react'

// ── Badge ──────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  muted: 'bg-stone-50 text-stone-500',
}
export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium leading-tight', badgeStyles[variant])}>
      {children}
    </span>
  )
}

// ── StatusDot ──────────────────────────────────────────────────────
export function StatusDot({ status }: { status: 'operativo' | 'degradado' | 'error' }) {
  const colors = { operativo: 'bg-emerald-500', degradado: 'bg-amber-400', error: 'bg-red-500' }
  return (
    <span className="relative flex items-center gap-1.5">
      <span className={clsx('w-1.5 h-1.5 rounded-full', colors[status])} />
      <span className={clsx(
        'absolute w-1.5 h-1.5 rounded-full animate-ping opacity-60',
        status === 'operativo' ? 'bg-emerald-400' : status === 'degradado' ? 'bg-amber-300' : 'bg-red-400'
      )} />
    </span>
  )
}

// ── RiskIndicator ──────────────────────────────────────────────────
export function RiskBadge({ riesgo }: { riesgo: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    critica: { label: 'Crítica', variant: 'danger' },
    alta: { label: 'Alta', variant: 'warning' },
    media: { label: 'Media', variant: 'info' },
    ok: { label: 'OK', variant: 'success' },
  }
  const { label, variant } = map[riesgo] ?? { label: riesgo, variant: 'muted' }
  return <Badge variant={variant}>{label}</Badge>
}

// ── ConfianzaBar ───────────────────────────────────────────────────
export function ConfianzaBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 80 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-stone-500 tabular-nums w-7 text-right">{pct}%</span>
    </div>
  )
}

// ── DaysBar ────────────────────────────────────────────────────────
export function DaysBar({ dias, leadTime }: { dias: number; leadTime: number }) {
  const max = Math.max(dias, leadTime + 5, 21)
  const pct = Math.min((dias / max) * 100, 100)
  const threshold = (leadTime / max) * 100
  const isCritical = dias <= leadTime
  const isWarning = !isCritical && dias <= leadTime + 5
  const barColor = isCritical ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="relative flex-1 h-1 bg-stone-200 rounded-full overflow-visible">
        <div className={clsx('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-stone-400 opacity-50" style={{ left: `${threshold}%` }} />
      </div>
      <span className={clsx('text-[11px] tabular-nums w-6 text-right font-medium', isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-stone-600')}>
        {Math.round(dias)}d
      </span>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white border border-stone-200 rounded-lg', className)}>
      {children}
    </div>
  )
}

// ── MetricCard ─────────────────────────────────────────────────────
export function MetricCard({
  label, value, sub, accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const accentColors = {
    default: 'text-stone-900',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-600',
  }
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4">
      <p className="text-[11px] text-stone-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={clsx('text-2xl font-semibold leading-none tabular-nums', accentColors[accent ?? 'default'])}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-stone-400">{sub}</p>}
    </div>
  )
}

// ── SectionHeader ──────────────────────────────────────────────────
export function SectionHeader({ title, children }: { title: string; children?: ReactNode | null }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

// ── Table wrapper ──────────────────────────────────────────────────
export function TableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12.5px]">{children}</table>
    </div>
  )
}

export function Th({ children, right }: { children?: ReactNode; right?: boolean }) {
  return (
    <th className={clsx('px-3 py-2 text-[11px] font-medium text-stone-400 uppercase tracking-wide border-b border-stone-100', right && 'text-right')}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx('px-3 py-2.5 border-b border-stone-50 text-stone-700', className)}>{children}</td>
}

// ── Skeleton ──────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('bg-stone-200 rounded animate-pulse', className)} />
}
