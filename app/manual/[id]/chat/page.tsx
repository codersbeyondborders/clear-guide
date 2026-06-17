'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { ChatContainer } from '@/components/ChatContainer'

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  languages: string[]
}

function ChatModeContent({ manual }: { manual: Manual }) {
  const router = useRouter()
  const params = useParams()
  const manualId = params.id as string
  const { highContrast } = useAccessibility()
  const hc = highContrast

  return (
    <div className={`min-h-screen flex flex-col ${hc ? 'bg-black text-yellow-400' : 'bg-background text-foreground'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-20 ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-card border-border'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/manual/${manualId}`)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border hover:border-primary hover:text-primary focus-visible:outline-primary'}`}
            aria-label="Back to mode selection"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-xs truncate ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>{manual.productName}</p>
            <p className={`text-sm font-semibold ${hc ? 'text-yellow-300' : 'text-foreground'}`}>AI Chat</p>
          </div>
          {/* High contrast toggle only — chat already has its own mic/TTS in ChatContainer */}
          <button
            onClick={() => {}}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${hc ? 'bg-yellow-400 text-black' : 'bg-background-subtle text-muted-foreground border border-border hover:text-foreground'}`}
            aria-label={hc ? 'Disable high contrast' : 'Enable high contrast'}
          >
            {hc ? 'Standard' : 'High Contrast'}
          </button>
        </div>
      </header>

      {/* Full-height chat area */}
      <main
        id="main-content"
        className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col"
        style={{ minHeight: 'calc(100dvh - 65px)' }}
      >
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          <ChatContainer manualId={manualId} productName={manual.productName} />
        </div>
      </main>
    </div>
  )
}

export default function ChatModePage() {
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
      <ChatModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
