'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/context/ThemeContext'

// ---------------------------------------------------------------------------
// Compact icon-only cycle button  (light → dark → system → light)
// ---------------------------------------------------------------------------
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const cycle: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const label =
    theme === 'light' ? 'Switch to dark mode' :
    theme === 'dark'  ? 'Switch to system theme' :
                        'Switch to light mode'

  return (
    <button
      type="button"
      onClick={() => setTheme(cycle[theme])}
      className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''}`}
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-muted-foreground)',
        backgroundColor: 'transparent',
      }}
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Three-button segmented control (for Settings or prominent placements)
// ---------------------------------------------------------------------------
export function ThemeSegmentedControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const options: { value: Theme; icon: React.ElementType; label: string }[] = [
    { value: 'light',  icon: Sun,     label: 'Light'  },
    { value: 'dark',   icon: Moon,    label: 'Dark'   },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${className ?? ''}`}
      style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            backgroundColor: theme === value ? 'var(--color-card)' : 'transparent',
            color: theme === value ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
            boxShadow: theme === value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
