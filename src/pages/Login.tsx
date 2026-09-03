import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { signInWithEmail, verifyEmailOtp } = useAuth()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()

    const normalizedEmail = email.trim()

    if (!normalizedEmail) return

    setLoading(true)
    setError(null)

    const { error } = await signInWithEmail(normalizedEmail)

    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    setSent(true)
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()

    const normalizedEmail = email.trim()
    const normalizedOtp = otp.trim()

    if (!normalizedOtp) return

    setLoading(true)
    setError(null)

    const { error } = await verifyEmailOtp(
      normalizedEmail,
      normalizedOtp
    )

    setLoading(false)

    if (error) {
      setError(error)
    }
  }

  function handleBack() {
    setSent(false)
    setOtp('')
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">
          RECLAIM 122
        </h1>

        <p className="text-sm text-muted dark:text-muted-dark text-center mb-8">
          Sign in with a verification code — no password needed.
        </p>

        {!sent ? (
          <form
            onSubmit={handleSendCode}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark
                         px-4 py-3 text-sm outline-none focus:border-status-blue"
            />

            {error && (
              <p className="text-xs text-status-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark
                         py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Sending code…' : 'Send verification code'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerifyCode}
            className="flex flex-col gap-3"
          >
            <div className="rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-5 text-center">
              <p className="text-sm">
                Check <span className="font-medium">{email}</span>
              </p>

              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Enter the verification code from your email.
              </p>
            </div>

            <input
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Verification code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ''))
              }
              className="rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark
                         px-4 py-3 text-center text-lg tracking-[0.25em] outline-none focus:border-status-blue"
            />

            {error && (
              <p className="text-xs text-status-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark
                         py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify code'}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="py-2 text-sm text-muted dark:text-muted-dark"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}