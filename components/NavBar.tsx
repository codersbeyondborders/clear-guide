'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
      <nav
        className="container flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="ClearGuide home"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary-foreground)' }} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
          </div>
        </Link>

        {/* Centre links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {(['Features', 'Pricing', 'Help', 'About'] as const).map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              style={{ color: 'var(--color-muted-foreground)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-foreground)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted-foreground)')}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="btn-ghost hidden sm:inline-flex text-sm"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="btn-primary text-sm"
            style={{ borderRadius: '9999px' }}
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}
