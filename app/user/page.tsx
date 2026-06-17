import Link from 'next/link'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { ManualSearchForm } from '@/components/ManualSearchForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Your Guide — ClearGuide',
  description: 'Scan a QR code or search by product details to access your accessible product manual.',
}

export default function UserPortalPage() {
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
