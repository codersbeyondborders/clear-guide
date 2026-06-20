'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Volume2 } from 'lucide-react'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'

const VideoPlayer = dynamic(
  () => import('@/components/VideoPlayer').then(m => m.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-xl border animate-pulse"
        style={{ aspectRatio: '16/9', backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
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
  const params = useParams()
  const manualId = params.id as string
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')

  const section = manual.sections[activeIndex]

  // Use the section image as a thumbnail fallback
  const getThumbnail = (s: Section) => s.imageUrls[0] ?? null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <ViewerHeader
        productName={manual.productName}
        manualId={manualId}
        availableLanguages={manual.languages}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
      />

      <main id="main-content" className="flex-1 p-4 lg:p-6 space-y-5">
        {section ? (
          <>
            {/* Section title */}
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              {section.title}
            </h1>

            {/* Video player */}
            <VideoPlayer src={section.videoUrls[0]} title={section.title} />

            {/* Audio description */}
            {section.content && (
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-primary-subtle)' }}
              >
                <Volume2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-primary)' }}>
                  {section.content}
                </p>
              </div>
            )}

            {/* All sections thumbnails */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted-foreground)' }}>
                All sections
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {manual.sections.map((s, idx) => {
                  const thumb = getThumbnail(s)
                  const isActive = idx === activeIndex
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveIndex(idx)}
                      className="shrink-0 w-32 rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{
                        borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                      aria-label={`Go to section: ${s.title}`}
                      aria-pressed={isActive}
                    >
                      {/* Thumbnail */}
                      <div
                        className="relative w-full aspect-video"
                        style={{ backgroundColor: 'var(--color-background-subtle)' }}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                              <circle cx="10" cy="10" r="8" fill="var(--color-primary)" opacity="0.2" />
                              <polygon points="8,7 15,10 8,13" fill="var(--color-primary)" />
                            </svg>
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(0,0,0,0.4)' }}
                            aria-hidden="true"
                          >
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
                              <polygon points="0,0 10,6 0,12" fill="white" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Label */}
                      <div
                        className="px-2 py-1.5"
                        style={{ backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-card)' }}
                      >
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: isActive ? 'white' : 'var(--color-foreground)' }}
                        >
                          {s.title}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--color-muted-foreground)' }}>No sections available.</p>
        )}
      </main>

      <ViewerTabBar manualId={manualId} activeMode="video" />
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
      <VideoModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
