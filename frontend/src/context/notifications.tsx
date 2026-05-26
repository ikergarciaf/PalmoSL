import { createContext, useContext, useState, type ReactNode } from 'react'
import { emailsData, stockData, alertasData } from '../data/mock'

interface NotificationState {
  seenPages: Set<string>
  markPageSeen: (page: string) => void
  alertaReadIds: Set<string>
  markAlertaRead: (id: string) => void
  markAllAlertasRead: () => void
  getBadge: (page: string) => number | undefined
}

const NotificationCtx = createContext<NotificationState | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [seenPages, setSeenPages] = useState<Set<string>>(new Set(['dashboard']))
  const [alertaReadIds, setAlertaReadIds] = useState<Set<string>>(new Set())

  const markPageSeen = (page: string) => {
    setSeenPages(prev => new Set([...prev, page]))
  }

  const markAlertaRead = (id: string) => {
    setAlertaReadIds(prev => new Set([...prev, id]))
  }

  const markAllAlertasRead = () => {
    const allIds = new Set(alertasData.map(a => a.id))
    setAlertaReadIds(prev => new Set([...prev, ...allIds]))
  }

  const getBadge = (page: string): number | undefined => {
    switch (page) {
      case 'emails': {
        if (seenPages.has('emails')) return undefined
        const count = emailsData.filter(e => e.estado === 'pendiente').length
        return count > 0 ? count : undefined
      }
      case 'stock': {
        if (seenPages.has('stock')) return undefined
        const count = stockData.filter(s => s.riesgo === 'critica').length
        return count > 0 ? count : undefined
      }
      case 'alertas': {
        const unread = alertasData.filter(a => !alertaReadIds.has(a.id)).length
        return unread > 0 ? unread : undefined
      }
      default:
        return undefined
    }
  }

  return (
    <NotificationCtx.Provider value={{ seenPages, markPageSeen, alertaReadIds, markAlertaRead, markAllAlertasRead, getBadge }}>
      {children}
    </NotificationCtx.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationCtx)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
