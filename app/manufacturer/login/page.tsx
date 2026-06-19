'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DEMO_EMAIL = 'demo@brewtech.com'
const DEMO_PASSWORD = 'password123'

export default function ManufacturerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message ?? 'Invalid email or password.')
      } else {
        router.push('/manufacturer/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Nav */}
      <nav
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => router.push('/')}
            className="text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-primary)' }}
          >
            ClearGuide
          </button>
          <a
            href="/"
            className="flex items-center gap-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to home
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
              }}
            >
              <Lock className="w-3 h-3" aria-hidden="true" />
              Manufacturer Portal
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Sign in to manage your manuals and analytics.
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl border p-8 space-y-5 shadow-sm"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  aria-required="true"
                  aria-describedby={error ? 'login-error' : undefined}
                  className="auth-input"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    aria-required="true"
                    minLength={8}
                    className="auth-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  id="login-error"
                  role="alert"
                  aria-live="polite"
                  className="text-sm px-4 py-3 rounded-lg border"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                    color: 'var(--color-destructive)',
                    borderColor: 'color-mix(in srgb, var(--color-destructive) 25%, transparent)',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-1"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
                Demo credentials
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Demo hint */}
            <div
              className="rounded-xl border p-4 space-y-2"
              style={{
                backgroundColor: 'var(--color-primary-subtle)',
                borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
              }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                Use these to try the demo
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    Email
                  </span>
                  <button
                    type="button"
                    onClick={() => setEmail(DEMO_EMAIL)}
                    className="text-xs font-mono font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {DEMO_EMAIL}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassword(DEMO_PASSWORD)}
                    className="text-xs font-mono font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {DEMO_PASSWORD}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Don&apos;t have an account?{' '}
            <a href="/" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
              Get started free
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
