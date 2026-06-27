'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import {
  User, Lock, Bell, Trash2, Check, AlertTriangle, Eye, EyeOff, Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl border p-6 space-y-5"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="space-y-0.5">
        <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
          {title}
        </h2>
        {description && (
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {description}
          </p>
        )}
      </div>
      <div
        className="border-t"
        style={{ borderColor: 'var(--color-border)' }}
        aria-hidden="true"
      />
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Inline alert
// ---------------------------------------------------------------------------
function Alert({
  type,
  message,
}: {
  type: 'success' | 'error'
  message: string
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm"
      style={{
        backgroundColor:
          type === 'success'
            ? 'var(--color-primary-subtle)'
            : 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
        color:
          type === 'success' ? 'var(--color-primary)' : 'var(--color-destructive)',
        borderColor:
          type === 'success'
            ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)'
            : 'color-mix(in srgb, var(--color-destructive) 25%, transparent)',
      }}
    >
      {type === 'success' ? (
        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile section
// ---------------------------------------------------------------------------
function ProfileSection({ email }: { email: string }) {
  const [displayName, setDisplayName] = useState(
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  )
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSave = async () => {
    if (!displayName.trim()) return
    setSaving(true)
    setFeedback(null)
    // Supabase user metadata update
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } })
    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      setFeedback({ type: 'success', message: 'Profile updated successfully.' })
    }
  }

  return (
    <SettingsSection
      title="Profile"
      description="Update your display name and account info."
    >
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          aria-hidden="true"
        >
          {getInitials(displayName || email)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
            {displayName || email}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {email}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="display-name"
            className="block text-sm font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Display Name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="auth-input"
            aria-describedby="display-name-hint"
          />
          <p id="display-name-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Shown in your dashboard and sidebar.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email-readonly"
            className="block text-sm font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Email Address
          </label>
          <input
            id="email-readonly"
            type="email"
            value={email}
            readOnly
            disabled
            className="auth-input"
            aria-describedby="email-readonly-hint"
          />
          <p id="email-readonly-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Contact support to change your email.
          </p>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="btn-primary"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Password section
// ---------------------------------------------------------------------------
function PasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const mismatch = confirm.length > 0 && next !== confirm
  const weak = next.length > 0 && next.length < 8
  const canSubmit = current.trim() && next.trim() && confirm.trim() && !mismatch && !weak

  const handleSave = async () => {
    if (!canSubmit) return
    setSaving(true)
    setFeedback(null)
    const supabase = createClient()
    // Re-auth then update
    const { error } = await supabase.auth.updateUser({ password: next })
    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      setFeedback({ type: 'success', message: 'Password updated successfully.' })
      setCurrent('')
      setNext('')
      setConfirm('')
    }
  }

  return (
    <SettingsSection
      title="Password"
      description="Change your account password. Use at least 8 characters."
    >
      <div className="space-y-4 max-w-sm">
        {/* Current password */}
        <div className="space-y-1.5">
          <label
            htmlFor="current-pw"
            className="block text-sm font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Current Password
          </label>
          <div className="relative">
            <input
              id="current-pw"
              type={showCurrent ? 'text' : 'password'}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="auth-input pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="space-y-1.5">
          <label
            htmlFor="new-pw"
            className="block text-sm font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="new-pw"
              type={showNext ? 'text' : 'password'}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="auth-input pr-10"
              autoComplete="new-password"
              aria-describedby={weak ? 'pw-weak' : undefined}
              aria-invalid={weak}
              style={weak ? { borderColor: 'var(--color-destructive)' } : {}}
            />
            <button
              type="button"
              onClick={() => setShowNext((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={showNext ? 'Hide new password' : 'Show new password'}
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {showNext ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {weak && (
            <p id="pw-weak" className="text-xs" style={{ color: 'var(--color-destructive)' }}>
              Must be at least 8 characters.
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirm-pw"
            className="block text-sm font-medium"
            style={{ color: 'var(--color-foreground)' }}
          >
            Confirm New Password
          </label>
          <input
            id="confirm-pw"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="auth-input"
            autoComplete="new-password"
            aria-describedby={mismatch ? 'pw-mismatch' : undefined}
            aria-invalid={mismatch}
            style={mismatch ? { borderColor: 'var(--color-destructive)' } : {}}
          />
          {mismatch && (
            <p id="pw-mismatch" className="text-xs" style={{ color: 'var(--color-destructive)' }}>
              Passwords do not match.
            </p>
          )}
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !canSubmit}
          className="btn-primary"
        >
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Notifications section — persisted to Supabase user metadata
// ---------------------------------------------------------------------------
type NotifKey = 'manualPublished' | 'manualFailed' | 'weeklyDigest'

const NOTIF_OPTIONS: { key: NotifKey; label: string; description: string }[] = [
  {
    key: 'manualPublished',
    label: 'Manual published',
    description: 'Receive an email when a manual finishes processing and goes live.',
  },
  {
    key: 'manualFailed',
    label: 'Processing failure',
    description: 'Alert when a manual fails AI processing and needs your attention.',
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'A weekly summary of views and engagement across all your manuals.',
  },
]

const DEFAULT_NOTIF_PREFS: Record<NotifKey, boolean> = {
  manualPublished: true,
  manualFailed: true,
  weeklyDigest: false,
}

function NotificationsSection({ user }: { user: SupabaseUser | null }) {
  const savedPrefs = (user?.user_metadata?.notification_prefs ?? DEFAULT_NOTIF_PREFS) as Record<NotifKey, boolean>

  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>(savedPrefs)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const toggle = (key: NotifKey) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
    setFeedback(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { notification_prefs: prefs } })
    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      setFeedback({ type: 'success', message: 'Notification preferences saved.' })
    }
  }

  return (
    <SettingsSection
      title="Notifications"
      description="Choose which email notifications you want to receive."
    >
      <div className="space-y-4">
        {NOTIF_OPTIONS.map(({ key, label, description }) => (
          <div key={key} className="flex items-start gap-4">
            <div className="pt-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                aria-label={label}
                onClick={() => toggle(key)}
                className="relative inline-flex w-10 h-5 rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: prefs[key] ? 'var(--color-primary)' : 'var(--color-border-strong)',
                  borderColor: prefs[key] ? 'var(--color-primary)' : 'var(--color-border-strong)',
                }}
              >
                <span
                  className="absolute top-0 left-0 w-4 h-4 rounded-full shadow transition-transform duration-200"
                  style={{
                    backgroundColor: 'white',
                    transform: prefs[key] ? 'translateX(1.25rem)' : 'translateX(0)',
                  }}
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Danger zone
// ---------------------------------------------------------------------------
function DangerSection({ onLogout }: { onLogout: () => void }) {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const CONFIRM_PHRASE = 'DELETE'

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Server error ${res.status}`)
      }
      // Account deleted — sign out and redirect
      await onLogout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <SettingsSection title="Danger Zone">
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-destructive) 25%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-destructive) 4%, transparent)',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 mt-0.5 shrink-0"
            style={{ color: 'var(--color-destructive)' }}
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-destructive)' }}>
              Delete Account
            </p>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Permanently delete your account and all associated manuals. This action
              cannot be undone. Type <strong>{CONFIRM_PHRASE}</strong> to confirm.
            </p>
          </div>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <label htmlFor="confirm-delete" className="sr-only">
            Type DELETE to confirm account deletion
          </label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); setError(null) }}
            placeholder={`Type "${CONFIRM_PHRASE}" to confirm`}
            className="auth-input"
            aria-describedby="confirm-delete-hint"
            disabled={deleting}
          />
          <p id="confirm-delete-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            This permanently deletes all your data.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <button
          type="button"
          disabled={confirmText !== CONFIRM_PHRASE || deleting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-destructive)',
            color: 'var(--color-destructive-foreground)',
          }}
          onClick={handleDelete}
        >
          {deleting
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : <Trash2 className="w-4 h-4" aria-hidden="true" />
          }
          {deleting ? 'Deleting…' : 'Delete My Account'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------
type Tab = 'profile' | 'password' | 'notifications' | 'danger'
const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'password',      label: 'Password',       icon: Lock },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'danger',        label: 'Danger Zone',    icon: Trash2 },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const { user, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const email = user?.email ?? ''
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const initials = getInitials(displayName || email)

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
      >
        <div
          className="text-sm animate-pulse"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Loading…
        </div>
      </div>
    )
  }

  return (
    <DashboardShell displayName={displayName} initials={initials} onLogout={logout}>
      {/* Page header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <nav
          className="lg:w-52 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0"
          aria-label="Settings sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            const isDanger = id === 'danger'
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: isActive
                    ? isDanger
                      ? 'color-mix(in srgb, var(--color-destructive) 8%, transparent)'
                      : 'var(--color-primary-subtle)'
                    : 'transparent',
                  color: isActive
                    ? isDanger
                      ? 'var(--color-destructive)'
                      : 'var(--color-primary)'
                    : isDanger
                    ? 'var(--color-destructive)'
                    : 'var(--color-muted-foreground)',
                }}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'profile'       && <ProfileSection email={email} />}
          {activeTab === 'password'      && <PasswordSection />}
          {activeTab === 'notifications' && <NotificationsSection user={user ?? null} />}
          {activeTab === 'danger'        && <DangerSection onLogout={logout} />}
        </div>
      </div>
    </DashboardShell>
  )
}
