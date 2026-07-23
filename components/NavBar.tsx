'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Menu, X, UserRound } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home',        href: '/'              },
  { label: 'About',       href: '#about'         },
  { label: 'Get Started', href: '#how-it-works'  },
  { label: 'Features',    href: '#features'      },
  { label: 'Pricing',     href: '#pricing'       },
  { label: 'Products Forum', href: '/community'  },
  { label: 'FAQ',         href: '#faq'           },
  { label: 'Contact',     href: '#contact'       },
]

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route-like hash clicks
  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <nav
        className="container flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded shrink-0"
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

        {/* Desktop centre links */}
        <div className="hidden lg:flex items-center gap-0.5" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              role="listitem"
              className="px-2.5 py-1.5 rounded-lg text-[0.8125rem] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-1.5">
          <Link
            href="/user/sign-in"
            className="btn-ghost text-sm text-slate-600 inline-flex items-center gap-1.5"
          >
            <UserRound className="w-4 h-4" aria-hidden="true" />
            User sign in
          </Link>
          <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />
          <Link
            href="/sign-in"
            className="btn-ghost text-sm text-slate-500"
          >
            Manufacturer login
          </Link>
          <Link href="/sign-up" className="btn-primary text-sm">
            Get started free
          </Link>
        </div>

        {/* Mobile/tablet hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile/tablet drawer */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-slate-100 bg-white px-4 pb-6 pt-4 flex flex-col gap-1"
          role="menu"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              role="menuitem"
              onClick={closeMobile}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/user/sign-in"
              onClick={closeMobile}
              className="btn-outline text-sm text-center inline-flex items-center justify-center gap-1.5"
            >
              <UserRound className="w-4 h-4" aria-hidden="true" />
              User sign in
            </Link>
            <Link
              href="/sign-in"
              onClick={closeMobile}
              className="btn-ghost text-sm text-center text-slate-500"
            >
              Manufacturer login
            </Link>
            <Link
              href="/sign-up"
              onClick={closeMobile}
              className="btn-primary text-sm text-center"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
