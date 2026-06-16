'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const DEMO_EMAIL = 'demo@brewtech.com';
const DEMO_PASSWORD = 'password123';

export default function ManufacturerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        router.push('/manufacturer/dashboard');
      } else {
        setError('Invalid email or password. Try the demo credentials below.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-xl font-bold text-emerald-600">
            ClearGuide
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-5 border border-emerald-100">
              Manufacturer Portal
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-2">Sign in to manage your manuals and analytics.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
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
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-full text-sm transition-colors mt-1"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-xs text-slate-400 font-medium">Demo credentials</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-emerald-700">Use these to try the demo</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Email</span>
                <button
                  type="button"
                  onClick={() => setEmail(DEMO_EMAIL)}
                  className="text-xs font-mono text-emerald-700 hover:underline"
                >
                  {DEMO_EMAIL}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Password</span>
                <button
                  type="button"
                  onClick={() => setPassword(DEMO_PASSWORD)}
                  className="text-xs font-mono text-emerald-700 hover:underline"
                >
                  {DEMO_PASSWORD}
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account? <button onClick={() => router.push('/')} className="text-emerald-600 font-semibold hover:underline">Get started free</button>
          </p>
        </div>
      </main>
    </div>
  );
}
