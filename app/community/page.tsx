'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Search, Package, Loader2, AlertCircle, SlidersHorizontal, X, Star,
} from 'lucide-react'
import { ProductForumCard } from '@/components/community/ProductForumCard'
import { GuestBanner } from '@/components/community/GuestBanner'
import { useEndUser } from '@/hooks/useEndUser'
import type { PublicProduct } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock data — mirrors the /api/public/manuals payload (published + public)
// ---------------------------------------------------------------------------
const MOCK_PRODUCTS: PublicProduct[] = [
  {
    id: '9daccecf-33e8-4c9c-b8d2-2fb21663f489',
    productName: 'BrewMaster Pro Smart Coffee Machine', productModel: 'BMP-X500', brand: 'BrewMaster',
    description: 'Programmable drip coffee maker with self-cleaning cycle, thermal carafe, and app control.',
    coverImage: null, languages: ['en', 'es', 'fr'],
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    avgRating: 4.8, reviewCount: 42, threadCount: 6,
  },
  {
    id: '73be4028-91a6-428b-8d64-bbc8332fd9b7',
    productName: 'SoundShield Pro Noise-Canceling Headphones', productModel: 'SSP-ANC4', brand: 'SoundShield',
    description: 'Over-ear ANC headphones with 40-hour battery life and multipoint Bluetooth.',
    coverImage: null, languages: ['en', 'de'],
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    avgRating: 4.6, reviewCount: 31, threadCount: 9,
  },
  {
    id: '1d3e6cd5-c847-4843-8950-f1c5aff356e5',
    productName: 'VertiDesk Apex Adjustable Work Desk', productModel: 'VDA-250', brand: 'VertiDesk',
    description: 'Dual-motor sit-stand desk with programmable height presets and anti-collision sensing.',
    coverImage: null, languages: ['en'],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    avgRating: 4.4, reviewCount: 19, threadCount: 3,
  },
  {
    id: '5e38b874-b179-4b80-82db-a96a75502ab6',
    productName: 'GlideStep X2 Electric Wheelchair', productModel: 'GSX2-LW', brand: 'GlideStep',
    description: 'Lightweight foldable power chair with a 15-mile range and joystick or app steering.',
    coverImage: null, languages: ['en', 'es'],
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    avgRating: 4.2, reviewCount: 14, threadCount: 5,
  },
  {
    id: 'c2a9f1e0-6b44-4e2a-9f3c-1a2b3c4d5e6f',
    productName: 'AquaPure Countertop Water Filter', productModel: 'AP-CT10', brand: 'AquaPure',
    description: 'Five-stage countertop reverse-osmosis filter with a replaceable mineral cartridge.',
    coverImage: null, languages: ['en'],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    avgRating: 0, reviewCount: 0, threadCount: 1,
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    productName: 'NimbusHome Smart Thermostat', productModel: 'NH-T3', brand: 'NimbusHome',
    description: 'Learning thermostat with geofencing, energy reports, and voice-assistant support.',
    coverImage: null, languages: ['en', 'fr', 'de', 'es'],
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    avgRating: 4.7, reviewCount: 27, threadCount: 8,
  },
]

const MOCK_BRANDS = ['AquaPure', 'BrewMaster', 'GlideStep', 'NimbusHome', 'SoundShield', 'VertiDesk']

type SortKey = 'recent' | 'top-rated' | 'discussed' | 'name'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent',    label: 'Recently updated' },
  { value: 'top-rated', label: 'Top rated' },
  { value: 'discussed', label: 'Most discussed' },
  { value: 'name',      label: 'Name (A–Z)' },
]

interface ForumResponse {
  data: PublicProduct[]
  brands: string[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProductsForumPage() {
  const { user, isLoading: authLoading } = useEndUser()
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')

  const { data, error, isLoading } = useSWR<ForumResponse>(
    '/api/public/manuals',
    fetcher,
    { fallbackData: { data: MOCK_PRODUCTS, brands: MOCK_BRANDS }, revalidateOnFocus: false },
  )

  const allProducts = data?.data ?? []
  const brands = data?.brands?.length ? data.brands : MOCK_BRANDS

  // Client-side filter + sort for instant feedback
  const products = useMemo(() => {
    let list = [...allProducts]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.productModel?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
      )
    }
    if (brand) list = list.filter(p => p.brand === brand)

    switch (sort) {
      case 'top-rated': list.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount); break
      case 'discussed': list.sort((a, b) => b.threadCount - a.threadCount); break
      case 'name':      list.sort((a, b) => a.productName.localeCompare(b.productName)); break
      default:          list.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    }
    return list
  }, [allProducts, search, brand, sort])

  const hasFilters = Boolean(search.trim() || brand)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>

      {/* Header */}
      <header
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
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
              <span className="text-xs font-medium truncate max-w-[160px]" style={{ color: 'var(--color-foreground)' }}>
                {(user.user_metadata?.name as string) ?? user.email}
              </span>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Hero */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Products Forum</h1>
          </div>
          <p className="text-sm leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
            Browse every publicly listed product. Open a guide, read reviews and discussions as a guest —
            {user ? ' and post your own questions and reviews.' : ' sign in to post questions and write reviews.'}
          </p>
        </section>

        {/* Guest / member context */}
        {!authLoading && (
          !user ? (
            <GuestBanner
              returnTo="/community"
              message="You're browsing as a guest. Sign in to write reviews, ask questions, and mark answers as solved."
            />
          ) : (
            <div
              className="rounded-xl border px-5 py-3 flex items-center gap-2"
              role="status"
              aria-live="polite"
              style={{ backgroundColor: 'var(--color-primary-subtle)', borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)' }}
            >
              <Star className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                You&apos;re signed in — open any product to write reviews and join discussions.
              </p>
            </div>
          )
        )}

        {/* Controls: search + filters */}
        <section aria-label="Search and filter products" className="flex flex-col gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-muted-foreground)' }}
              aria-hidden="true"
            />
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product, brand, or model…"
              className="w-full h-11 pl-9 pr-4 rounded-xl border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm shrink-0" style={{ color: 'var(--color-muted-foreground)' }}>
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Filter</span>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="brand-filter" className="sr-only">Filter by brand</label>
              <select
                id="brand-filter"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="h-9 px-3 rounded-lg border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              >
                <option value="">All brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="sort-select" className="sr-only">Sort products</label>
              <select
                id="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="h-9 px-3 rounded-lg border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => { setSearch(''); setBrand('') }}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Clear
              </button>
            )}

            <p className="text-xs ml-auto" aria-live="polite" style={{ color: 'var(--color-muted-foreground)' }}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </section>

        {/* Results */}
        <section aria-label="Products" aria-busy={isLoading}>
          {isLoading && (
            <div className="flex justify-center py-16" role="status" aria-label="Loading products">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            </div>
          )}

          {error && !isLoading && (
            <div
              className="flex items-center gap-2 text-sm p-4 rounded-xl border" role="alert"
              style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              Failed to load products. Please try again.
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <div
              className="text-center py-16 px-4 rounded-2xl border"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
            >
              <Package className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                {hasFilters ? 'No products match your filters.' : 'No public products yet.'}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setBrand('') }}
                  className="mt-3 text-sm font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && products.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(p => <ProductForumCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

      </main>

      <footer
        className="border-t py-5 mt-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
      >
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Powered by <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>ClearGuide</span>
          </p>
          <Link href="/find" className="text-xs font-medium hover:underline underline-offset-2" style={{ color: 'var(--color-muted-foreground)' }}>
            Find a manual
          </Link>
        </div>
      </footer>

    </div>
  )
}
