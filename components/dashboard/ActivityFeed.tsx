'use client'

import { Eye, Clock, QrCode, Globe, Monitor } from 'lucide-react'
import type { ActivityEvent, ViewMode } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${String(rem).padStart(2, '0')}s`
}

function modeIcon(mode: ViewMode) {
  switch (mode) {
    case 'qr': return QrCode
    case 'ar': return Globe
    case 'web': return Monitor
    default: return Eye
  }
}

function modeLabel(mode: ViewMode): string {
  const map: Record<ViewMode, string> = {
    web: 'Web',
    ar: 'AR',
    qr: 'QR',
    direct: 'Direct',
  }
  return map[mode] ?? mode
}

// ---------------------------------------------------------------------------
// Single activity row
// ---------------------------------------------------------------------------
function ActivityRow({ event }: { event: ActivityEvent }) {
  const Icon = modeIcon(event.mode)
  return (
    <li
      className="flex items-start gap-3 py-3 border-b last:border-b-0"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Mode icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
        aria-hidden="true"
      >
        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-semibold leading-snug truncate"
          style={{ color: 'var(--color-foreground)' }}
          title={event.manualName}
        >
          {event.manualName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: 'var(--color-background-subtle)', color: 'var(--color-muted-foreground)' }}
          >
            {modeLabel(event.mode)}
          </span>
          {event.timeSpentSeconds > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
              <Clock className="w-3 h-3" aria-hidden="true" />
              {formatSeconds(event.timeSpentSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <time
        dateTime={event.viewedAt}
        className="text-[10px] shrink-0 mt-0.5"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        {timeAgo(event.viewedAt)}
      </time>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------
function ActivitySkeleton() {
  return (
    <li
      className="flex items-start gap-3 py-3 border-b last:border-b-0 animate-pulse"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      <div className="flex-1 space-y-1.5 pt-1">
        <div className="h-3 w-3/4 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="h-2.5 w-1/2 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ActivityFeedProps {
  events: ActivityEvent[]
  isLoading: boolean
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------
export function ActivityFeed({ events, isLoading }: ActivityFeedProps) {
  return (
    <section
      aria-label="Recent activity"
      className="rounded-2xl border flex flex-col"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
          Recent Activity
        </h2>
        <Eye className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto px-5"
        aria-live="polite"
        aria-label="Activity events list"
      >
        {isLoading ? (
          <ul aria-busy="true" aria-label="Loading recent activity">
            {Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)}
          </ul>
        ) : events.length === 0 ? (
          <div className="py-10 text-center">
            <Eye className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-border)' }} aria-hidden="true" />
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              No activity yet. Share your manuals to start tracking views.
            </p>
          </div>
        ) : (
          <ul>
            {events.map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
