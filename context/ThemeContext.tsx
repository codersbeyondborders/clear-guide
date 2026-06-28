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
// Token maps
// ---------------------------------------------------------------------------
const LIGHT_TOKENS: Record<string, string> = {
  '--color-background':            '#ffffff',
  '--color-background-subtle':     '#f8fafc',
  '--color-card':                  '#ffffff',
  '--color-card-hover':            '#f1f5f9',
  '--color-foreground':            '#0f172a',
  '--color-muted-foreground':      '#64748b',
  '--color-primary':               '#00d084',
  '--color-primary-hover':         '#00b366',
  '--color-primary-foreground':    '#ffffff',
  '--color-primary-subtle':        '#ecfdf5',
  '--color-border':                '#e2e8f0',
  '--color-border-strong':         '#cbd5e1',
  '--color-destructive':           '#dc2626',
  '--color-destructive-foreground':'#ffffff',
  '--color-ring':                  '#00d084',
}

const DARK_TOKENS: Record<string, string> = {
  '--color-background':            '#0f172a',
  '--color-background-subtle':     '#1e293b',
  '--color-card':                  '#1e293b',
  '--color-card-hover':            '#273548',
  '--color-foreground':            '#f1f5f9',
  '--color-muted-foreground':      '#94a3b8',
  '--color-primary':               '#10b981',
  '--color-primary-hover':         '#059669',
  '--color-primary-foreground':    '#0f172a',
  '--color-primary-subtle':        '#064e3b',
  '--color-border':                '#334155',
  '--color-border-strong':         '#475569',
  '--color-destructive':           '#f87171',
  '--color-destructive-foreground':'#0f172a',
  '--color-ring':                  '#10b981',
}

// ---------------------------------------------------------------------------
// Helper — apply .dark class + inline CSS custom properties on <html>
// Inline styles have the highest specificity, overriding any stylesheet
// including Tailwind v4's @layer theme tokens.
// ---------------------------------------------------------------------------
function applyTheme(resolved: 'light' | 'dark', preference: Theme) {
  const root = document.documentElement
  const tokens = resolved === 'dark' ? DARK_TOKENS : LIGHT_TOKENS

  // Write each token directly onto the element's style — this wins over
  // every stylesheet rule regardless of layer order or specificity
  Object.entries(tokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })
  console.log('[v0] applyTheme:', resolved, 'bg now:', root.style.getPropertyValue('--color-background'))

  // data-theme attribute for CSS fallbacks / 3rd party integrations
  root.setAttribute('data-theme', preference === 'system' ? resolved : preference)

  // .dark class for Tailwind dark: variant utilities
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
    applyTheme(resolved, saved)

    // Watch OS preference changes when on "system"
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const current = (localStorage.getItem('cg-theme') ?? 'system') as Theme
      if (current === 'system') {
        const r = getSystemTheme()
        setResolvedTheme(r)
        applyTheme(r, 'system')
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
    applyTheme(resolved, t)
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
