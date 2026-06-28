'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
})

// ---------------------------------------------------------------------------
// Helper — apply .dark class + color-scheme to <html>
// ---------------------------------------------------------------------------
function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Resolve system preference
  const getSystemTheme = (): 'light' | 'dark' =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  const resolve = useCallback((t: Theme): 'light' | 'dark' => {
    if (t === 'system') return getSystemTheme()
    return t
  }, [])

  // On mount — read saved preference
  useEffect(() => {
    const saved = (localStorage.getItem('cg-theme') ?? 'system') as Theme
    const resolved = resolve(saved)
    setThemeState(saved)
    setResolvedTheme(resolved)
    applyTheme(resolved)

    // Watch OS preference changes when on "system"
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if ((localStorage.getItem('cg-theme') ?? 'system') === 'system') {
        const r = getSystemTheme()
        setResolvedTheme(r)
        applyTheme(r)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [resolve])

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem('cg-theme', t)
    const resolved = resolve(t)
    setThemeState(t)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [resolve])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTheme() {
  return useContext(ThemeContext)
}
