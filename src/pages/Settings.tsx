import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { Segmented } from '../components/Segmented'
import { Card } from '../components/Card'
import { DEMO_MODE } from '../lib/supabase'
import { MISSION_START, MISSION_END } from '../types'

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { signOut, session } = useAuth()

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight mb-2">Settings</h1>

      <Card>
        <p className="text-sm font-medium mb-3">Appearance</p>
        <Segmented
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ]}
          value={theme}
          onChange={setTheme}
        />
      </Card>

      <Card>
        <p className="text-sm font-medium mb-1">Mission</p>
        <p className="text-xs text-muted dark:text-muted-dark">
          RECLAIM 122 · {MISSION_START} to {MISSION_END}
        </p>
        <p className="text-xs text-muted dark:text-muted-dark mt-1">
          Future RECLAIM missions (30/60/90/180-day) can reuse this same architecture.
        </p>
      </Card>

      <Card>
        <p className="text-sm font-medium mb-1">Environment</p>
        <p className="text-xs text-muted dark:text-muted-dark">
          {DEMO_MODE ? 'Demo mode — synthetic data, nothing is saved to a database.' : 'Connected to your private Supabase project.'}
        </p>
        {!DEMO_MODE && session?.user.email && (
          <p className="text-xs text-muted dark:text-muted-dark mt-1">Signed in as {session.user.email}</p>
        )}
      </Card>

      {!DEMO_MODE && (
        <button
          onClick={signOut}
          className="rounded-full border border-line dark:border-line-dark py-3 text-sm font-medium text-status-red"
        >
          Sign out
        </button>
      )}
    </div>
  )
}
