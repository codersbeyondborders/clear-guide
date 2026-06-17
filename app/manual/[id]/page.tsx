'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Download, Globe } from 'lucide-react'
import { ModeSelector } from '@/components/ModeSelector'
import { AccessibilityProvider } from '@/context/AccessibilityContext'

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  status: string
  languages: string[]
  sections?: { id: string; title: string }[]
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español', it: 'Italiano',
  pt: 'Português', nl: 'Nederlands', pl: 'Polski', ja: '日本語', ko: '한국어',
  zh: '中文', ar: 'العربية', hi: 'हिन्दी', ru: 'Русский', sv: 'Svenska', tr: 'Türkçe',
}

export default function ManualWelcomePage() {
  const router = useRouter()
  const params = useParams()
  const manualId = params.id as string

  const [manual, setManual] = useState<Manual | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLang, setSelectedLang] = useState('en')
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    if (!manualId) return
    fetch(`/api/manuals/${manualId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setManual(data); if (data?.languages?.[0]) setSelectedLang(data.languages[0]) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [manualId])

  const hc = highContrast
  const base = hc ? 'bg-black text-yellow-400 min-h-screen' : 'bg-background text-foreground min-h-screen'

  if (loading) {
    return (
      <div className={`${base} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-10 h-10 rounded-full border-4 border-t-transparent animate-spin ${hc ? 'border-yellow-400' : 'border-primary'}`} aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading manual...</p>
        </div>
      </div>
    )
  }

  if (!manual) {
    return (
      <div className={`${base} flex flex-col items-center justify-center gap-5 p-8`}>
        <p className="text-destructive font-semibold">Manual not found.</p>
        <button onClick={() => router.push('/user')} className="btn-outline">
          Back to search
        </button>
      </div>
    )
  }

  return (
    <AccessibilityProvider initialLanguage={selectedLang}>
      <div className={base}>
        {/* Header */}
        <header className={`border-b sticky top-0 z-20 ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-card border-border'}`}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push('/user')}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border hover:border-primary hover:text-primary focus-visible:outline-primary'
              }`}
              aria-label="Back to search"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className={`text-base font-bold truncate flex-1 ${hc ? 'text-yellow-400' : 'text-primary'}`}>
              ClearGuide
            </span>
            <button
              onClick={() => setHighContrast(c => !c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                hc ? 'bg-yellow-400 text-black focus-visible:outline-yellow-400' : 'bg-background-subtle text-muted-foreground hover:text-foreground border border-border focus-visible:outline-primary'
              }`}
              aria-label={hc ? 'Disable high contrast mode' : 'Enable high contrast mode'}
              aria-pressed={hc}
            >
              {hc ? 'Standard' : 'High Contrast'}
            </button>
          </div>
        </header>

        <main id="main-content" className="max-w-2xl mx-auto px-6 py-10 space-y-8">
          {/* Product identity card */}
          <section
            className={`rounded-2xl border p-6 ${hc ? 'border-yellow-400 bg-gray-900' : 'card'}`}
            aria-labelledby="product-name-heading"
          >
            <div className="flex items-start gap-4">
              {/* Product icon placeholder */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${hc ? 'bg-yellow-400 text-black' : 'bg-primary-subtle text-primary'}`}
                aria-hidden="true"
              >
                {manual.productName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${hc ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40' : 'badge badge-green'}`}>
                  {manual.status === 'published' ? 'Published' : manual.status.charAt(0).toUpperCase() + manual.status.slice(1)}
                </div>
                <h1 id="product-name-heading" className={`text-xl font-bold text-balance ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
                  {manual.productName}
                </h1>
                <p className={`text-sm mt-0.5 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  {[manual.brand, manual.productModel].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {/* Language selector */}
            {manual.languages.length > 1 && (
              <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                <Globe className={`w-4 h-4 flex-shrink-0 ${hc ? 'text-yellow-400' : 'text-muted-foreground'}`} aria-hidden="true" />
                <label htmlFor="welcome-lang" className={`text-sm font-medium flex-shrink-0 ${hc ? 'text-yellow-400' : 'text-foreground'}`}>
                  Language
                </label>
                <select
                  id="welcome-lang"
                  value={selectedLang}
                  onChange={e => setSelectedLang(e.target.value)}
                  className={`flex-1 max-w-[180px] h-9 px-3 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-2 ${
                    hc ? 'bg-black text-yellow-400 border-yellow-400 focus:ring-yellow-400' : 'bg-card text-foreground border-border focus:ring-primary'
                  }`}
                >
                  {manual.languages.map(lang => (
                    <option key={lang} value={lang}>{LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* Mode selection */}
          <section aria-labelledby="mode-heading">
            <h2 id="mode-heading" className={`text-lg font-bold mb-4 ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
              How would you like to view this guide?
            </h2>
            <ModeSelector manualId={manualId} highContrast={hc} />
          </section>

          {/* Download */}
          <section aria-labelledby="download-heading" className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${hc ? 'border-yellow-400/40 bg-gray-900' : 'border-border bg-background-subtle'}`}>
            <div>
              <h2 id="download-heading" className={`text-sm font-semibold ${hc ? 'text-yellow-300' : 'text-foreground'}`}>
                Download Manual
              </h2>
              <p className={`text-xs mt-0.5 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                Save a copy to your device.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'bg-yellow-400 text-black hover:bg-yellow-300 focus-visible:outline-yellow-400' : 'btn-outline text-xs py-2 px-3'}`}
                aria-label="Download manual as PDF"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                PDF
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'btn-ghost text-xs py-2 px-3 border border-border'}`}
                aria-label="Download manual as Word document"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                DOCX
              </button>
            </div>
          </section>
        </main>
      </div>
    </AccessibilityProvider>
  )
}
