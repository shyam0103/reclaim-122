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
      className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+8px)]"
      aria-label="Primary"
    >
      <div
        className="mx-auto w-full max-w-sm rounded-[22px]
                   border border-line dark:border-line-dark
                   bg-surface dark:bg-surface-dark
                   shadow-soft dark:shadow-soft-dark"
      >
        <ul className="flex justify-around items-stretch">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors',
                    isActive
                      ? 'text-ink dark:text-ink-dark'
                      : 'text-muted dark:text-muted-dark'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.7}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
} 