'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ZoomIn, ZoomOut, Info, Download, Volume2, VolumeX, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ViewerHeaderProps {
  productName: string
  manualId: string
  availableLanguages: string[]
  selectedLang: string
  onLangChange: (lang: string) => void
  muted?: boolean
  onToggleMute?: () => void
  showMute?: boolean
}

const LANGUAGE_LABELS: Record<string, { label: string; flag: string }> = {
  en: { label: 'English',    flag: '🇬🇧' },
  fr: { label: 'French',     flag: '🇫🇷' },
  de: { label: 'German',     flag: '🇩🇪' },
  es: { label: 'Spanish',    flag: '🇪🇸' },
  it: { label: 'Italian',    flag: '🇮🇹' },
  pt: { label: 'Portuguese', flag: '🇵🇹' },
  nl: { label: 'Dutch',      flag: '🇳🇱' },
  pl: { label: 'Polish',     flag: '🇵🇱' },
  ru: { label: 'Russian',    flag: '🇷🇺' },
  zh: { label: 'Chinese',    flag: '🇨🇳' },
  ja: { label: 'Japanese',   flag: '🇯🇵' },
  ko: { label: 'Korean',     flag: '🇰🇷' },
  ar: { label: 'Arabic',     flag: '🇸🇦' },
  hi: { label: 'Hindi',      flag: '🇮🇳' },
  tr: { label: 'Turkish',    flag: '🇹🇷' },
  sv: { label: 'Swedish',    flag: '🇸🇪' },
}

function ClearGuideLogo() {
  return (
    <a href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded shrink-0" aria-label="ClearGuide home">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="4" rx="1" fill="white" opacity="0.7" />
          <rect x="2" y="11" width="14" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="14" width="10" height="2" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div className="leading-none hidden sm:block">
        <span className="block text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </a>
  )
}

export function ViewerHeader({
  productName,
  manualId,
  availableLanguages,
  selectedLang,
  onLangChange,
  muted = false,
  onToggleMute,
  showMute = false,
}: ViewerHeaderProps) {
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)

  const langInfo = LANGUAGE_LABELS[selectedLang] ?? { label: selectedLang.toUpperCase(), flag: '🌐' }

  return (
    <header
      className="border-b sticky top-0 z-20"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="w-full px-4 h-14 flex items-center gap-2">
        {/* Back */}
        <button
          onClick={() => router.push(`/manual/${manualId}`)}
          className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
          aria-label="Back to manual overview"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Logo */}
        <ClearGuideLogo />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm min-w-0">
          <span style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true">/</span>
          <span className="font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
            {productName}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right toolbar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mute toggle (optional) */}
          {showMute && onToggleMute && (
            <button
              onClick={onToggleMute}
              className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
              aria-label={muted ? 'Unmute' : 'Mute'}
              aria-pressed={muted}
            >
              {muted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
            </button>
          )}

          {/* Zoom out */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Zoom in */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Info */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            aria-label="Manual information"
          >
            <Info className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Download */}
          <div className="relative">
            <button
              onClick={() => setDownloadOpen(o => !o)}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
              aria-haspopup="menu"
              aria-expanded={downloadOpen}
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Download
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
            {downloadOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded-xl border shadow-lg z-30 overflow-hidden"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                role="menu"
              >
                {['PDF', 'DOCX'].map(fmt => (
                  <button
                    key={fmt}
                    role="menuitem"
                    onClick={() => setDownloadOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    Download as {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language */}
          {availableLanguages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1 h-9 px-2.5 rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={`Language: ${langInfo.label}`}
              >
                <span aria-hidden="true">{langInfo.flag}</span>
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-lg z-30 overflow-hidden"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  role="listbox"
                  aria-label="Select language"
                >
                  {availableLanguages.map(lang => {
                    const info = LANGUAGE_LABELS[lang] ?? { label: lang.toUpperCase(), flag: '🌐' }
                    return (
                      <button
                        key={lang}
                        role="option"
                        aria-selected={selectedLang === lang}
                        onClick={() => { onLangChange(lang); setLangOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none"
                        style={{
                          color: selectedLang === lang ? 'var(--color-primary)' : 'var(--color-foreground)',
                          backgroundColor: selectedLang === lang ? 'var(--color-primary-subtle)' : 'transparent',
                        }}
                      >
                        <span aria-hidden="true">{info.flag}</span>
                        {info.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
