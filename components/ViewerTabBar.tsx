'use client'

import { useRouter } from 'next/navigation'
import { FileText, LayoutGrid, Video, MessageSquare, Download, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export type ViewerMode = 'text' | 'infographic' | 'video' | 'chat'

interface ViewerTabBarProps {
  manualId: string
  activeMode: ViewerMode
}

const TABS: { id: ViewerMode; label: string; Icon: typeof FileText }[] = [
  { id: 'text',        label: 'Text',        Icon: FileText    },
  { id: 'infographic', label: 'Infographic', Icon: LayoutGrid  },
  { id: 'video',       label: 'Video',       Icon: Video       },
  { id: 'chat',        label: 'AI Chat',     Icon: MessageSquare },
]

export function ViewerTabBar({ manualId, activeMode }: ViewerTabBarProps) {
  const router = useRouter()
  const [downloadOpen, setDownloadOpen] = useState(false)

  return (
    <nav
      className="sticky bottom-0 z-20 border-t flex items-center"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      aria-label="Manual viewing modes"
    >
      {/* Tabs */}
      <div className="flex flex-1 items-center">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeMode === id
          return (
            <button
              key={id}
              onClick={() => router.push(`/manual/${manualId}/${id}`)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`View ${label} mode`}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                aria-hidden="true"
              />
              {label}
            </button>
          )
        })}
      </div>

      {/* Download pill */}
      <div className="relative px-3 border-l" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setDownloadOpen(o => !o)}
          className="flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          aria-haspopup="menu"
          aria-expanded={downloadOpen}
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Download
          <ChevronDown className="w-3 h-3" aria-hidden="true" />
        </button>
        {downloadOpen && (
          <div
            className="absolute bottom-full right-0 mb-1 w-36 rounded-xl border shadow-lg overflow-hidden z-30"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            role="menu"
          >
            {['PDF', 'DOCX'].map(fmt => (
              <button
                key={fmt}
                role="menuitem"
                onClick={() => setDownloadOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none"
                style={{ color: 'var(--color-foreground)' }}
              >
                Download as {fmt}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
