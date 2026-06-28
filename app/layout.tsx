import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './design-overrides.css'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'ClearGuide — Accessible AI-Powered Product Manuals',
    template: '%s — ClearGuide',
  },
  description:
    'Replace paper manuals with accessible, AI-powered digital guides. High-contrast mode, multi-language, QR integration, and instant AI chat support.',
  keywords: ['product manual', 'accessible manual', 'AI guide', 'manufacturer tool', 'QR manual'],
  openGraph: {
    title: 'ClearGuide — Accessible AI-Powered Product Manuals',
    description: 'Create and share accessible product manuals with AI-powered support.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f172a' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/*
          CSS token overrides — server-rendered so they are present before
          any paint. next-themes adds the .dark class to <html>; these rules
          use CSS custom properties so all var(--color-*) references across
          the app respond to the .dark class instantly.
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Light tokens (default) */
          :root {
            --color-background: #ffffff;
            --color-background-subtle: #f8fafc;
            --color-card: #ffffff;
            --color-card-hover: #f1f5f9;
            --color-foreground: #0f172a;
            --color-muted-foreground: #64748b;
            --color-primary: #00d084;
            --color-primary-hover: #00b366;
            --color-primary-foreground: #ffffff;
            --color-primary-subtle: #ecfdf5;
            --color-border: #e2e8f0;
            --color-border-strong: #cbd5e1;
            --color-destructive: #dc2626;
            --color-destructive-foreground: #ffffff;
            --color-ring: #00d084;
          }
          /* Dark tokens — applied when next-themes adds .dark to <html> */
          :root.dark {
            --color-background: #0f172a;
            --color-background-subtle: #1e293b;
            --color-card: #1e293b;
            --color-card-hover: #273548;
            --color-foreground: #f1f5f9;
            --color-muted-foreground: #94a3b8;
            --color-primary: #10b981;
            --color-primary-hover: #059669;
            --color-primary-foreground: #0f172a;
            --color-primary-subtle: #064e3b;
            --color-border: #334155;
            --color-border-strong: #475569;
            --color-destructive: #f87171;
            --color-destructive-foreground: #0f172a;
            --color-ring: #10b981;
          }
          /* Semantic utility overrides — ensure Tailwind compiled utilities
             use live var() values rather than hardcoded hex at build time. */
          .bg-background        { background-color: var(--color-background) !important; }
          .bg-background-subtle { background-color: var(--color-background-subtle) !important; }
          .bg-card              { background-color: var(--color-card) !important; }
          .text-foreground      { color: var(--color-foreground) !important; }
          .text-muted-foreground{ color: var(--color-muted-foreground) !important; }
          .text-primary         { color: var(--color-primary) !important; }
          .text-primary-foreground { color: var(--color-primary-foreground) !important; }
          .bg-primary           { background-color: var(--color-primary) !important; }
          .bg-primary-subtle    { background-color: var(--color-primary-subtle) !important; }
          .border-border        { border-color: var(--color-border) !important; }
          .border-border-strong { border-color: var(--color-border-strong) !important; }
          .card                 { background-color: var(--color-card) !important; border-color: var(--color-border) !important; }
        `}} />
      </head>
      <body className="font-sans antialiased">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-foreground)',
          }}
        >
          Skip to main content
        </a>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
