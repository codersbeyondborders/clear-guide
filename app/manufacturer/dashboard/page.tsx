'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, LogOut, LayoutDashboard, BarChart2 } from 'lucide-react'
import { ManualCard } from '@/components/ManualCard'
import { useManuals } from '@/hooks/useManuals'
import { useAuth } from '@/hooks/useAuth'

// --- Delete confirmation modal ---
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
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border p-6 shadow-xl space-y-4"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)' }}
        >
          <FileText className="w-6 h-6" style={{ color: 'var(--color-destructive)' }} aria-hidden="true" />
        </div>
        <div className="text-center space-y-1">
          <h2
            id="delete-modal-title"
            className="text-base font-bold"
            style={{ color: 'var(--color-foreground)' }}
          >
            Delete manual?
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            <strong style={{ color: 'var(--color-foreground)' }}>{manualName}</strong> will be archived
            and can be recovered by contacting support.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: 'var(--color-destructive)',
              color: 'var(--color-destructive-foreground)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Skeleton loader ---
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

export default function ManufacturerDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()
  const { manuals, isLoading, isError, deleteManual } = useManuals()
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MF'

  const handleDeleteRequest = (id: string) => {
    const m = manuals.find((m) => m.id === id)
    if (m) setPendingDelete({ id, name: m.productName })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await deleteManual(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <>
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 border-b"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="container flex items-center justify-between h-14">
            {/* Logo + nav */}
            <div className="flex items-center gap-6">
              <a
                href="/"
                className="text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                style={{ color: 'var(--color-primary)' }}
              >
                ClearGuide
              </a>
              <nav className="hidden md:flex items-center gap-1" aria-label="Dashboard navigation">
                <a
                  href="/manufacturer/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}
                  aria-current="page"
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Dashboard
                </a>
              </nav>
            </div>

            {/* User area */}
            {!authLoading && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden sm:block truncate max-w-[160px]" style={{ color: 'var(--color-muted-foreground)' }}>
                  {user?.email ?? 'Manufacturer'}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <button
                  onClick={logout}
                  className="btn-ghost flex items-center gap-1.5 text-xs"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main */}
        <main className="container py-10 space-y-8">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
                Your Manuals
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                Manage and update your digital product guides.
              </p>
            </div>
            <button
              onClick={() => router.push('/manufacturer/new')}
              className="btn-primary shrink-0"
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
              className="px-4 py-3 rounded-lg border text-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                color: 'var(--color-destructive)',
                borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
              }}
            >
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
              className="text-center py-20 rounded-2xl border"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--color-primary-subtle)' }}
              >
                <FileText className="w-7 h-7" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>
                No manuals yet
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted-foreground)' }}>
                Create your first accessible digital manual to get started.
              </p>
              <button
                onClick={() => router.push('/manufacturer/new')}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Create Manual
              </button>
            </div>
          )}

          {/* Manual grid */}
          {!isLoading && !isError && manuals.length > 0 && (
            <section aria-label="Manual list">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {manuals.map((manual) => (
                  <ManualCard
                    key={manual.id}
                    manual={manual}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
              <p className="text-xs mt-6 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
                {manuals.length} {manuals.length === 1 ? 'manual' : 'manuals'} total &mdash; auto-refreshes every 30 seconds
              </p>
            </section>
          )}
        </main>
      </div>

      {/* Delete confirmation modal */}
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
