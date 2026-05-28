import { clsx } from 'clsx'
import { LayoutDashboard, Mail, Package, Bell, BookOpen, X, type LucideIcon } from 'lucide-react'
import type { Page } from './AppShell'
import { useNotifications } from '../../context/notifications'
import palmoLogo from '../../assets/palmo-logo.jpg'

const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'emails',    label: 'Emails IA',          icon: Mail },
  { id: 'stock',     label: 'Stock y Predicción', icon: Package },
  { id: 'alertas',   label: 'Alertas',            icon: Bell },
  { id: 'manual',    label: 'Manual de uso',       icon: BookOpen },
]

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  open: boolean
  onClose: () => void
}

export default function Sidebar({ activePage, onNavigate, open, onClose }: SidebarProps) {
  const { getBadge } = useNotifications()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 bg-white border-r border-stone-200 flex flex-col z-50',
          'transition-transform duration-200 ease-in-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: 280 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-4 h-14 border-b border-stone-100 flex-shrink-0">
          <div className="overflow-hidden flex items-center justify-center h-full" style={{ width: '80%' }}>
            <img
              src={palmoLogo}
              alt="Palmo Suministro Integral"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 p-1 text-stone-400 hover:text-stone-600 transition-colors rounded"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pt-6 pb-2 px-2">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide px-3 py-2">
            Menú principal
          </p>
          {navItems.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={activePage === item.id}
              badge={getBadge(item.id)}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded">
            <div className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-semibold text-stone-500">PS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-stone-700 truncate leading-none">Administración</p>
              <p className="text-[10px] text-stone-400 truncate mt-0.5">Palmo Suministros</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItem({
  item, active, onClick, badge,
}: {
  item: typeof navItems[0]
  active: boolean
  onClick: () => void
  badge?: number
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className={clsx(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors mb-0.5',
        active
          ? 'bg-stone-100 text-stone-900 font-semibold'
          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
      )}
    >
      <Icon size={14} className="flex-shrink-0" />
      <span className="flex-1 text-[12.5px] font-medium">{item.label}</span>
      {badge !== undefined && (
        <span className={clsx(
          'text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none',
          active ? 'bg-red-100 text-red-600' : 'bg-red-100 text-red-600'
        )}>
          {badge}
        </span>
      )}
    </button>
  )
}
