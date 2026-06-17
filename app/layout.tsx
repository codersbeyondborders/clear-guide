import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
    <html lang="en" className={`${inter.variable} scroll-smooth bg-background`}>
      <body className="font-sans bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
