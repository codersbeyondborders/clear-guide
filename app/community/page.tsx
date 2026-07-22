'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Search, MessageCircle, Star, BookOpen, TrendingUp, Users, Loader2, AlertCircle } from 'lucide-react'
import { ThreadCard } from '@/components/community/ThreadCard'
import { StarRating } from '@/components/community/StarRating'
import { GuestBanner } from '@/components/community/GuestBanner'
import { useEndUser } from '@/hooks/useEndUser'
import type { ForumThread } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TopRatedManual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  coverImage: string | null
  description: string | null
  avgRating: number
  reviewCount: number
}

// ---------------------------------------------------------------------------
// Mock data — mirrors real DB payloads
// ---------------------------------------------------------------------------
const MOCK_THREADS: ForumThread[] = [
  {
    id: 'g-t1', manualId: '9daccecf-33e8-4c9c-b8d2-2fb21663f489', userId: 'u1',
    title: 'BrewMaster Pro — cleaning cycle not completing',
    body: 'After pressing Clean, the machine stops at 75% and displays "E3". Has anyone resolved this?',
    isPinned: false, isSolved: true, replyCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    author: { name: 'Oliver H.', image: null },
    manualName: 'BrewMaster Pro Smart Coffee Machine',
  },
  {
    id: 'g-t2', manualId: '5e38b874-b179-4b80-82db-a96a75502ab6', userId: 'u2',
    title: 'GlideStep X2 — battery calibration after long storage',
    body: 'The manual says to do a full discharge before first charge after storage. How many cycles until accurate battery level?',
    isPinned: false, isSolved: false, replyCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: { name: 'Priya K.', image: null },
    manualName: 'GlideStep X2 Electric Wheelchair',
  },
  {
    id: 'g-t3', manualId: '1d3e6cd5-c847-4843-8950-f1c5aff356e5', userId: 'u3',
    title: 'VertiDesk Apex — motor height limit reset',
    body: 'I changed desks and need to reset the min/max height limits. The manual\'s button sequence doesn\'t seem to work on my unit.',
    isPinned: false, isSolved: false, replyCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: { name: 'Sam A.', image: null },
    manualName: 'VertiDesk Apex Adjustable Work Desk',
  },
  {
    id: 'g-t4', manualId: '73be4028-91a6-428b-8d64-bbc8332fd9b7', userId: 'u4',
    title: 'SoundShield Pro — ANC not activating on Bluetooth',
    body: 'Works perfectly wired but ANC only turns on when plugged in. Is this a firmware bug or intentional design?',
    isPinned: false, isSolved: true, replyCount: 11,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    author: { name: 'Marcus L.', image: null },
    manualName: 'SoundShield Pro Noise-Canceling Headphones',
  },
]

const MOCK_TOP_RATED: TopRatedManual[] = [
  { id: '9daccecf-33e8-4c9c-b8d2-2fb21663f489', productName: 'BrewMaster Pro Smart Coffee Machine', productModel: 'BMP-X500', brand: 'BrewMaster', coverImage: null, description: null, avgRating: 4.8, reviewCount: 42 },
  { id: '73be4028-91a6-428b-8d64-bbc8332fd9b7', productName: 'SoundShield Pro Noise-Canceling Headphones', productModel: 'SSP-ANC4', brand: 'SoundShield', coverImage: null, description: null, avgRating: 4.6, reviewCount: 31 },
  { id: '1d3e6cd5-c847-4843-8950-f1c5aff356e5', productName: 'VertiDesk Apex Adjustable Work Desk', productModel: 'VDA-250', brand: 'VertiDesk', coverImage: null, description: null, avgRating: 4.4, reviewCount: 19 },
  { id: '5e38b874-b179-4b80-82db-a96a75502ab6', productName: 'GlideStep X2 Electric Wheelchair', productModel: 'GSX2-LW', brand: 'GlideStep', coverImage: null, description: null, avgRating: 4.2, reviewCount: 14 },
]

// ---------------------------------------------------------------------------
// Top Rated Manual card
// ---------------------------------------------------------------------------
function TopRatedCard({ manual }: { manual: TopRatedManual }) {
  return (
    <Link
      href={`/manual/${manual.id}`}
      className="flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
        aria-hidden="true"
      >
        {manual.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={manual.coverImage} alt="" className="w-full h-full rounded-xl object-cover" />
        ) : (
          <BookOpen className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-pretty leading-snug" style={{ color: 'var(--color-foreground)' }}>
          {manual.productName}
        </p>
        {manual.brand && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
            {manual.brand} {manual.productModel ? `· ${manual.productModel}` : ''}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <StarRating value={Math.round(manual.avgRating)} readOnly size="sm" />
          <span className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>
            {manual.avgRating.toFixed(1)}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            ({manual.reviewCount} review{manual.reviewCount !== 1 ? 's' : ''})
          </span>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------
function StatBadge({ icon: Icon, label }: { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CommunityPage() {
  const { user } = useEndUser()
  const [activeTab, setActiveTab] = useState<'discussions' | 'top-rated'>('discussions')
  const [search, setSearch] = useState('')

  const { data: threadsData, error: threadsError, isLoading: threadsLoading } = useSWR<{ data: ForumThread[] }>(
    '/api/community/threads',
    fetcher,
    { fallbackData: { data: MOCK_THREADS }, revalidateOnFocus: false },
  )

  const { data: topData, error: topError, isLoading: topLoading } = useSWR<{ data: TopRatedManual[] }>(
    '/api/community/top-rated',
    fetcher,
    { fallbackData: { data: MOCK_TOP_RATED }, revalidateOnFocus: false },
  )

  const allThreads = threadsData?.data ?? []
  const filteredThreads = search.trim()
    ? allThreads.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.body.toLowerCase().includes(search.toLowerCase()) ||
        t.manualName?.toLowerCase().includes(search.toLowerCase()),
      )
    : allThreads

  const topRated = topData?.data ?? []

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>

      {/* Header */}
      <header
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-primary)' }}
          >
            ClearGuide
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/find"
              className="text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Find a product
            </Link>
            {!user ? (
              <a
                href="/user/sign-in"
                className="inline-flex items-center h-8 px-3 rounded-xl border text-xs font-semibold"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}
              >
                Sign in
              </a>
            ) : (
              <span className="text-xs font-medium" style={{ color: 'var(--color-foreground)' }}>
                {user.user_metadata?.name as string ?? user.email}
              </span>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Hero */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Community</h1>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            Browse discussions and top-rated product manuals from our community.
          </p>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <StatBadge icon={MessageCircle} label={`${allThreads.length} discussion${allThreads.length !== 1 ? 's' : ''}`} />
            <StatBadge icon={Star} label={`${topRated.length} rated product${topRated.length !== 1 ? 's' : ''}`} />
          </div>
        </div>

        {/* Guest banner */}
        {!user && (
          <GuestBanner
            message="Join ClearGuide to contribute to the community, write reviews, and ask questions."
          />
        )}

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search discussions…"
            aria-label="Search discussions"
            className="w-full h-10 pl-9 pr-4 rounded-xl border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>

        {/* Tabs */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex border-b"
            style={{ borderColor: 'var(--color-border)' }}
            role="tablist"
            aria-label="Community sections"
          >
            {([
              { id: 'discussions' as const,  label: 'Recent Discussions', Icon: MessageCircle },
              { id: 'top-rated' as const,    label: 'Top Rated',          Icon: TrendingUp },
            ]).map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  backgroundColor: 'transparent',
                }}
              >
                <tab.Icon className="w-4 h-4" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Discussions tab */}
            {activeTab === 'discussions' && (
              <div id="panel-discussions" role="tabpanel" aria-labelledby="tab-discussions">
                {threadsLoading && (
                  <div className="flex justify-center py-8" role="status" aria-label="Loading discussions">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                  </div>
                )}
                {threadsError && (
                  <div className="flex items-center gap-2 text-sm p-3 rounded-xl border" role="alert"
                    style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Failed to load discussions.
                  </div>
                )}
                {!threadsLoading && filteredThreads.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                    {search ? 'No discussions match your search.' : 'No discussions yet.'}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {filteredThreads.map(t => (
                    <ThreadCard key={t.id} thread={t} showManualTag />
                  ))}
                </div>
              </div>
            )}

            {/* Top Rated tab */}
            {activeTab === 'top-rated' && (
              <div id="panel-top-rated" role="tabpanel" aria-labelledby="tab-top-rated">
                {topLoading && (
                  <div className="flex justify-center py-8" role="status" aria-label="Loading top-rated manuals">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                  </div>
                )}
                {topError && (
                  <div className="flex items-center gap-2 text-sm p-3 rounded-xl border" role="alert"
                    style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Failed to load top-rated products.
                  </div>
                )}
                {!topLoading && topRated.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                    No reviews yet. Be the first to rate a product.
                  </p>
                )}
                <div className="flex flex-col gap-3">
                  {topRated.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <TopRatedCard manual={m} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      <footer
        className="border-t py-5 mt-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
      >
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Powered by <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>ClearGuide</span>
          </p>
          <Link href="/user" className="text-xs font-medium hover:underline underline-offset-2" style={{ color: 'var(--color-muted-foreground)' }}>
            Find a manual
          </Link>
        </div>
      </footer>

    </div>
  )
}
