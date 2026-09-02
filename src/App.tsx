import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Today } from './pages/Today'
import { CalendarPage } from './pages/CalendarPage'
import { GoalDetail } from './pages/GoalDetail'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'

export default function App() {
  useTheme()
  const { isAuthenticated, loading, userId } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted dark:text-muted-dark">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home userId={userId} />} />
        <Route path="/today" element={<Today userId={userId} />} />
        <Route path="/calendar" element={<CalendarPage userId={userId} />} />
        <Route path="/goal/:goal" element={<GoalDetail userId={userId} />} />
        <Route path="/analytics" element={<Analytics userId={userId} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </HashRouter>
  )
}
