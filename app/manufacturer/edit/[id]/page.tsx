'use client'

import { use, useEffect, useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { ManualEditorProvider, useEditor, type EditorFormData } from '@/context/ManualEditorContext'
import { Step1 } from '@/app/manufacturer/new/_components/Step1'
import { Step2 } from '@/app/manufacturer/new/_components/Step2'
import { Step3 } from '@/app/manufacturer/new/_components/Step3'
import { Step4 } from '@/app/manufacturer/new/_components/Step4'

const STEPS = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'Languages' },
  { number: 3, label: 'Content' },
  { number: 4, label: 'Publish' },
] as const

function StepIndicator() {
  const { step, setStep } = useEditor()
  return (
    <nav aria-label="Editor steps" className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const isCompleted = step > s.number
        const isActive = step === s.number
        return (
          <div key={s.number} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => isCompleted && setStep(s.number as 1 | 2 | 3 | 4)}
              disabled={!isCompleted}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${s.number}: ${s.label}${isCompleted ? ' (completed)' : ''}`}
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-1 py-0.5"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor: isCompleted || isActive ? 'var(--color-primary)' : 'var(--color-background-subtle)',
                  color: isCompleted || isActive ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                }}
                aria-hidden="true"
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s.number}
              </span>
              <span
                className="text-sm font-medium hidden sm:block"
                style={{
                  color: isActive ? 'var(--color-foreground)' : isCompleted ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-px" style={{ backgroundColor: step > s.number ? 'var(--color-primary)' : 'var(--color-border)' }} aria-hidden="true" />
            )}
          </div>
        )
      })}
    </nav>
  )
}

function EditLayout({ id }: { id: string }) {
  const { step } = useEditor()
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      <header className="sticky top-0 z-10 border-b" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="container flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/manufacturer/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </a>
            <h1 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
              Edit Manual
            </h1>
          </div>
          <StepIndicator />
        </div>
      </header>
      <main className="container py-10">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border p-8" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 isEdit />}
          </div>
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page: fetches manual data then renders editor pre-populated
// ---------------------------------------------------------------------------
export default function EditManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [initialData, setInitialData] = useState<Partial<EditorFormData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/manuals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setInitialData({
          productName: data.productName ?? '',
          productModel: data.productModel ?? '',
          brand: data.brand ?? '',
          serialNumber: data.serialNumber ?? '',
          languages: data.languages ?? ['en'],
          uploadMethod: data.sections?.length > 0 ? 'sections' : 'upload',
          sections: (data.sections ?? []).map((s: { id: string; title: string; content: string; imageUrls: string[]; videoUrls: string[] }) => ({
            id: s.id,
            title: s.title,
            content: s.content ?? '',
            imageUrls: s.imageUrls ?? [],
            videoUrls: s.videoUrls ?? [],
          })),
          status: data.status ?? 'draft',
          uploadedFileName: null,
          uploadedFileSize: null,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <div className="text-sm animate-pulse" style={{ color: 'var(--color-muted-foreground)' }}>
          Loading manual…
        </div>
      </div>
    )
  }

  if (error || !initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <div className="text-center space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-destructive)' }}>{error || 'Manual not found'}</p>
          <a href="/manufacturer/dashboard" className="btn-outline text-sm">Back to Dashboard</a>
        </div>
      </div>
    )
  }

  return (
    <ManualEditorProvider initialData={initialData} initialId={id}>
      <EditLayout id={id} />
    </ManualEditorProvider>
  )
}
