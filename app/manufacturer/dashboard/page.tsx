'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, FileText, LogOut, LayoutDashboard, BookOpen,
  Globe, TrendingUp, Clock, Trash2, AlertTriangle,
} from 'lucide-react'
import { ManualCard } from '@/components/ManualCard'
import { useManuals } from '@/hooks/useManuals'
import { useAuth } from '@/hooks/useAuth'

// ---------------------------------------------------------------------------
// Delete confirmation modal
// ---------------------------------------------------------------------------
interface DeleteModalProps {
  manualName: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteModal({ manualName, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border p-6 space-y-5 shadow-2xl"
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
          <button onClick={onCancel} className="btn-outline flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
// Skeleton
// ---------------------------------------------------------------------------
function ManualCardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-6 space-y-4 animate-pulse"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="w-20 h-6 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="h-3 w-1/3 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
      <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex-1 h-8 rounded-lg" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="flex-1 h-8 rounded-lg" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="w-9 h-8 rounded-lg" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  accent?: boolean
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div
      className="rounded-2xl border p-5 flex items-center gap-4"
      style={{
        backgroundColor: accent ? 'var(--color-primary)' : 'var(--color-card)',
        borderColor: accent ? 'transparent' : 'var(--color-border)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{
          backgroundColor: accent
            ? 'color-mix(in srgb, #fff 15%, transparent)'
            : 'var(--color-primary-subtle)',
        }}
      >
        <span style={{ color: accent ? '#fff' : 'var(--color-primary)' }}>{icon}</span>
      </div>
      <div>
        <p
          className="text-2xl font-bold leading-none"
          style={{ color: accent ? '#fff' : 'var(--color-foreground)' }}
        >
          {value}
        </p>
        <p
          className="text-xs mt-1 font-medium"
          style={{ color: accent ? 'rgba(255,255,255,0.75)' : 'var(--color-muted-foreground)' }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export default function ManufacturerDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()
  const { manuals, isLoading, isError, deleteManual } = useManuals()
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'processing'>('all')

  const displayName: string = user?.user_metadata?.full_name ?? user?.email ?? ''
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MF'

  const published = manuals.filter(m => m.status === 'published').length
  const drafts = manuals.filter(m => m.status === 'draft').length
  const totalLanguages = new Set(manuals.flatMap(m => m.languages ?? [])).size

  const filteredManuals = filter === 'all' ? manuals : manuals.filter(m => m.status === filter)

  const handleDeleteRequest = (id: string) => {
    const m = manuals.find(m => m.id === id)
    if (m) setPendingDelete({ id, name: m.productName })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await deleteManual(pendingDelete.id)
    setPendingDelete(null)
  }

  const FILTER_TABS = [
    { key: 'all' as const, label: 'All' },
    { key: 'published' as const, label: 'Published' },
    { key: 'draft' as const, label: 'Drafts' },
    { key: 'processing' as const, label: 'Processing' },
  ]

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-20 border-b backdrop-blur-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-card) 95%, transparent)', borderColor: 'var(--color-border)' }}
        >
          <div className="container flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <a
                href="/"
                className="flex items-center gap-2 text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                style={{ color: 'var(--color-primary)' }}
              >
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                ClearGuide
              </a>
              <nav className="hidden md:flex items-center gap-1" aria-label="Dashboard navigation">
                <a
                  href="/manufacturer/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}
                  aria-current="page"
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Dashboard
                </a>
              </nav>
            </div>

            {!authLoading && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-primary-foreground)',
                    }}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[160px]" style={{ color: 'var(--color-foreground)' }}>
                    {user?.email ?? 'Manufacturer'}
                  </span>
                </div>
                <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} aria-hidden="true" />
                <button
                  onClick={logout}
                  className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-2"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────────────────── */}
        <main className="container py-10 space-y-8">

          {/* Page title row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)' }}>
                Manufacturer Portal
              </p>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-foreground)' }}>
                Your Manuals
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                Manage and publish digital product guides for your customers.
              </p>
            </div>
            <button
              onClick={() => router.push('/manufacturer/new')}
              className="btn-primary shrink-0 shadow-sm"
              aria-label="Create a new manual"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              New Manual
            </button>
          </div>

          {/* Stats row */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Manuals" value={manuals.length} icon={<FileText className="w-5 h-5" />} accent />
              <StatCard label="Published" value={published} icon={<TrendingUp className="w-5 h-5" />} />
              <StatCard label="Drafts" value={drafts} icon={<Clock className="w-5 h-5" />} />
              <StatCard label="Languages Covered" value={totalLanguages || '—'} icon={<Globe className="w-5 h-5" />} />
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div
              role="alert"
              className="px-4 py-3 rounded-xl border text-sm flex items-center gap-2"
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

          {/* Filter tabs + count */}
          {!isLoading && !isError && manuals.length > 0 && (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div
                className="flex items-center gap-1 p-1 rounded-xl border"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                role="tablist"
                aria-label="Filter manuals"
              >
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={filter === tab.key}
                    onClick={() => setFilter(tab.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: filter === tab.key ? 'var(--color-primary)' : 'transparent',
                      color: filter === tab.key ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Showing {filteredManuals.length} of {manuals.length} {manuals.length === 1 ? 'manual' : 'manuals'}
              </p>
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
                <FileText className="w-8 h-8" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                No manuals yet
              </h2>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--color-muted-foreground)' }}>
                Create your first accessible digital product manual and start engaging your customers.
              </p>
              <button onClick={() => router.push('/manufacturer/new')} className="btn-primary">
                <Plus className="w-4 h-4" aria-hidden="true" />
                Create Your First Manual
              </button>
            </div>
          )}

          {/* Filtered empty */}
          {!isLoading && !isError && manuals.length > 0 && filteredManuals.length === 0 && (
            <div
              className="text-center py-16 rounded-2xl border"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
                No {filter} manuals found.
              </p>
            </div>
          )}

          {/* Manual grid */}
          {!isLoading && !isError && filteredManuals.length > 0 && (
            <section aria-label="Manual list">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredManuals.map((manual) => (
                  <ManualCard key={manual.id} manual={manual} onDelete={handleDeleteRequest} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="container pb-8 mt-4">
          <p className="text-xs text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            ClearGuide &mdash; auto-refreshes every 30 seconds
          </p>
        </footer>
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
