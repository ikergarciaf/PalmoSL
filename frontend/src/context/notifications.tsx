import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { emailsData, stockData, alertasData } from '../data/mock'

interface NotificationState {
  seenPages: Set<string>
  markPageSeen: (page: string) => void
  alertaReadIds: Set<string>
  markAlertaRead: (id: string) => void
  markAllAlertasRead: () => void
  getBadge: (page: string) => number | undefined
  resetPageBadge: (page: string) => void
}

const NotificationCtx = createContext<NotificationState | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [seenPages, setSeenPages] = useState<Set<string>>(new Set(['dashboard']))
  const [alertaReadIds, setAlertaReadIds] = useState<Set<string>>(new Set())

  const markPageSeen = useCallback((page: string) => {
    setSeenPages(prev => new Set([...prev, page]))
  }, [])

  const resetPageBadge = useCallback((page: string) => {
    setSeenPages(prev => {
      const next = new Set(prev)
      next.delete(page)
      return next
    })
  }, [])

  const markAlertaRead = useCallback((id: string) => {
    setAlertaReadIds(prev => new Set([...prev, id]))
  }, [])

  const markAllAlertasRead = useCallback(() => {
    setAlertaReadIds(new Set(alertasData.map(a => a.id)))
  }, [])

  const getBadge = useCallback((page: string): number | undefined => {
    switch (page) {
      case 'emails': {
        if (seenPages.has('emails')) return undefined
        const count = emailsData.filter(e => e.estado === 'pendiente' || e.estado === 'escalado').length
        return count > 0 ? count : undefined
      }
      case 'stock': {
        if (seenPages.has('stock')) return undefined
        const count = stockData.filter(s => s.riesgo === 'critica').length
        return count > 0 ? count : undefined
      }
      case 'alertas': {
        if (seenPages.has('alertas')) return undefined
        const unread = alertasData.filter(a => !alertaReadIds.has(a.id)).length
        return unread > 0 ? unread : undefined
      }
      default:
        return undefined
    }
  }, [seenPages, alertaReadIds])

  return (
    <NotificationCtx.Provider value={{
      seenPages, markPageSeen,
      alertaReadIds, markAlertaRead, markAllAlertasRead,
      getBadge, resetPageBadge,
    }}>
      {children}
    </NotificationCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationCtx)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
