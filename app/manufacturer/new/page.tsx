'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Trash2, Plus, Upload, Video, Image as ImageIcon, Check, ChevronDown } from 'lucide-react'
import { ManualEditorProvider, useEditor } from '@/context/ManualEditorContext'
import { SUPPORTED_LANGUAGES } from '@/components/LanguagePicker'
import { AIProcessingOverlay } from '@/components/AIProcessingOverlay'
import { ManualDoneCard } from '@/components/ManualDoneCard'

// ---------------------------------------------------------------------------
// ClearGuide logo
// ---------------------------------------------------------------------------
function ClearGuideLogo() {
  return (
    <div className="flex items-center gap-2">
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
        <span className="block text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-sm font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section card in the Manual Sections area
// ---------------------------------------------------------------------------
interface SectionData {
  id: string
  title: string
  content: string
}

function generateId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function SectionCard({
  section,
  index,
  onUpdate,
  onDelete,
}: {
  section: SectionData
  index: number
  onUpdate: (s: SectionData) => void
  onDelete: () => void
}) {
  const MAX = 5000
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
        >
          Section {index + 1}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ color: 'var(--color-muted-foreground)' }}
          aria-label={`Delete section ${index + 1}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Section Title */}
        <div className="space-y-1.5">
          <label
            htmlFor={`section-title-${section.id}`}
            className="block text-sm font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Section Title
          </label>
          <input
            id={`section-title-${section.id}`}
            type="text"
            value={section.title}
            onChange={e => onUpdate({ ...section, title: e.target.value })}
            placeholder="e.g. Getting Started"
            className="w-full h-10 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <label
            htmlFor={`section-content-${section.id}`}
            className="block text-sm font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Text Content
          </label>
          <div className="relative">
            <textarea
              id={`section-content-${section.id}`}
              value={section.content}
              onChange={e => {
                if (e.target.value.length <= MAX) onUpdate({ ...section, content: e.target.value })
              }}
              rows={5}
              placeholder="Enter step-by-step instructions..."
              className="w-full px-3 py-2.5 rounded-lg border text-sm resize-y transition-colors focus:outline-none focus:ring-2"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-foreground)',
                minHeight: '120px',
              }}
            />
            <span
              className="absolute bottom-2 right-3 text-xs pointer-events-none"
              aria-live="polite"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {section.content.length}/{MAX}
            </span>
          </div>
        </div>

        {/* Images + Videos */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Images */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Images</span>
            </div>
            <label
              className="flex flex-col items-center justify-center gap-2 py-7 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-primary"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}
            >
              <Upload className="w-5 h-5" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <span className="text-xs font-medium text-center" style={{ color: 'var(--color-foreground)' }}>
                Upload images
              </span>
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                PNG, JPG, WebP
              </span>
              <input type="file" accept="image/*" multiple className="sr-only" aria-label="Upload images" />
            </label>
          </div>

          {/* Videos */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Video className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Videos</span>
            </div>
            <label
              className="flex flex-col items-center justify-center gap-2 py-7 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-primary"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}
            >
              <Upload className="w-5 h-5" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <span className="text-xs font-medium text-center" style={{ color: 'var(--color-foreground)' }}>
                Upload videos
              </span>
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                MP4, MOV, WebM
              </span>
              <input type="file" accept="video/*" multiple className="sr-only" aria-label="Upload videos" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main editor (needs ManualEditorContext)
// ---------------------------------------------------------------------------
function ManualEditor() {
  const router = useRouter()
  const { formData, updateFormData } = useEditor()
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [statusOpen, setStatusOpen] = useState(false)
  const [sections, setSections] = useState<SectionData[]>([
    { id: generateId(), title: '', content: '' },
  ])
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [savedManualId, setSavedManualId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Language toggle
  const toggleLang = (code: string) => {
    if (code === 'en') return
    const current = formData.languages ?? ['en']
    if (current.includes(code)) {
      updateFormData({ languages: current.filter(l => l !== code) })
    } else {
      updateFormData({ languages: [...current, code] })
    }
  }
  const selectedLangs = formData.languages ?? ['en']

  // Section mutations
  const addSection = () => setSections(s => [...s, { id: generateId(), title: '', content: '' }])
  const updateSection = (idx: number, s: SectionData) => setSections(prev => { const n = [...prev]; n[idx] = s; return n })
  const deleteSection = (idx: number) => setSections(s => s.filter((_, i) => i !== idx))

  // Save
  const handleSave = async () => {
    if (!formData.productName?.trim()) {
      setError('Product Name is required.')
      return
    }
    setError('')
    setProcessing(true)
    try {
      const payload = {
        productName: formData.productName,
        productModel: formData.productModel || null,
        brand: formData.brand || null,
        serialNumber: formData.serialNumber || null,
        languages: selectedLangs,
        status,
        uploadMethod: 'sections',
        sections: sections.map((s, i) => ({
          id: s.id,
          title: s.title || `Section ${i + 1}`,
          content: s.content,
          imageUrls: [],
          videoUrls: [],
        })),
      }
      const res = await fetch('/api/manuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Failed to save manual')
      }
      const saved = await res.json() as { id?: string }
      setSavedManualId(saved.id ?? null)
      // Processing overlay will call onComplete
    } catch (err) {
      setProcessing(false)
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    }
  }

  const onOverlayComplete = useCallback(() => {
    setProcessing(false)
    setDone(true)
  }, [])

  // Show done card
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <ManualDoneCard manualId={savedManualId} onGoToDashboard={() => router.push('/manufacturer/dashboard')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: back + logo + breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/manufacturer/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Back to dashboard"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <ClearGuideLogo />
            <span style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true">/</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Create Manual</span>
          </div>

          {/* Right: status dropdown + save button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen(o => !o)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
              >
                {status === 'draft' ? 'Draft' : 'Published'}
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              {statusOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-40 rounded-xl border shadow-lg z-20 overflow-hidden"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  role="listbox"
                >
                  {(['draft', 'published'] as const).map(s => (
                    <button
                      key={s}
                      role="option"
                      aria-selected={status === s}
                      onClick={() => { setStatus(s); setStatusOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none"
                      style={{ color: status === s ? 'var(--color-primary)' : 'var(--color-foreground)' }}
                    >
                      {s === 'draft' ? 'Draft' : 'Published'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={processing}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M12 2H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7l3-3V3a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <rect x="4.5" y="2" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
                <rect x="4.5" y="8" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Save Manual
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6" id="main-content">

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="px-4 py-3 rounded-xl border text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              color: 'var(--color-destructive)',
              borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
            }}
          >
            {error}
          </div>
        )}

        {/* ── Basic Information ──────────────────────────────────────── */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-base font-bold mb-5" style={{ color: 'var(--color-foreground)' }}>
            Basic Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { id: 'productName',  label: 'Product Name',    placeholder: 'e.g. Smart Coffee Maker X1', required: true  },
              { id: 'productModel', label: 'Product Model',   placeholder: 'e.g. SCM-X1-2024',           required: false },
              { id: 'brand',        label: 'Make (Brand)',    placeholder: 'e.g. BrewTech',               required: false },
              { id: 'serialNumber', label: 'Serial Number',   placeholder: 'e.g. BT-123456',             required: false },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <label
                  htmlFor={f.id}
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {f.label}
                  {f.required && <span className="ml-1" style={{ color: 'var(--color-destructive)' }} aria-hidden="true">*</span>}
                </label>
                <input
                  id={f.id}
                  type="text"
                  value={(formData as Record<string, string>)[f.id] ?? ''}
                  onChange={e => updateFormData({ [f.id]: e.target.value })}
                  placeholder={f.placeholder}
                  aria-required={f.required}
                  className="w-full h-10 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-card)',
                    color: 'var(--color-foreground)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Language Translations ──────────────────────────────────── */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                Language Translations
              </h2>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
            >
              {selectedLangs.length} {selectedLangs.length === 1 ? 'language' : 'languages'}
            </span>
          </div>
          <p className="text-xs mb-5" style={{ color: 'var(--color-muted-foreground)' }}>
            Select languages to auto-translate this manual. English is always included.
          </p>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
            role="group"
            aria-label="Select languages"
          >
            {SUPPORTED_LANGUAGES.map(lang => {
              const isSelected = selectedLangs.includes(lang.code)
              const isEnglish = lang.code === 'en'
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  disabled={isEnglish}
                  onClick={() => toggleLang(lang.code)}
                  className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                    cursor: isEnglish ? 'default' : 'pointer',
                  }}
                >
                  <span className="text-base" aria-hidden="true">
                    {lang.region === 'US' ? '🇺🇸' : lang.region === 'ES' ? '🇪🇸' : lang.region === 'FR' ? '🇫🇷' : lang.region === 'DE' ? '🇩🇪' : lang.region === 'IT' ? '🇮🇹' : lang.region === 'PT' ? '🇵🇹' : lang.region === 'CN' ? '🇨🇳' : lang.region === 'JP' ? '🇯🇵' : lang.region === 'SA' ? '🇸🇦' : lang.region === 'IN' ? '🇮🇳' : lang.region === 'KR' ? '🇰🇷' : lang.region === 'NL' ? '🇳🇱' : lang.region === 'PL' ? '🇵🇱' : lang.region === 'RU' ? '🇷🇺' : lang.region === 'TR' ? '🇹🇷' : lang.region === 'SE' ? '🇸🇪' : '🌐'}
                  </span>
                  <span className="text-sm font-medium truncate flex-1" style={{ color: 'var(--color-foreground)' }}>
                    {lang.name}
                  </span>
                  {isSelected && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      aria-hidden="true"
                    >
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Manual Sections ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                Manual Sections
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                Build your manual section by section.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                style={{ color: 'var(--color-primary)' }}
                onClick={() => {/* future: change method */}}
              >
                Change method
              </button>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Add Section
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section, idx) => (
              <SectionCard
                key={section.id}
                section={section}
                index={idx}
                onUpdate={s => updateSection(idx, s)}
                onDelete={() => deleteSection(idx)}
              />
            ))}
          </div>
        </div>

        {/* Bottom save row */}
        <div className="flex justify-end pb-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={processing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            Save Manual
          </button>
        </div>
      </main>

      {/* Processing overlay */}
      <AIProcessingOverlay visible={processing} onComplete={onOverlayComplete} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewManualPage() {
  return (
    <ManualEditorProvider>
      <ManualEditor />
    </ManualEditorProvider>
  )
}
