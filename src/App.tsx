import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Today } from './pages/Today'
import { CalendarPage } from './pages/CalendarPage'
import { CalendarGoalDetail } from './pages/CalendarGoalDetail'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'

// Chart-heavy pages pull in recharts (~130KB) — lazy-load so the rest of the app
// (which most check-ins never leave) stays fast to first paint on mobile Safari.
const Analytics = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })))
const AnalyticsGoalDetail = lazy(() =>
  import('./pages/AnalyticsGoalDetail').then((m) => ({ default: m.AnalyticsGoalDetail }))
)

function PageFallback() {
  return (
    <div className="px-5 pt-24 max-w-md mx-auto text-center">
      <p className="text-sm text-muted dark:text-muted-dark">Loading…</p>
    </div>
  )
}

function AnimatedRoutes({ userId }: { userId: string | null }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home userId={userId} />} />
            <Route path="/today" element={<Today userId={userId} />} />
            <Route path="/calendar" element={<CalendarPage userId={userId} />} />
            <Route path="/calendar/:goal" element={<CalendarGoalDetail userId={userId} />} />
            <Route path="/analytics" element={<Analytics userId={userId} />} />
            <Route path="/analytics/:goal" element={<AnalyticsGoalDetail userId={userId} />} />
            <Route path="/goal/:goal" element={<LegacyGoalRedirect />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function LegacyGoalRedirect() {
  const path = window.location.hash.replace('#/goal/', '')
  return <Navigate to={`/analytics/${path}`} replace />
}

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
      <AnimatedRoutes userId={userId} />
      <BottomNav />
    </HashRouter>
  )
}
