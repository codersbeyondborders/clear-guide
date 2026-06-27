'use client'

import { use, useState } from 'react'
import { ArrowLeft, Eye, Users, Clock, Download } from 'lucide-react'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import { KPICard } from '@/components/KPICard'

type Period = '7d' | '30d' | '90d'
const PERIODS: { key: Period; label: string }[] = [
  { key: '7d',  label: '7d'  },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
]

// Recharts is ~350 KB — code-split it
const ViewsLineChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.ViewsLineChart),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> },
)
const TopQueriesBarChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.TopQueriesBarChart),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> },
)

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

function ClearGuideLogo() {
  return (
    <a href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="ClearGuide home">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="4" rx="1" fill="white" opacity="0.7" />
          <rect x="2" y="11" width="14" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="14" width="10" height="2" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div className="leading-none hidden sm:block">
        <span className="block text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-sm font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </a>
  )
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [period, setPeriod] = useState<Period>('7d')

  const { data, isLoading, error } = useSWR<AnalyticsData>(
    `/api/manuals/${id}/analytics?period=${period}`,
    fetcher,
    { refreshInterval: 60_000 },
  )

  const totalAIQueries = data?.topAIQueries.reduce((s, q) => s + q.count, 0) ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4 justify-between">
          {/* Left: back + logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/manufacturer/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </a>
            <ClearGuideLogo />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
              <span aria-hidden="true" style={{ color: 'var(--color-muted-foreground)' }}>/</span>
              <a
                href="/manufacturer/dashboard"
                className="truncate focus-visible:outline-none focus-visible:underline"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                Dashboard
              </a>
              <span aria-hidden="true" style={{ color: 'var(--color-muted-foreground)' }}>/</span>
              <span className="font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
                {data?.manualName ?? (isLoading ? 'Loading…' : 'Analytics')}
              </span>
            </nav>
          </div>

          {/* Right: export */}
          <button
            type="button"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)',
              backgroundColor: 'var(--color-card)',
            }}
            onClick={() => {
              if (!data) return
              const rows: string[] = [
                `ClearGuide Analytics — ${data.manualName}`,
                `Exported: ${new Date().toLocaleString()}`,
                `Period: ${period}`,
                '',
                '=== KPI Summary ===',
                `Total Views,${data.totalViews}`,
                `Active Users,${data.activeUsers}`,
                `Avg Time Spent,${data.avgTimeSpent}`,
                `Views Trend,${data.trendViews}%`,
                `Users Trend,${data.trendUsers}%`,
                '',
                '=== Views Over Time ===',
                'Date,Views',
                ...data.viewsOverTime.map(r => `${r.date},${r.views}`),
                '',
                '=== Top AI Queries ===',
                'Query,Count',
                ...data.topAIQueries.map(r => `"${r.query.replace(/"/g, '""')}",${r.count}`),
              ]
              const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${data.manualName ?? 'analytics'}-${period}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            disabled={!data}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Error */}
        {error && (
          <div
            role="alert"
            className="px-4 py-3 rounded-xl border text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              color: 'var(--color-destructive)',
              borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
            }}
          >
            Failed to load analytics. Please refresh.
          </div>
        )}

        {/* ── Page title + period switcher ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Analytics
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
              {data?.manualName
                ? `Performance overview for "${data.manualName}"`
                : 'Performance overview for this manual'}
              &nbsp;&mdash;&nbsp;auto-refreshes every minute
            </p>
          </div>

          {/* Period switcher */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-xl border self-start sm:self-auto shrink-0"
            style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
            role="group"
            aria-label="Time period"
          >
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                aria-pressed={period === key}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: period === key ? 'var(--color-card)' : 'transparent',
                  color: period === key ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  boxShadow: period === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────────── */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-6 animate-pulse h-28"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  aria-hidden="true"
                />
              ))
            ) : data ? (
              <>
                <KPICard
                  label="Total Views"
                  value={data.totalViews.toLocaleString()}
                  trend={data.trendViews}
                  icon={Eye}
                  iconBg="color-mix(in srgb, #22c55e 15%, transparent)"
                  iconColor="#16a34a"
                />
                <KPICard
                  label="Active Users (30d)"
                  value={data.activeUsers.toLocaleString()}
                  trend={data.trendUsers}
                  icon={Users}
                  iconBg="color-mix(in srgb, #64748b 15%, transparent)"
                  iconColor="#475569"
                />
                <KPICard
                  label="Avg. Time Spent"
                  value={data.avgTimeSpent}
                  icon={Clock}
                  iconBg="color-mix(in srgb, #a855f7 15%, transparent)"
                  iconColor="#9333ea"
                />
              </>
            ) : null}
          </div>
        </section>

        {/* ── Charts row ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Views over time */}
          <section
            aria-labelledby="views-chart-heading"
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 id="views-chart-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                Views Over Time
              </h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
              {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </p>
            {isLoading ? (
              <ChartSkeleton height={220} />
            ) : data ? (
              <ViewsLineChart data={data.viewsOverTime} />
            ) : null}
          </section>

          {/* Top AI queries */}
          <section
            aria-labelledby="queries-chart-heading"
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 id="queries-chart-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                Top AI Support Queries
              </h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
              Most asked questions in the last 30 days
            </p>
            {isLoading ? (
              <ChartSkeleton height={200} />
            ) : data?.topAIQueries?.length ? (
              <TopQueriesBarChart data={data.topAIQueries} />
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
                No AI queries recorded yet.
              </p>
            )}
          </section>
        </div>

        {/* ── AI query summary table ───────────────────────────────────── */}
        {!isLoading && (data?.topAIQueries?.length ?? 0) > 0 && (
          <section aria-labelledby="query-table-heading">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h2 id="query-table-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                  Query Breakdown
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {totalAIQueries.toLocaleString()} total queries
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="AI query breakdown">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                        Query
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                        Count
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.topAIQueries.map((q, i) => {
                      const pct = totalAIQueries > 0 ? ((q.count / totalAIQueries) * 100).toFixed(1) : '0.0'
                      return (
                        <tr
                          key={i}
                          style={{ borderBottom: i < data!.topAIQueries.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                        >
                          <td className="px-6 py-3" style={{ color: 'var(--color-foreground)' }}>
                            {q.query}
                          </td>
                          <td className="px-6 py-3 text-right font-semibold" style={{ color: 'var(--color-foreground)' }}>
                            {q.count.toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-right" style={{ color: 'var(--color-muted-foreground)' }}>
                            {pct}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
