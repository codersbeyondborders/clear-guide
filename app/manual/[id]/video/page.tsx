'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { AccessibilityControls } from '@/components/AccessibilityControls'
import { SectionThumbnails } from '@/components/SectionThumbnails'

// VideoPlayer uses browser-only APIs — load client-side only
const VideoPlayer = dynamic(
  () => import('@/components/VideoPlayer').then(m => m.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full aspect-video rounded-2xl border animate-pulse"
        style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
        aria-hidden="true"
      />
    ),
  },
)

interface Section {
  id: string
  sectionNumber: number
  title: string
  content: string
  videoUrls: string[]
  imageUrls: string[]
}

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  languages: string[]
  sections: Section[]
}

function VideoModeContent({ manual }: { manual: Manual }) {
  const router = useRouter()
  const params = useParams()
  const manualId = params.id as string
  const [activeIndex, setActiveIndex] = useState(0)
  const { highContrast, fontSizeClass } = useAccessibility()
  const hc = highContrast

  const section = manual.sections[activeIndex]

  return (
    <div className={`min-h-screen flex flex-col ${hc ? 'bg-black text-yellow-400' : 'bg-background text-foreground'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-20 ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-card border-border'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/manual/${manualId}`)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border hover:border-primary hover:text-primary focus-visible:outline-primary'}`}
            aria-label="Back to mode selection"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-xs truncate ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>{manual.productName}</p>
            <p className={`text-sm font-semibold ${hc ? 'text-yellow-300' : 'text-foreground'}`}>Video Guide</p>
          </div>
          <AccessibilityControls availableLanguages={manual.languages} />
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Main video area */}
        <main id="main-content" className="flex-1 min-w-0 space-y-5">
          {section && (
            <>
              {/* Section title */}
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  Section {section.sectionNumber} of {manual.sections.length}
                </p>
                <h1 className={`text-xl font-bold text-balance ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
                  {section.title}
                </h1>
              </div>

              {/* Video player */}
              <VideoPlayer
                src={section.videoUrls[0]}
                title={section.title}
              />

              {/* Section description */}
              {section.content && (
                <article className={`rounded-2xl border p-5 ${hc ? 'bg-gray-900 border-yellow-400/40' : 'card'}`}>
                  <h2 className={`text-sm font-semibold mb-2 ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
                    About this section
                  </h2>
                  <p className={`whitespace-pre-line leading-relaxed ${fontSizeClass} ${hc ? 'text-yellow-200' : 'text-muted-foreground'}`}>
                    {section.content}
                  </p>
                </article>
              )}
            </>
          )}
        </main>

        {/* Section thumbnail panel */}
        <aside
          className={`w-full lg:w-64 flex-shrink-0 rounded-2xl border p-4 self-start ${hc ? 'bg-gray-900 border-yellow-400/40' : 'card'}`}
          aria-label="Section list"
        >
          <SectionThumbnails
            sections={manual.sections}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </aside>
      </div>
    </div>
  )
}

export default function VideoModePage() {
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
      <VideoModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
