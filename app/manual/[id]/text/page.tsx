'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { AccessibilityControls } from '@/components/AccessibilityControls'
import { ManualSidebar } from '@/components/ManualSidebar'
import { useTTS } from '@/hooks/useTTS'

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

// ─── Inner page (needs AccessibilityContext) ──────────────────────────────────
function TextModeContent({ manual }: { manual: Manual }) {
  const router = useRouter()
  const params = useParams()
  const manualId = params.id as string

  const [activeIndex, setActiveIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const { highContrast, fontSizeClass } = useAccessibility()
  const { speak, ttsEnabled } = useTTS()
  const hc = highContrast

  const section = manual.sections[activeIndex]
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < manual.sections.length - 1

  // Scroll content to top on section change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeIndex])

  // Auto-read if TTS enabled
  useEffect(() => {
    if (section && ttsEnabled) speak(`${section.title}. ${section.content}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id, ttsEnabled])

  return (
    <div className={`min-h-screen flex flex-col ${hc ? 'bg-black text-yellow-400' : 'bg-background text-foreground'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-20 ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-card border-border'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          {/* Back */}
          <button
            onClick={() => router.push(`/manual/${manualId}`)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border hover:border-primary hover:text-primary focus-visible:outline-primary'}`}
            aria-label="Back to mode selection"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium truncate ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>{manual.productName}</p>
            <p className={`text-sm font-semibold truncate ${hc ? 'text-yellow-300' : 'text-foreground'}`}>Text Guide</p>
          </div>

          {/* Accessibility controls */}
          <AccessibilityControls availableLanguages={manual.languages} className="ml-auto" />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6 items-start">
        {/* Sidebar */}
        <ManualSidebar
          sections={manual.sections}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        {/* Content */}
        <main
          id="main-content"
          ref={contentRef}
          className="flex-1 min-w-0 space-y-6"
          aria-live="polite"
          aria-atomic="false"
        >
          {section ? (
            <article className={`rounded-2xl border p-6 sm:p-8 ${hc ? 'bg-gray-900 border-yellow-400/40' : 'card'}`}>
              {/* Section header */}
              <header className="mb-5">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  Section {section.sectionNumber} of {manual.sections.length}
                </p>
                <div className="flex items-start gap-3">
                  <h1 className={`text-2xl font-bold flex-1 text-balance ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
                    {section.title}
                  </h1>
                  {ttsEnabled && (
                    <button
                      onClick={() => speak(`${section.title}. ${section.content}`)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border text-muted-foreground hover:text-primary hover:border-primary focus-visible:outline-primary'}`}
                      aria-label="Read section aloud"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </header>

              {/* Content */}
              <div className={`prose max-w-none leading-relaxed whitespace-pre-line ${fontSizeClass} ${hc ? 'text-yellow-200' : 'text-foreground'}`}>
                {section.content || <span className="text-muted-foreground italic">No content for this section.</span>}
              </div>

              {/* Images */}
              {section.imageUrls.length > 0 && (
                <section aria-label="Section images" className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {section.imageUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url}
                        alt={`Section ${section.sectionNumber} image ${i + 1}`}
                        className="w-full rounded-xl object-cover aspect-video border border-border"
                      />
                    ))}
                  </div>
                </section>
              )}
            </article>
          ) : (
            <p className={hc ? 'text-yellow-600' : 'text-muted-foreground'}>No sections available.</p>
          )}

          {/* Prev / Next navigation */}
          <nav aria-label="Section navigation" className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveIndex(i => i - 1)}
              disabled={!hasPrev}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${hc ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'btn-outline'}`}
              aria-label="Previous section"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Previous
            </button>
            <span className={`text-xs ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`} aria-live="polite">
              {activeIndex + 1} / {manual.sections.length}
            </span>
            <button
              onClick={() => setActiveIndex(i => i + 1)}
              disabled={!hasNext}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${hc ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'btn-primary'}`}
              aria-label="Next section"
            >
              Next
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </nav>
        </main>
      </div>
    </div>
  )
}

// ─── Loader shell ─────────────────────────────────────────────────────────────
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent border-primary animate-spin" aria-label="Loading" />
      </div>
    )
  }

  if (!manual) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Could not load manual.</p>
      </div>
    )
  }

  return (
    <AccessibilityProvider initialLanguage={manual.languages?.[0] ?? 'en'}>
      <TextModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
