import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { useNotifications } from '../../context/notifications'
import { Menu } from 'lucide-react'

export type Page = 'dashboard' | 'emails' | 'stock' | 'alertas' | 'manual'

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Panel de control',    subtitle: 'Resumen operativo en tiempo real' },
  emails:    { title: 'Emails IA',           subtitle: 'Gestión de emails procesados automáticamente' },
  stock:     { title: 'Stock y Predicción',  subtitle: 'Predicción de consumo y alertas de reposición' },
  alertas:   { title: 'Alertas',             subtitle: 'Notificaciones del sistema Palmo IA' },
  manual:    { title: 'Manual de uso',       subtitle: 'Guía completa del sistema para todo el equipo' },
}

interface AppShellProps {
  children: (page: Page) => ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { markPageSeen } = useNotifications()

  const navigate = (page: Page) => {
    setActivePage(page)
    markPageSeen(page)
    setSidebarOpen(false)
  }

  useEffect(() => {
    markPageSeen('dashboard')
  }, [])

  const { title, subtitle } = pageTitles[activePage]

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset by sidebar width */}
      <div className="lg:ml-[220px] min-h-screen flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 md:px-6 h-12 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 text-stone-500 hover:text-stone-800 transition-colors rounded"
            aria-label="Menú"
          >
            <Menu size={17} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-[13px] font-semibold text-stone-900 leading-none">{title}</h1>
            <span className="hidden sm:block text-stone-300 text-xs">·</span>
            <p className="hidden sm:block text-[11px] text-stone-400 truncate">{subtitle}</p>
          </div>

          <div className="flex-1" />

          {/* System status */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </span>
            <span className="text-[11px] text-stone-400 hidden sm:block">Sistema activo</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-6 page-enter">
          {children(activePage)}
        </main>

        {/* Footer */}
        <footer className="border-t border-stone-100 px-4 md:px-6 py-2.5 flex items-center justify-between">
          <span className="text-[10px] text-stone-400">Palmo IA v1.0.0</span>
          <span className="text-[10px] text-stone-300">Palmo Suministro Integral</span>
        </footer>
      </div>
    </div>
  )
}
