'use client'

import { useRouter } from 'next/navigation'
import { FileText, Settings, BarChart2, Trash2 } from 'lucide-react'
import type { ManualListItem } from '@/lib/types'

interface ManualCardProps {
  manual: ManualListItem
  onDelete: (id: string) => void
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function ManualCard({ manual, onDelete }: ManualCardProps) {
  const router = useRouter()

  const isPublished = manual.status === 'published'
  const isDraft = manual.status === 'draft'

  const statusLabel = isPublished ? 'Published' : isDraft ? 'Draft' : manual.status.charAt(0).toUpperCase() + manual.status.slice(1)
  const statusColor = isPublished
    ? 'var(--color-primary)'
    : isDraft
    ? '#f59e0b'
    : 'var(--color-muted-foreground)'

  return (
    <article
      className="group rounded-2xl border flex flex-col transition-all duration-200 hover:shadow-md"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="p-5 flex flex-col flex-1 gap-4">

        {/* Top row: icon + status */}
        <div className="flex items-start justify-between">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          </div>
          <span
            className="text-xs font-semibold"
            style={{ color: statusColor }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Product name + date */}
        <div className="space-y-1 flex-1">
          <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--color-foreground)' }}>
            {manual.productName}
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Last updated: {formatDate(manual.updatedAt)}
          </p>
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-2 pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => router.push(`/manufacturer/edit/${manual.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary hover:text-primary"
            style={{
              borderColor: 'var(--color-border)',
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
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary hover:text-primary"
            style={{
              borderColor: 'var(--color-border)',
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
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            aria-label={`Delete ${manual.productName}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
