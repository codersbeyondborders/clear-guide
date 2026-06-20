'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Send, Mic, Volume2 } from 'lucide-react'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'

interface Section { id: string; sectionNumber: number; title: string }

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  languages: string[]
  sections: Section[]
}

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

function ChatModeContent({ manual }: { manual: Manual }) {
  const params = useParams()
  const manualId = params.id as string
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')
  const [activeSection, setActiveSection] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI Support Assistant. Type a question or tap the mic to speak.`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualId, question: text }),
      })
      const data = await res.json() as { answer?: string }
      const reply: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.answer ?? 'I could not find an answer. Please try rephrasing your question.',
      }
      setMessages(prev => [...prev, reply])
    } catch {
      setMessages(prev => [
        ...prev,
        { id: `err_${Date.now()}`, role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <ViewerHeader
        productName={manual.productName}
        manualId={manualId}
        availableLanguages={manual.languages}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
      />

      {/* Body: sidebar + chat */}
      <div className="flex flex-1 min-h-0" style={{ minHeight: 0 }}>
        {/* Left sidebar — sections list */}
        <aside
          className="hidden lg:flex flex-col w-52 shrink-0 border-r overflow-y-auto"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          aria-label="Manual sections"
        >
          <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>
            Sections
          </p>
          <nav>
            <ul>
              {manual.sections.map((s, idx) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveSection(idx)}
                    className="w-full text-left px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    style={{
                      backgroundColor: idx === activeSection ? 'var(--color-primary-subtle)' : 'transparent',
                      color: idx === activeSection ? 'var(--color-primary)' : 'var(--color-foreground)',
                      fontWeight: idx === activeSection ? 600 : 400,
                    }}
                    aria-current={idx === activeSection ? 'true' : undefined}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                aria-hidden="true"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="2" y="3" width="14" height="11" rx="3" fill="white" opacity="0.9" />
                  <path d="M6 14l-2 3h8l-2-3" fill="white" opacity="0.6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI Chat</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>Type or speak your question</p>
              </div>
            </div>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              aria-label="Toggle audio"
            >
              <Volume2 className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    aria-hidden="true"
                  >
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <rect x="2" y="3" width="14" height="11" rx="3" fill="white" opacity="0.9" />
                      <path d="M6 14l-2 3h8l-2-3" fill="white" opacity="0.6" />
                    </svg>
                  </div>
                )}
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-card)',
                    color: msg.role === 'user' ? 'white' : 'var(--color-foreground)',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: msg.role === 'assistant' ? `1px solid var(--color-border)` : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="2" y="3" width="14" height="11" rx="3" fill="white" opacity="0.9" />
                  </svg>
                </div>
                <div
                  className="px-4 py-3 rounded-2xl text-sm"
                  style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-muted-foreground)' }}
                  aria-label="Assistant is typing"
                >
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-muted-foreground)', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-muted-foreground)', animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-muted-foreground)', animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-t shrink-0"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          >
            {/* Mic */}
            <button
              className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Use voice input"
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask a question..."
              className="flex-1 h-10 px-4 rounded-full border text-sm transition-colors focus:outline-none focus:ring-2"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-background-subtle)',
                color: 'var(--color-foreground)',
              }}
              aria-label="Type your question"
            />

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <ViewerTabBar manualId={manualId} activeMode="chat" />
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
      <ChatModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
