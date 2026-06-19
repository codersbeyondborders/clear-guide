'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor } from '@/context/ManualEditorContext'
import { AIProcessingOverlay } from '@/components/AIProcessingOverlay'
import { FileText, Globe, Upload, LayoutList } from 'lucide-react'

export function Step4({ isEdit = false }: { isEdit?: boolean }) {
  const { formData, manualId, setStep } = useEditor()
  const router = useRouter()
  const [status, setStatus] = useState<'draft' | 'published'>(formData.status)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    setProcessing(true)
    try {
      const payload = {
        productName: formData.productName,
        productModel: formData.productModel,
        brand: formData.brand,
        serialNumber: formData.serialNumber || null,
        languages: formData.languages,
        status,
        uploadMethod: formData.uploadMethod,
        originalFileUrl: formData.uploadedFilePathname ?? null,
        sections: formData.sections,
      }

      const url = isEdit && manualId ? `/api/manuals/${manualId}` : '/api/manuals'
      const method = isEdit && manualId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save manual')
      }
      // AIProcessingOverlay will call onComplete after animation finishes
    } catch (err: unknown) {
      setProcessing(false)
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    }
  }

  const onOverlayComplete = useCallback(() => {
    // Clear draft from localStorage
    try { localStorage.removeItem('clearguide_editor_draft') } catch { /* ignore */ }
    router.push('/manufacturer/dashboard')
  }, [router])

  const additionalLangs = formData.languages.filter((l) => l !== 'en')

  return (
    <>
      <section aria-labelledby="step4-title">
        <div className="space-y-1 mb-8">
          <h2 id="step4-title" className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            Review & {isEdit ? 'Update' : 'Publish'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Review your manual details before saving.
          </p>
        </div>

        {/* Summary card */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Product Name', value: formData.productName },
              { label: 'Model',        value: formData.productModel },
              { label: 'Brand',        value: formData.brand },
              { label: 'Serial #',     value: formData.serialNumber || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {label}
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="pt-4 border-t flex flex-wrap gap-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                {formData.languages.length} {formData.languages.length === 1 ? 'language' : 'languages'}
                {additionalLangs.length > 0 && (
                  <span style={{ color: 'var(--color-muted-foreground)' }}>
                    {' '}(+{additionalLangs.length} AI translated)
                  </span>
                )}
              </span>
            </div>
            {formData.uploadMethod === 'upload' && formData.uploadedFileName && (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                <span className="text-sm truncate max-w-[200px]" style={{ color: 'var(--color-foreground)' }}>
                  {formData.uploadedFileName}
                </span>
              </div>
            )}
            {formData.uploadMethod === 'sections' && (
              <div className="flex items-center gap-2">
                <LayoutList className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                  {formData.sections.length} {formData.sections.length === 1 ? 'section' : 'sections'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status selector */}
        <div className="mt-6 space-y-2">
          <label htmlFor="status-select" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Status
          </label>
          <select
            id="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="auth-input max-w-xs"
          >
            <option value="draft">Draft — not publicly visible</option>
            <option value="published">Published — live for end users</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-4 px-4 py-3 rounded-lg border text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              color: 'var(--color-destructive)',
              borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <button type="button" onClick={() => setStep(3)} className="btn-outline">
            Back
          </button>
          <div className="flex items-center gap-3">
            <a
              href="/manufacturer/dashboard"
              className="btn-ghost text-sm"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Cancel
            </a>
            <button
              type="button"
              onClick={handleSave}
              disabled={processing}
              className="btn-primary"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              {processing ? 'Saving…' : isEdit ? 'Update Manual' : 'Save Manual'}
            </button>
          </div>
        </div>
      </section>

      <AIProcessingOverlay visible={processing} onComplete={onOverlayComplete} />
    </>
  )
}
