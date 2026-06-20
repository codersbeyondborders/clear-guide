'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, ZoomIn, ZoomOut, Info, Download, Globe, BookOpen, LayoutGrid, Video, MessageSquare, ChevronDown, FileText } from 'lucide-react'

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  status: string
  languages: string[]
  sections?: { id: string; title: string }[]
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

const MODES = [
  {
    id: 'text',
    label: 'Text with Images',
    description: 'Read the manual with inline images and step-by-step instructions.',
    icon: FileText,
  },
  {
    id: 'infographic',
    label: 'Infographic',
    description: 'Visual overview of the product in a single illustrated guide.',
    icon: LayoutGrid,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Watch guided video walkthroughs for each section.',
    icon: Video,
  },
  {
    id: 'chat',
    label: 'AI Chat',
    description: 'Type or speak — ask questions and get answers with optional audio.',
    icon: MessageSquare,
  },
] as const

function ClearGuideLogo() {
  return (
    <a href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="ClearGuide home">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="4" rx="1" fill="white" opacity="0.7" />
          <rect x="2" y="11" width="14" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="14" width="10" height="2" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div className="leading-none">
        <span className="block text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </a>
  )
}

export default function ManualWelcomePage() {
  const router = useRouter()
  const params = useParams()
  const manualId = params.id as string

  const [manual, setManual] = useState<Manual | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLang, setSelectedLang] = useState('en')
  const [langOpen, setLangOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)

  useEffect(() => {
    if (!manualId) return
    fetch(`/api/manuals/${manualId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Manual | null) => {
        setManual(data)
        if (data?.languages?.[0]) setSelectedLang(data.languages[0])
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [manualId])

  const langInfo = LANGUAGE_LABELS[selectedLang] ?? { label: selectedLang.toUpperCase(), flag: '🌐' }
  const sectionCount = manual?.sections?.length ?? 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          aria-label="Loading manual"
          role="status"
        />
      </div>
    )
  }

  if (!manual) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-8" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <p className="font-semibold" style={{ color: 'var(--color-destructive)' }}>Manual not found.</p>
        <button
          onClick={() => router.push('/user')}
          className="px-4 py-2 rounded-full border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
        >
          Back to search
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <ClearGuideLogo />

          {/* Right toolbar */}
          <div className="flex items-center gap-1.5">
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
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={`Language: ${langInfo.label}`}
              >
                <span aria-hidden="true">{langInfo.flag}</span>
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              {langOpen && manual.languages.length > 1 && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-lg z-30 overflow-hidden"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  role="listbox"
                  aria-label="Select language"
                >
                  {manual.languages.map(lang => {
                    const info = LANGUAGE_LABELS[lang] ?? { label: lang.toUpperCase(), flag: '🌐' }
                    return (
                      <button
                        key={lang}
                        role="option"
                        aria-selected={selectedLang === lang}
                        onClick={() => { setSelectedLang(lang); setLangOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none"
                        style={{ color: selectedLang === lang ? 'var(--color-primary)' : 'var(--color-foreground)' }}
                      >
                        <span aria-hidden="true">{info.flag}</span>
                        {info.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 flex flex-col gap-8">

        {/* Product identity */}
        <div className="flex flex-col items-center text-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)' }}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Product Manual
          </span>
          <h1 className="text-3xl font-bold text-balance tracking-tight" style={{ color: 'var(--color-foreground)' }}>
            {manual.productName}
          </h1>
          {(manual.brand || sectionCount > 0) && (
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              {[
                manual.brand ? `by ${manual.brand}` : null,
                sectionCount > 0 ? `${sectionCount} section${sectionCount !== 1 ? 's' : ''}` : null,
              ].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Language selector */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2" style={{ color: 'var(--color-muted-foreground)' }}>
            <Globe className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>View in:</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              disabled={manual.languages.length <= 1}
              className="flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)',
                backgroundColor: 'var(--color-card)',
                cursor: manual.languages.length <= 1 ? 'default' : 'pointer',
              }}
              aria-haspopup={manual.languages.length > 1 ? 'listbox' : undefined}
              aria-expanded={langOpen}
              aria-label={`View in ${langInfo.label}`}
            >
              <span aria-hidden="true">{langInfo.flag}</span>
              {langInfo.label}
              {manual.languages.length > 1 && <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
            {langOpen && manual.languages.length > 1 && (
              <div
                className="absolute left-0 top-full mt-1 w-48 rounded-xl border shadow-lg z-30 overflow-hidden"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                role="listbox"
                aria-label="Select language"
              >
                {manual.languages.map(lang => {
                  const info = LANGUAGE_LABELS[lang] ?? { label: lang.toUpperCase(), flag: '🌐' }
                  return (
                    <button
                      key={lang}
                      role="option"
                      aria-selected={selectedLang === lang}
                      onClick={() => { setSelectedLang(lang); setLangOpen(false) }}
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
        </div>

        {/* Mode selector grid */}
        <section aria-labelledby="mode-heading">
          <h2 id="mode-heading" className="sr-only">Choose how to view this manual</h2>
          <div className="grid grid-cols-2 gap-3">
            {MODES.map(mode => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => router.push(`/manual/${manualId}/${mode.id}`)}
                  className="flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  aria-label={`View manual as ${mode.label}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
                      {mode.label}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
                      {mode.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Download button */}
        <div className="relative">
          <button
            onClick={() => setDownloadOpen(o => !o)}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
            aria-haspopup="menu"
            aria-expanded={downloadOpen}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
          {downloadOpen && (
            <div
              className="absolute bottom-full mb-1 left-0 right-0 rounded-xl border shadow-lg overflow-hidden z-10"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              role="menu"
            >
              {['PDF', 'DOCX'].map(fmt => (
                <button
                  key={fmt}
                  role="menuitem"
                  onClick={() => setDownloadOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  Download as {fmt}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
