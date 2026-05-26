import { NotificationProvider } from './context/notifications'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import EmailsPage from './pages/EmailsPage'
import StockPage from './pages/StockPage'
import AlertasPage from './pages/AlertasPage'
import ManualPage from './pages/ManualPage'
import NotFoundPage from './pages/NotFoundPage'

const pages: Record<string, React.FC> = {
  dashboard: DashboardPage,
  emails: EmailsPage,
  stock: StockPage,
  alertas: AlertasPage,
  manual: ManualPage,
}

export default function App() {
  return (
    <NotificationProvider>
      <AppShell>
        {(page) => {
          const Page = pages[page]
          return Page ? <Page /> : <NotFoundPage />
        }}
      </AppShell>
    </NotificationProvider>
  )
}
