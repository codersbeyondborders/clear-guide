'use client'

import { useRouter } from 'next/navigation'
import { FileText, Settings, BarChart2, Trash2, Globe } from 'lucide-react'
import type { ManualListItem } from '@/lib/types'

interface ManualCardProps {
  manual: ManualListItem
  onDelete: (id: string) => void
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  published: {
    bg: 'var(--color-primary-subtle)',
    text: 'var(--color-primary)',
    border: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
    label: 'Published',
  },
  draft: {
    bg: 'var(--color-background-subtle)',
    text: 'var(--color-muted-foreground)',
    border: 'var(--color-border)',
    label: 'Draft',
  },
  processing: {
    bg: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
    text: 'var(--color-warning)',
    border: 'color-mix(in srgb, var(--color-warning) 25%, transparent)',
    label: 'Processing',
  },
  archived: {
    bg: 'var(--color-background-subtle)',
    text: 'var(--color-muted-foreground)',
    border: 'var(--color-border)',
    label: 'Archived',
  },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

export function ManualCard({ manual, onDelete }: ManualCardProps) {
  const router = useRouter()
  const statusKey = manual.status.toLowerCase()
  const style = STATUS_STYLES[statusKey] ?? STATUS_STYLES.draft

  return (
    <article
      className="rounded-2xl border flex flex-col transition-shadow hover:shadow-md"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"
            style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
          >
            {style.label}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-bold truncate"
            style={{ color: 'var(--color-foreground)' }}
          >
            {manual.productName}
          </h3>
          {manual.productModel && (
            <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--color-muted-foreground)' }}>
              {manual.productModel}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              Updated {timeAgo(manual.updatedAt)}
            </span>
            {manual.languages?.length > 0 && (
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                <Globe className="w-3 h-3" aria-hidden="true" />
                {manual.languages.length} {manual.languages.length === 1 ? 'language' : 'languages'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 px-6 py-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => router.push(`/manufacturer/edit/${manual.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-foreground)' }}
          aria-label={`Edit ${manual.productName}`}
        >
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          Edit
        </button>
        <button
          onClick={() => router.push(`/manufacturer/analytics/${manual.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-foreground)' }}
          aria-label={`View analytics for ${manual.productName}`}
        >
          <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
          Analytics
        </button>
        <button
          onClick={() => onDelete(manual.id)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
          aria-label={`Delete ${manual.productName}`}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
