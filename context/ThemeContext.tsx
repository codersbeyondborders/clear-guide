'use client'

import { createContext, useContext, useEffect } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

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
// Token maps — applied as CSS custom properties on <html> so all var()
// references throughout the app update instantly on theme change.
// ---------------------------------------------------------------------------
const LIGHT_TOKENS: Record<string, string> = {
  '--color-background':             '#ffffff',
  '--color-background-subtle':      '#f8fafc',
  '--color-card':                   '#ffffff',
  '--color-card-hover':             '#f1f5f9',
  '--color-foreground':             '#0f172a',
  '--color-muted-foreground':       '#64748b',
  '--color-primary':                '#00d084',
  '--color-primary-hover':          '#00b366',
  '--color-primary-foreground':     '#ffffff',
  '--color-primary-subtle':         '#ecfdf5',
  '--color-border':                 '#e2e8f0',
  '--color-border-strong':          '#cbd5e1',
  '--color-destructive':            '#dc2626',
  '--color-destructive-foreground': '#ffffff',
  '--color-ring':                   '#00d084',
}

const DARK_TOKENS: Record<string, string> = {
  '--color-background':             '#0f172a',
  '--color-background-subtle':      '#1e293b',
  '--color-card':                   '#1e293b',
  '--color-card-hover':             '#273548',
  '--color-foreground':             '#f1f5f9',
  '--color-muted-foreground':       '#94a3b8',
  '--color-primary':                '#10b981',
  '--color-primary-hover':          '#059669',
  '--color-primary-foreground':     '#0f172a',
  '--color-primary-subtle':         '#064e3b',
  '--color-border':                 '#334155',
  '--color-border-strong':          '#475569',
  '--color-destructive':            '#f87171',
  '--color-destructive-foreground': '#0f172a',
  '--color-ring':                   '#10b981',
}

function applyTokens(resolved: string) {
  const tokens = resolved === 'dark' ? DARK_TOKENS : LIGHT_TOKENS
  const root = document.documentElement
  Object.entries(tokens).forEach(([prop, val]) => root.style.setProperty(prop, val))
}

// ---------------------------------------------------------------------------
// Inner context — bridges next-themes → our ThemeContextValue shape
// ---------------------------------------------------------------------------
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
})

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useNextTheme()

  // Apply CSS custom property tokens whenever the resolved theme changes.
  // This keeps inline style tokens in sync with next-themes' resolved value,
  // so any var(--color-*) references not covered by .dark class selectors
  // also get updated correctly.
  useEffect(() => {
    if (resolvedTheme) applyTokens(resolvedTheme)
  }, [resolvedTheme])

  const value: ThemeContextValue = {
    theme: (theme ?? 'system') as Theme,
    resolvedTheme: (resolvedTheme ?? 'light') as 'light' | 'dark',
    setTheme: (t: Theme) => setTheme(t),
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Provider — wraps next-themes and our bridge
// ---------------------------------------------------------------------------
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="cg-theme"
      disableTransitionOnChange
    >
      <ThemeBridge>{children}</ThemeBridge>
    </NextThemesProvider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTheme() {
  return useContext(ThemeContext)
}
