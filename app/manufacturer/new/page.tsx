'use client'

import { ArrowLeft, Check } from 'lucide-react'
import { ManualEditorProvider, useEditor } from '@/context/ManualEditorContext'
import { Step1 } from './_components/Step1'
import { Step2 } from './_components/Step2'
import { Step3 } from './_components/Step3'
import { Step4 } from './_components/Step4'

const STEPS = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'Languages' },
  { number: 3, label: 'Content' },
  { number: 4, label: 'Publish' },
] as const

// ---------------------------------------------------------------------------
// Step progress indicator
// ---------------------------------------------------------------------------
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
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-1 py-0.5 transition-colors"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                style={{
                  backgroundColor: isCompleted
                    ? 'var(--color-primary)'
                    : isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-background-subtle)',
                  color: isCompleted || isActive
                    ? 'var(--color-primary-foreground)'
                    : 'var(--color-muted-foreground)',
                }}
                aria-hidden="true"
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s.number}
              </span>
              <span
                className="text-sm font-medium hidden sm:block"
                style={{
                  color: isActive
                    ? 'var(--color-foreground)'
                    : isCompleted
                    ? 'var(--color-primary)'
                    : 'var(--color-muted-foreground)',
                }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="w-6 h-px"
                style={{
                  backgroundColor: step > s.number
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                }}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Inner layout (needs editor context)
// ---------------------------------------------------------------------------
function EditorLayout() {
  const { step } = useEditor()

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="container flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/manufacturer/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </a>
            <h1 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
              Create New Manual
            </h1>
          </div>
          <StepIndicator />
        </div>
      </header>

      {/* Content */}
      <main className="container py-10">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl border p-8"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
          </div>
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewManualPage() {
  return (
    <ManualEditorProvider>
      <EditorLayout />
    </ManualEditorProvider>
  )
}
