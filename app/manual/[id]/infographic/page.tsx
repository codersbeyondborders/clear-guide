'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { AccessibilityControls } from '@/components/AccessibilityControls'

interface Section {
  id: string
  sectionNumber: number
  title: string
  content: string
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

// Derives up to 3 bullet points from section content for infographic cards
function getBullets(content: string, max = 3): string[] {
  const lines = content
    .split('\n')
    .map(l => l.replace(/^[\d\-\*\.\s]+/, '').trim())
    .filter(l => l.length > 10)
  return lines.slice(0, max)
}

// Step indicator colors cycling through 4 accent palettes
const STEP_ACCENTS = [
  { bg: 'bg-emerald-50 dark:bg-emerald-950', number: 'bg-emerald-500 text-white', border: 'border-emerald-200 dark:border-emerald-800' },
  { bg: 'bg-blue-50 dark:bg-blue-950', number: 'bg-blue-500 text-white', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-orange-50 dark:bg-orange-950', number: 'bg-orange-500 text-white', border: 'border-orange-200 dark:border-orange-800' },
  { bg: 'bg-violet-50 dark:bg-violet-950', number: 'bg-violet-500 text-white', border: 'border-violet-200 dark:border-violet-800' },
]

const HC_STEP_ACCENTS = { bg: 'bg-gray-900', number: 'bg-yellow-400 text-black', border: 'border-yellow-400/40' }

function InfographicContent({ manual }: { manual: Manual }) {
  const router = useRouter()
  const params = useParams()
  const manualId = params.id as string
  const { highContrast, fontSizeClass } = useAccessibility()
  const hc = highContrast

  return (
    <div className={`min-h-screen flex flex-col ${hc ? 'bg-black text-yellow-400' : 'bg-background text-foreground'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-20 ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-card border-border'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/manual/${manualId}`)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border hover:border-primary hover:text-primary focus-visible:outline-primary'}`}
            aria-label="Back to mode selection"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-xs truncate ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>{manual.productName}</p>
            <p className={`text-sm font-semibold ${hc ? 'text-yellow-300' : 'text-foreground'}`}>Infographic</p>
          </div>
          <AccessibilityControls availableLanguages={manual.languages} />
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className={`text-3xl font-bold text-balance ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
            {manual.productName}
          </h1>
          {(manual.brand || manual.productModel) && (
            <p className={`mt-1 text-sm ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
              {[manual.brand, manual.productModel].filter(Boolean).join(' · ')}
            </p>
          )}
          <p className={`mt-2 text-xs ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {manual.sections.length} step{manual.sections.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Progress flow — horizontal arrows on desktop */}
        <section aria-label="Quick steps overview" className="mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {manual.sections.map((section, idx) => {
              const accent = STEP_ACCENTS[idx % STEP_ACCENTS.length]
              const numCls = hc ? HC_STEP_ACCENTS.number : accent.number
              return (
                <div key={section.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold ${hc ? `${HC_STEP_ACCENTS.bg} ${HC_STEP_ACCENTS.border} text-yellow-400` : `${accent.bg} ${accent.border} text-foreground`}`}>
                    <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 ${numCls}`} aria-hidden="true">
                      {section.sectionNumber}
                    </span>
                    <span className="truncate max-w-[120px]">{section.title}</span>
                  </div>
                  {idx < manual.sections.length - 1 && (
                    <span className={`text-lg font-light ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`} aria-hidden="true">&rarr;</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Detail cards grid */}
        <section aria-label="Step details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {manual.sections.map((section, idx) => {
              const accent = STEP_ACCENTS[idx % STEP_ACCENTS.length]
              const bullets = getBullets(section.content)
              return (
                <article
                  key={section.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col ${hc ? `bg-gray-900 ${HC_STEP_ACCENTS.border}` : `${accent.bg} ${accent.border}`}`}
                  aria-labelledby={`step-title-${section.id}`}
                >
                  {/* Card header strip */}
                  <div className={`px-5 pt-5 pb-4 ${hc ? '' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${hc ? HC_STEP_ACCENTS.number : accent.number}`} aria-hidden="true">
                        {section.sectionNumber}
                      </div>
                      <h2 id={`step-title-${section.id}`} className={`font-bold text-sm text-pretty flex-1 min-w-0 ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  {/* Bullets */}
                  <div className="flex-1 px-5 pb-5">
                    {bullets.length > 0 ? (
                      <ul className={`space-y-2 ${fontSizeClass}`} aria-label={`Key points for ${section.title}`}>
                        {bullets.map((b, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm leading-relaxed ${hc ? 'text-yellow-200' : 'text-foreground'}`}>
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${hc ? 'text-yellow-400' : 'text-primary'}`} aria-hidden="true" />
                            <span className="text-pretty">{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-sm leading-relaxed ${fontSizeClass} ${hc ? 'text-yellow-200' : 'text-foreground'} text-pretty`}>
                        {section.content.slice(0, 140)}{section.content.length > 140 ? '…' : ''}
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default function InfographicModePage() {
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
      <InfographicContent manual={manual} />
    </AccessibilityProvider>
  )
}
