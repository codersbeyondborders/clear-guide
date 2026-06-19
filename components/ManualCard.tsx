'use client'

import { useRouter } from 'next/navigation'
import { FileText, Settings, BarChart2, Trash2, Globe, Clock } from 'lucide-react'
import type { ManualListItem } from '@/lib/types'

interface ManualCardProps {
  manual: ManualListItem
  onDelete: (id: string) => void
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  published: {
    bg: 'var(--color-primary-subtle)',
    text: 'var(--color-primary)',
    border: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
    dot: 'var(--color-primary)',
    label: 'Published',
  },
  draft: {
    bg: 'var(--color-background-subtle)',
    text: 'var(--color-muted-foreground)',
    border: 'var(--color-border)',
    dot: 'var(--color-muted-foreground)',
    label: 'Draft',
  },
  processing: {
    bg: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
    text: 'var(--color-warning)',
    border: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
    dot: 'var(--color-warning)',
    label: 'Processing',
  },
  archived: {
    bg: 'var(--color-background-subtle)',
    text: 'var(--color-muted-foreground)',
    border: 'var(--color-border)',
    dot: 'var(--color-muted-foreground)',
    label: 'Archived',
  },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function ManualCard({ manual, onDelete }: ManualCardProps) {
  const router = useRouter()
  const cfg = STATUS_CONFIG[manual.status.toLowerCase()] ?? STATUS_CONFIG.draft

  return (
    <article
      className="group rounded-2xl border flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Top row: icon + status */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"
            style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: cfg.dot }}
              aria-hidden="true"
            />
            {cfg.label}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3
            className="text-sm font-bold leading-snug line-clamp-2"
            style={{ color: 'var(--color-foreground)' }}
          >
            {manual.productName}
          </h3>
          {(manual.productModel || manual.brand) && (
            <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
              {[manual.brand, manual.productModel].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-1" title={`Updated ${timeAgo(manual.updatedAt)}`}>
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {timeAgo(manual.updatedAt)}
            </span>
          </div>
          {(manual.languages?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                {manual.languages.length} {manual.languages.length === 1 ? 'lang' : 'langs'}
              </span>
            </div>
          )}
          {manual.sectionCount != null && (
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {manual.sectionCount} {manual.sectionCount === 1 ? 'section' : 'sections'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 px-5 py-3.5 border-t"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}
      >
        <button
          onClick={() => router.push(`/manufacturer/edit/${manual.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary"
          style={{
            borderColor: 'var(--color-border-strong)',
            color: 'var(--color-foreground)',
            backgroundColor: 'var(--color-card)',
          }}
          aria-label={`Edit ${manual.productName}`}
        >
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          Edit
        </button>
        <button
          onClick={() => router.push(`/manufacturer/analytics/${manual.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            borderColor: 'var(--color-border-strong)',
            color: 'var(--color-foreground)',
            backgroundColor: 'var(--color-card)',
          }}
          aria-label={`View analytics for ${manual.productName}`}
        >
          <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
          Analytics
        </button>
        <button
          onClick={() => onDelete(manual.id)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
          aria-label={`Delete ${manual.productName}`}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
