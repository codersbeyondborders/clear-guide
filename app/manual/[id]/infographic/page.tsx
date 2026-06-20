'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'
import Image from 'next/image'

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

// Mock infographic image URL — in production, this would be AI-generated
const DEMO_INFOGRAPHIC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/after-Fxe8lwx6J74SmS3LZvmRS5ye0R8CqI.webp'

function InfographicContent({ manual }: { manual: Manual }) {
  const params = useParams()
  const manualId = params.id as string
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')

  // Use the first available image across all sections as the infographic
  const firstImage = manual.sections.flatMap(s => s.imageUrls)[0] ?? DEMO_INFOGRAPHIC

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <ViewerHeader
        productName={manual.productName}
        manualId={manualId}
        availableLanguages={manual.languages}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
      />

      <main id="main-content" className="flex-1 p-4 lg:p-6">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
            {manual.productName}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Visual product overview
          </p>
        </div>

        {/* Full-width infographic */}
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firstImage}
            alt={`${manual.productName} visual product overview`}
            className="w-full object-contain"
            style={{ maxHeight: '70vh', backgroundColor: 'var(--color-background-subtle)' }}
          />
        </div>
      </main>

      <ViewerTabBar manualId={manualId} activeMode="infographic" />
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
      <InfographicContent manual={manual} />
    </AccessibilityProvider>
  )
}
