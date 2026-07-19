'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing',  href: '#pricing'  },
  { label: 'FAQ',      href: '#faq'      },
]

export function NavBar() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm"
    >
      <nav
        className="container flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          aria-label="ClearGuide home"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
          </span>
        </Link>

        {/* Centre links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="btn-ghost hidden sm:inline-flex text-sm text-slate-600">
            Log in
          </Link>
          <Link href="/sign-up" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}
