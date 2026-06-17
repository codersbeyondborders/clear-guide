'use client'

import { use } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import useSWR from 'swr'
import { KPICard } from '@/components/KPICard'
import { ViewsLineChart, TopQueriesBarChart } from '@/components/AnalyticsCharts'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AnalyticsData {
  manualName?: string
  totalViews: number
  activeUsers: number
  avgTimeSpent: string
  trendViews: number
  trendUsers: number
  viewsOverTime: { date: string; views: number }[]
  topAIQueries: { query: string; count: number }[]
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="rounded-lg animate-pulse"
      style={{ height, backgroundColor: 'var(--color-background-subtle)' }}
      aria-hidden="true"
    />
  )
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading, error } = useSWR<AnalyticsData>(
    `/api/manuals/${id}/analytics`,
    fetcher,
    { refreshInterval: 60_000 },
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="container flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/manufacturer/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </a>
            <div>
              <h1 className="text-base font-bold leading-none" style={{ color: 'var(--color-foreground)' }}>
                {data?.manualName ?? 'Analytics'}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                Last 30 days &mdash; auto-refreshes every minute
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-outline flex items-center gap-2 text-xs"
            onClick={() => {
              /* CSV export placeholder */
              alert('CSV export coming in Phase 4.')
            }}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </header>

      <main className="container py-10 space-y-8">
        {/* Error */}
        {error && (
          <div
            role="alert"
            className="px-4 py-3 rounded-lg border text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              color: 'var(--color-destructive)',
              borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
            }}
          >
            Failed to load analytics. Please refresh.
          </div>
        )}

        {/* KPI cards */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-5 animate-pulse h-28"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  aria-hidden="true"
                />
              ))
            ) : data ? (
              <>
                <KPICard label="Total Views"          value={data.totalViews.toLocaleString()} trend={data.trendViews} />
                <KPICard label="Active Users (30d)"   value={data.activeUsers.toLocaleString()} trend={data.trendUsers} />
                <KPICard label="Avg. Time Spent"      value={data.avgTimeSpent} />
                <KPICard label="AI Queries"           value={data.topAIQueries.reduce((s, q) => s + q.count, 0).toLocaleString()} />
              </>
            ) : null}
          </div>
        </section>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Views over time */}
          <section
            aria-labelledby="views-chart-heading"
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <h2 id="views-chart-heading" className="text-sm font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
              Views Over Time
            </h2>
            {isLoading ? <ChartSkeleton /> : data ? <ViewsLineChart data={data.viewsOverTime} /> : null}
          </section>

          {/* Top AI queries */}
          <section
            aria-labelledby="queries-chart-heading"
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <h2 id="queries-chart-heading" className="text-sm font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
              Top AI Support Queries
            </h2>
            {isLoading ? (
              <ChartSkeleton height={data?.topAIQueries?.length ? data.topAIQueries.length * 44 : 180} />
            ) : data?.topAIQueries?.length ? (
              <TopQueriesBarChart data={data.topAIQueries} />
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
                No AI queries recorded yet.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
