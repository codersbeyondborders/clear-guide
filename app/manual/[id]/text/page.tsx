'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'
import { ManualSidebar } from '@/components/ManualSidebar'
import { useTTS } from '@/hooks/useTTS'
import { Volume2 } from 'lucide-react'

interface Section {
  id: string
  sectionNumber: number
  title: string
  content: string
  imageUrls: string[]
  videoUrls: string[]
}

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  status: string
  languages: string[]
  sections: Section[]
}

function TextModeContent({ manual }: { manual: Manual }) {
  const params = useParams()
  const manualId = params.id as string
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')
  const [muted, setMuted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const { fontSizeClass } = useAccessibility()
  const { speak, ttsEnabled } = useTTS()

  const section = manual.sections[activeIndex]

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeIndex])

  useEffect(() => {
    if (section && ttsEnabled && !muted) speak(`${section.title}. ${section.content}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id, ttsEnabled, muted])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <ViewerHeader
        productName={manual.productName}
        manualId={manualId}
        availableLanguages={manual.languages}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
        showMute={ttsEnabled}
        muted={muted}
        onToggleMute={() => setMuted(m => !m)}
      />

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-52 shrink-0 border-r overflow-y-auto"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          aria-label="Manual sections"
        >
          <p
            className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Sections
          </p>
          <nav>
            <ul>
              {manual.sections.map((s, idx) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveIndex(idx)}
                    className="w-full text-left px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    style={{
                      backgroundColor: idx === activeIndex ? 'var(--color-primary-subtle)' : 'transparent',
                      color: idx === activeIndex ? 'var(--color-primary)' : 'var(--color-foreground)',
                      fontWeight: idx === activeIndex ? 600 : 400,
                    }}
                    aria-current={idx === activeIndex ? 'true' : undefined}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content area */}
        <main
          id="main-content"
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Mobile section nav */}
          <div className="lg:hidden mb-4">
            <ManualSidebar
              sections={manual.sections}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
          </div>

          {section ? (
            <article className="max-w-2xl">
              {/* Section title */}
              <div className="flex items-start gap-3 mb-6">
                <h1 className="text-2xl font-bold flex-1 text-balance" style={{ color: 'var(--color-foreground)' }}>
                  {section.title}
                </h1>
                {ttsEnabled && (
                  <button
                    onClick={() => speak(`${section.title}. ${section.content}`)}
                    className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
                    aria-label="Read section aloud"
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Section image (first image shown prominently) */}
              {section.imageUrls.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.imageUrls[0]}
                  alt={`${section.title} illustration`}
                  className="w-full rounded-xl object-cover mb-6"
                  style={{ maxHeight: '320px' }}
                />
              )}

              {/* Section text */}
              <div
                className={`leading-relaxed whitespace-pre-line ${fontSizeClass}`}
                style={{ color: 'var(--color-foreground)' }}
              >
                {section.content || (
                  <span style={{ color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>
                    No content for this section.
                  </span>
                )}
              </div>

              {/* Additional images */}
              {section.imageUrls.length > 1 && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {section.imageUrls.slice(1).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`${section.title} image ${i + 2}`}
                      className="w-full rounded-xl object-cover aspect-video"
                    />
                  ))}
                </div>
              )}
            </article>
          ) : (
            <p style={{ color: 'var(--color-muted-foreground)' }}>No sections available.</p>
          )}
        </main>
      </div>

      <ViewerTabBar manualId={manualId} activeMode="text" />
    </div>
  )
}

export default function TextModePage() {
  const params = useParams()
  const manualId = params.id as string
  const [manual, setManual] = useState<Manual | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!manualId) return
    fetch(`/api/manuals/${manualId}`)
      .then(r => r.ok ? r.json() : null)
      .then(setManual)
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [manualId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} role="status" aria-label="Loading" />
      </div>
    )
  }
  if (!manual) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <p style={{ color: 'var(--color-destructive)' }}>Could not load manual.</p>
      </div>
    )
  }
  return (
    <AccessibilityProvider initialLanguage={manual.languages?.[0] ?? 'en'}>
      <TextModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
