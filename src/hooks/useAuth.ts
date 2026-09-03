import { useEffect, useState } from 'react'
import { supabase, DEMO_MODE } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(!DEMO_MODE)

  useEffect(() => {
    if (DEMO_MODE || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithEmail(
    email: string
  ): Promise<{ error: string | null }> {
    if (!supabase) {
      return { error: 'Supabase is not configured.' }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email
    })

    return {
      error: error?.message ?? null
    }
  }

  async function verifyEmailOtp(
    email: string,
    token: string
  ): Promise<{ error: string | null }> {
    if (!supabase) {
      return { error: 'Supabase is not configured.' }
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    return {
      error: error?.message ?? null
    }
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  return {
    session,
    userId: DEMO_MODE ? 'demo-user' : session?.user.id ?? null,
    loading,
    isAuthenticated: DEMO_MODE || !!session,
    signInWithEmail,
    verifyEmailOtp,
    signOut
  }
}