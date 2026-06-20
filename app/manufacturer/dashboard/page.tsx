'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, AlertTriangle } from 'lucide-react'
import { ManualCard } from '@/components/ManualCard'
import { useManuals } from '@/hooks/useManuals'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

// ---------------------------------------------------------------------------
// ClearGuide logo SVG (inline, matches brand)
// ---------------------------------------------------------------------------
function ClearGuideLogo() {
  return (
    <a href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="ClearGuide home">
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
    </a>
  )
}

// ---------------------------------------------------------------------------
// Delete confirmation modal
// ---------------------------------------------------------------------------
function DeleteModal({ manualName, onConfirm, onCancel }: {
  manualName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border p-6 space-y-5 shadow-xl"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)' }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-destructive)' }} aria-hidden="true" />
        </div>
        <div className="text-center space-y-1.5">
          <h2 id="delete-modal-title" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
            Delete manual?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            <strong style={{ color: 'var(--color-foreground)' }}>{manualName}</strong> will be
            permanently removed and cannot be recovered.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card skeleton
// ---------------------------------------------------------------------------
function ManualCardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5 space-y-4 animate-pulse"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="w-16 h-4 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="flex-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="w-9 h-8 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export default function ManufacturerDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { manuals, isLoading, isError, deleteManual } = useManuals()
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

  // Brand display name: try full_name → email → 'Manufacturer'
  const displayName: string = (user?.user_metadata?.company_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Manufacturer') as string
  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'MF'

  const handleDeleteRequest = (id: string) => {
    const m = manuals.find(m => m.id === id)
    if (m) setPendingDelete({ id, name: m.productName })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await deleteManual(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          className="border-b"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Left: back + logo */}
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
                aria-label="Back to homepage"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <ClearGuideLogo />
            </div>

            {/* Right: brand name + initials avatar */}
            {!authLoading && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--color-foreground)' }}>
                  {displayName}
                </span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────────────────── */}
        <main className="max-w-6xl mx-auto px-6 py-10" id="main-content">

          {/* Page title row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-foreground)' }}>
                Your Manuals
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                Manage and update your digital product guides.
              </p>
            </div>
            <button
              onClick={() => router.push('/manufacturer/new')}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              aria-label="Create a new manual"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Create New Manual
            </button>
          </div>

          {/* Error state */}
          {isError && (
            <div
              role="alert"
              className="px-4 py-3 rounded-xl border text-sm flex items-center gap-2 mb-6"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                color: 'var(--color-destructive)',
                borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
              }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              Failed to load manuals. Please refresh the page.
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Loading manuals">
              {Array.from({ length: 3 }).map((_, i) => (
                <ManualCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && manuals.length === 0 && (
            <div
              className="text-center py-24 rounded-2xl border"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: 'var(--color-primary-subtle)' }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect x="4" y="3" width="12" height="16" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" />
                  <path d="M8 8h8M8 11h6M8 14h4" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="20" cy="20" r="6" fill="var(--color-primary)" />
                  <path d="M20 17v6M17 20h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                No manuals yet
              </h2>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--color-muted-foreground)' }}>
                Create your first accessible digital product manual and start engaging your customers.
              </p>
              <button
                onClick={() => router.push('/manufacturer/new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Create Your First Manual
              </button>
            </div>
          )}

          {/* Manual grid */}
          {!isLoading && !isError && manuals.length > 0 && (
            <section aria-label="Manual list">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {manuals.map((manual) => (
                  <ManualCard key={manual.id} manual={manual} onDelete={handleDeleteRequest} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {pendingDelete && (
        <DeleteModal
          manualName={pendingDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
