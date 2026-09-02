import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signInWithEmail(email)
    setLoading(false)
    if (error) setError(error)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">RECLAIM 122</h1>
        <p className="text-sm text-muted dark:text-muted-dark text-center mb-8">
          Sign in with a magic link — no password needed.
        </p>

        {sent ? (
          <div className="rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-5 text-center">
            <p className="text-sm">
              Check <span className="font-medium">{email}</span> for a sign-in link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark
                         px-4 py-3 text-sm outline-none focus:border-status-blue"
            />
            {error && <p className="text-xs text-status-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark
                         py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Sending link…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
