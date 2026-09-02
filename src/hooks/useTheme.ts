import { useEffect, useState } from 'react'

type ThemePref = 'light' | 'dark' | 'system'

function applyTheme(pref: ThemePref) {
  const isDark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePref>(() => (localStorage.getItem('reclaim-theme') as ThemePref) || 'system')

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function setTheme(t: ThemePref) {
    localStorage.setItem('reclaim-theme', t)
    setThemeState(t)
  }

  return { theme, setTheme }
}
