'use client'

import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import {
  BookOpen, FileText, LayoutGrid, Video, MessageSquare,
  Globe, ChevronDown, Download, Loader2, AlertCircle,
} from 'lucide-react'
import { useState } from 'react'
import { LANGUAGE_LABELS } from '@/components/ViewerHeader'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ManualHubData {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  serialNumber: string | null
  description: string | null
  status: string
  languages: string[]
  coverImage: string | null
  sections: { id: string; title: string }[]
}

// ---------------------------------------------------------------------------
// Fetcher (public endpoint — no auth required)
// ---------------------------------------------------------------------------
const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json() as Promise<ManualHubData>
  })

// ---------------------------------------------------------------------------
// Mode cards
// ---------------------------------------------------------------------------
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
    description: 'Visual overview of all sections in a scannable, illustrated grid.',
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
    description: 'Type or speak — get instant answers from your product manual.',
    icon: MessageSquare,
  },
] as const

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------
function ClearGuideLogo() {
  return (
    <a
      href="/"
      className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      aria-label="ClearGuide home"
    >
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ManualHubPage() {
  const router     = useRouter()
  const params     = useParams()
  const manualId   = params.id as string

  const { data: manual, error, isLoading } = useSWR<ManualHubData>(
    manualId ? `/api/public/manuals/${manualId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [langOpen,     setLangOpen]     = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)

  const lang     = selectedLang ?? manual?.languages?.[0] ?? 'en'
  const langInfo = LANGUAGE_LABELS[lang] ?? { label: lang.toUpperCase(), flag: '🌐' }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
        role="status"
        aria-label="Loading manual"
      >
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
      </div>
    )
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (error || !manual) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5 p-8"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 15%, transparent)' }}
          aria-hidden="true"
        >
          <AlertCircle className="w-7 h-7" style={{ color: 'var(--color-destructive)' }} />
        </div>
        <p className="font-semibold text-balance text-center" style={{ color: 'var(--color-foreground)' }}>
          {error?.message === '404'
            ? 'This manual is not yet published or does not exist.'
            : 'Something went wrong loading this manual.'}
        </p>
        <button
          onClick={() => router.push('/user')}
          className="px-5 py-2.5 rounded-full border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
        >
          Back to search
        </button>
      </div>
    )
  }

  const sectionCount = manual.sections?.length ?? 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <ClearGuideLogo />

          <div className="flex items-center gap-1.5">
            {/* Language picker */}
            {manual.languages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setLangOpen(o => !o)}
                  disabled={manual.languages.length <= 1}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                  aria-haspopup={manual.languages.length > 1 ? 'listbox' : undefined}
                  aria-expanded={langOpen}
                  aria-label={`Language: ${langInfo.label}`}
                >
                  <span aria-hidden="true">{langInfo.flag}</span>
                  <span className="hidden sm:inline text-xs">{langInfo.label}</span>
                  {manual.languages.length > 1 && (
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  )}
                </button>
                {langOpen && manual.languages.length > 1 && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-lg z-30 overflow-hidden"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                    role="listbox"
                    aria-label="Select language"
                  >
                    {manual.languages.map(l => {
                      const info = LANGUAGE_LABELS[l] ?? { label: l.toUpperCase(), flag: '🌐' }
                      return (
                        <button
                          key={l}
                          role="option"
                          aria-selected={lang === l}
                          onClick={() => { setSelectedLang(l); setLangOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none"
                          style={{
                            color: lang === l ? 'var(--color-primary)' : 'var(--color-foreground)',
                            backgroundColor: lang === l ? 'var(--color-primary-subtle)' : 'transparent',
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

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main
        id="main-content"
        className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 flex flex-col gap-8"
      >
        {/* Product identity */}
        <div className="flex flex-col items-center text-center gap-3">
          {manual.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={manual.coverImage}
              alt={`${manual.productName} cover`}
              className="w-28 h-28 rounded-2xl object-cover border"
              style={{ borderColor: 'var(--color-border)' }}
            />
          )}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
            }}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Product Manual
          </span>
          <h1
            className="text-3xl font-bold text-balance tracking-tight"
            style={{ color: 'var(--color-foreground)' }}
          >
            {manual.productName}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {[
              manual.brand ? `by ${manual.brand}` : null,
              manual.productModel ?? null,
              sectionCount > 0 ? `${sectionCount} section${sectionCount !== 1 ? 's' : ''}` : null,
            ].filter(Boolean).join(' · ')}
          </p>
          {manual.description && (
            <p
              className="text-sm leading-relaxed text-pretty max-w-sm"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {manual.description}
            </p>
          )}
        </div>

        {/* Language selector (inline, under product identity) */}
        {manual.languages.length > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Globe className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>View in:</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select language">
              {manual.languages.map(l => {
                const info = LANGUAGE_LABELS[l] ?? { label: l.toUpperCase(), flag: '🌐' }
                const isActive = l === lang
                return (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-card)',
                      color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                      borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                    aria-pressed={isActive}
                  >
                    <span aria-hidden="true">{info.flag}</span>
                    {info.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Mode cards grid */}
        <section aria-labelledby="mode-heading">
          <h2
            id="mode-heading"
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Choose how to view
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MODES.map(mode => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => router.push(`/manual/${manualId}/${mode.id}`)}
                  className="flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  aria-label={`View as ${mode.label}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                    aria-hidden="true"
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
                      {mode.label}
                    </p>
                    <p
                      className="text-xs mt-1 leading-relaxed text-pretty"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      {mode.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Download */}
        <div className="relative">
          <button
            onClick={() => setDownloadOpen(o => !o)}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
            aria-haspopup="menu"
            aria-expanded={downloadOpen}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Save manual
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
          {downloadOpen && (
            <div
              className="absolute bottom-full mb-1 left-0 right-0 rounded-xl border shadow-lg overflow-hidden z-10"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              role="menu"
            >
              {['Text (.txt)', 'Data (.json)'].map(fmt => (
                <button
                  key={fmt}
                  role="menuitem"
                  onClick={() => setDownloadOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm transition-colors focus-visible:outline-none"
                  style={{ color: 'var(--color-foreground)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-background-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
