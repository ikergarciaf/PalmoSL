import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { useNotifications } from '../../context/notifications'
import { Menu, X } from 'lucide-react'

export type Page = 'dashboard' | 'emails' | 'stock' | 'alertas' | 'manual'

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

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar activePage={activePage} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[220px] min-h-screen">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-stone-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 text-stone-600 hover:text-stone-900"
            aria-label="Menú"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <main className="p-4 md:p-6">
          {children(activePage)}
        </main>
        <footer className="border-t border-stone-200 px-4 md:px-6 py-2 text-[10px] text-stone-400 text-center">
          Palmo IA v1.0.0
        </footer>
      </div>
    </div>
  )
}
