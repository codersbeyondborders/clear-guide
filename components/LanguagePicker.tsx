'use client'

import { Check } from 'lucide-react'

// BCP-47 language codes + display names + flag emojis (text only, no image)
export const SUPPORTED_LANGUAGES: { code: string; name: string; region: string }[] = [
  { code: 'en', name: 'English',    region: 'US' },
  { code: 'fr', name: 'French',     region: 'FR' },
  { code: 'de', name: 'German',     region: 'DE' },
  { code: 'es', name: 'Spanish',    region: 'ES' },
  { code: 'it', name: 'Italian',    region: 'IT' },
  { code: 'pt', name: 'Portuguese', region: 'PT' },
  { code: 'nl', name: 'Dutch',      region: 'NL' },
  { code: 'pl', name: 'Polish',     region: 'PL' },
  { code: 'ru', name: 'Russian',    region: 'RU' },
  { code: 'zh', name: 'Chinese',    region: 'CN' },
  { code: 'ja', name: 'Japanese',   region: 'JP' },
  { code: 'ko', name: 'Korean',     region: 'KR' },
  { code: 'ar', name: 'Arabic',     region: 'SA' },
  { code: 'hi', name: 'Hindi',      region: 'IN' },
  { code: 'tr', name: 'Turkish',    region: 'TR' },
  { code: 'sv', name: 'Swedish',    region: 'SE' },
]

interface LanguagePickerProps {
  selected: string[]
  onChange: (langs: string[]) => void
}

export function LanguagePicker({ selected, onChange }: LanguagePickerProps) {
  const toggle = (code: string) => {
    if (code === 'en') return // English is always selected
    if (selected.includes(code)) {
      onChange(selected.filter((l) => l !== code))
    } else {
      onChange([...selected, code])
    }
  }

  const additionalLangs = selected.filter((l) => l !== 'en')

  return (
    <div className="space-y-4">
      {/* Counter badge */}
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border"
          style={{
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
          }}
        >
          {selected.length} {selected.length === 1 ? 'language' : 'languages'} selected
        </span>
        {additionalLangs.length > 0 && (
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            AI will auto-translate to: {additionalLangs.map((l) => SUPPORTED_LANGUAGES.find((s) => s.code === l)?.name).join(', ')}
          </span>
        )}
      </div>

      {/* AI info box */}
      {additionalLangs.length > 0 && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-primary-subtle)',
            borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
            color: 'var(--color-primary)',
          }}
        >
          AI will automatically translate your content to{' '}
          <strong>{additionalLangs.length}</strong> additional{' '}
          {additionalLangs.length === 1 ? 'language' : 'languages'} when you publish.
        </div>
      )}

      {/* Language grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        role="group"
        aria-label="Select languages"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selected.includes(lang.code)
          const isDisabled = lang.code === 'en'
          return (
            <button
              key={lang.code}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={lang.name}
              disabled={isDisabled}
              onClick={() => toggle(lang.code)}
              className="relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                borderColor: isSelected
                  ? 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                  : 'var(--color-border)',
                cursor: isDisabled ? 'default' : 'pointer',
                opacity: isDisabled ? 1 : undefined,
              }}
            >
              {/* Flag placeholder — using region abbreviation */}
              <span
                className="w-8 h-6 rounded text-xs font-bold flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-background-subtle)',
                  color: isSelected ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                }}
                aria-hidden="true"
              >
                {lang.region}
              </span>
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                {lang.name}
              </span>
              {/* Checkmark */}
              {isSelected && (
                <span
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
              {isDisabled && (
                <span className="absolute top-2 right-2 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                  Default
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
