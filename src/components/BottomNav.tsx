import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, BarChart3, Settings as SettingsIcon, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/today', label: 'Today', icon: CheckCircle2, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, end: false }
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 border-t border-line dark:border-line-dark
                 bg-paper/90 dark:bg-paper-dark/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="flex justify-around items-stretch max-w-md mx-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-ink dark:text-ink-dark' : 'text-muted dark:text-muted-dark'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
