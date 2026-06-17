'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const AI_STEPS = [
  'Uploading content to secure storage',
  'Parsing document structure',
  'Extracting sections and headings',
  'Building AI knowledge base',
  'Generating translations',
  'Finalising and publishing',
]

interface AIProcessingOverlayProps {
  visible: boolean
  onComplete: () => void
}

export function AIProcessingOverlay({ visible, onComplete }: AIProcessingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0)
      setProgress(0)
      setDone(false)
      return
    }

    const stepDuration = 700 // ms per step
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1
        setProgress(Math.round((next / AI_STEPS.length) * 100))
        if (next >= AI_STEPS.length) {
          clearInterval(interval)
          setDone(true)
          setTimeout(onComplete, 1200)
        }
        return next
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [visible, onComplete])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Processing your manual"
      aria-live="polite"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-2xl border p-8 space-y-6 shadow-2xl"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Logo / icon */}
        <div className="text-center space-y-2">
          {done ? (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Check className="w-7 h-7 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: 'var(--color-primary-subtle)' }}
            >
              <Loader2
                className="w-7 h-7 animate-spin"
                style={{ color: 'var(--color-primary)' }}
                aria-hidden="true"
              />
            </div>
          )}
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
            {done ? 'Manual Ready!' : 'Processing your manual…'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {done
              ? 'Your manual has been saved and is ready to share.'
              : 'This usually takes a few seconds.'}
          </p>
        </div>

        {/* Progress bar */}
        <div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-background-subtle)' }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}% complete`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
          <p className="text-xs text-right mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {progress}%
          </p>
        </div>

        {/* Step list */}
        <ol className="space-y-2" aria-label="Processing steps">
          {AI_STEPS.map((step, i) => {
            const isCompleted = i < currentStep
            const isActive = i === currentStep && !done
            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    backgroundColor: isCompleted
                      ? 'var(--color-primary)'
                      : isActive
                      ? 'var(--color-primary-subtle)'
                      : 'var(--color-background-subtle)',
                    color: isCompleted
                      ? 'var(--color-primary-foreground)'
                      : isActive
                      ? 'var(--color-primary)'
                      : 'var(--color-muted-foreground)',
                  }}
                  aria-hidden="true"
                >
                  {isCompleted ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: isCompleted || isActive
                      ? 'var(--color-foreground)'
                      : 'var(--color-muted-foreground)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {step}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
