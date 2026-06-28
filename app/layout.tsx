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
        {/* Inline script — runs before paint to prevent flash-of-wrong-theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cg-theme');var d=document.documentElement;if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){d.classList.add('dark');d.style.colorScheme='dark';}else{d.classList.remove('dark');d.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
        {/*
          Dark-mode token overrides — injected as a plain <style> tag so they
          live outside Tailwind v4's @layer system entirely and always win the
          cascade over @layer theme tokens.
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (prefers-color-scheme: dark) {
            :root:not(.light) {
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
          }
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
