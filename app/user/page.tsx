'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { ManualSearchForm } from '@/components/ManualSearchForm'
import { ChevronDown, FlaskConical, ArrowRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Demo products (seeded via /api/seed/demo-products)
// ---------------------------------------------------------------------------
const DEMO_PRODUCTS = [
  { id: '9daccecf-33e8-4c9c-b8d2-2fb21663f489', name: 'BrewMaster Pro Smart Coffee Machine',      model: 'BMP-X500',  brand: 'BrewMaster'  },
  { id: '5e38b874-b179-4b80-82db-a96a75502ab6', name: 'GlideStep X2 Electric Wheelchair',         model: 'GSX2-LW',   brand: 'GlideStep'   },
  { id: '1d3e6cd5-c847-4843-8950-f1c5aff356e5', name: 'VertiDesk Apex Adjustable Work Desk',      model: 'VDA-250',   brand: 'VertiDesk'   },
  { id: '73be4028-91a6-428b-8d64-bbc8332fd9b7', name: 'SoundShield Pro Noise-Canceling Headphones', model: 'SSP-ANC4', brand: 'SoundShield' },
  { id: '706376d2-1da6-4a2f-ac50-0962aa761061', name: 'AuraEar Clarity Digital Hearing Aid',      model: 'AEC-RIC2',  brand: 'AuraEar'     },
]

// Brand initials background colours — fixed palette for consistency
const BRAND_COLORS: Record<string, string> = {
  BrewMaster: '#d97706',
  GlideStep:  '#0284c7',
  VertiDesk:  '#7c3aed',
  SoundShield: '#dc2626',
  AuraEar:    '#059669',
}

export default function UserPortalPage() {
  const router = useRouter()
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary" aria-label="ClearGuide home">
            ClearGuide
          </Link>
          <Link
            href="/manufacturer/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary rounded"
          >
            Manufacturer Login
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">

          {/* Page heading */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground text-balance">Find Your Guide</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Scan your product QR code or search by product details to access your accessible guide.
            </p>
          </div>

          {/* QR Scan card */}
          <section aria-labelledby="qr-section-title" className="card p-8 flex flex-col items-center gap-6 text-center">
            <div>
              <h2 id="qr-section-title" className="text-lg font-bold text-foreground">Scan QR Code</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Point your phone camera at the QR code on your product or packaging.
              </p>
            </div>
            <QRCodeDisplay targetId="demo-qr-123" />
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4" aria-hidden="true">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Or search manually</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Demo products */}
          <section aria-labelledby="demo-section-title">
            <button
              type="button"
              id="demo-section-title"
              onClick={() => setDemoOpen(v => !v)}
              aria-expanded={demoOpen}
              aria-controls="demo-product-list"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                borderColor: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
              }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <FlaskConical className="w-4 h-4 shrink-0" aria-hidden="true" />
                Try a demo product
              </span>
              <ChevronDown
                className="w-4 h-4 shrink-0 transition-transform duration-200"
                style={{ transform: demoOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                aria-hidden="true"
              />
            </button>

            {demoOpen && (
              <ul
                id="demo-product-list"
                className="mt-2 rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                role="list"
                aria-label="Demo products"
              >
                {DEMO_PRODUCTS.map((p, i) => (
                  <li
                    key={p.id}
                    className="border-b last:border-b-0"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/manual/${p.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      aria-label={`Open ${p.name} demo manual`}
                    >
                      {/* Brand avatar */}
                      <div
                        className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white font-black text-sm"
                        style={{ backgroundColor: BRAND_COLORS[p.brand] ?? 'var(--color-primary)' }}
                        aria-hidden="true"
                      >
                        {p.brand.charAt(0)}
                      </div>

                      {/* Name + model */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
                          {p.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
                          {p.brand} &middot; {p.model}
                        </p>
                      </div>

                      <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Search form card */}
          <section aria-labelledby="search-section-title" className="card p-8 space-y-5">
            <div>
              <h2 id="search-section-title" className="text-lg font-bold text-foreground">Enter Product Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Find your manual using your device information.
              </p>
            </div>
            <ManualSearchForm />
          </section>

        </div>
      </main>

      <footer className="py-6 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ClearGuide. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
