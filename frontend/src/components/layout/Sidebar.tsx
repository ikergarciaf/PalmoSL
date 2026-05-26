import { clsx } from 'clsx'
import { LayoutDashboard, Mail, Package, Bell, BookOpen, X } from 'lucide-react'
import type { Page } from './AppShell'
import { useNotifications } from '../../context/notifications'

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'emails', label: 'Emails IA', icon: Mail },
  { id: 'stock', label: 'Stock y Predicción', icon: Package },
  { id: 'alertas', label: 'Alertas', icon: Bell },
  { id: 'manual', label: 'Manual de uso', icon: BookOpen },
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
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 bg-white border-r border-stone-200 flex flex-col z-50 transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: 260 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-[11px] font-bold leading-none">P</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-stone-900 leading-none">Palmo IA</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Suministro Integral</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-stone-400 hover:text-stone-600">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activePage === item.id}
              badge={getBadge(item.id)}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-stone-100">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded">
            <div className="w-7 h-7 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-semibold text-stone-600">AC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-stone-700 truncate leading-none">Admin</p>
              <p className="text-[10px] text-stone-400 truncate">Palmo Suministros</p>
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
          ? 'bg-stone-900 text-white'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
      )}
    >
      <Icon size={15} className="flex-shrink-0" />
      <span className="flex-1 text-[13px] font-medium">{item.label}</span>
      {badge !== undefined && !active && (
        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold leading-none">
          {badge}
        </span>
      )}
    </button>
  )
}
