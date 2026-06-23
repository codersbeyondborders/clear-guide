'use client'

import useSWR from 'swr'
import type { DashboardAnalytics } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Fetches aggregate dashboard KPIs + recent activity feed.
 * Refreshes every 60 seconds and revalidates on focus.
 */
export function useDashboardAnalytics() {
  const { data, error, isLoading } = useSWR<DashboardAnalytics>(
    '/api/dashboard/analytics',
    fetcher,
    {
      refreshInterval: 60_000,
      dedupingInterval: 30_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    },
  )

  return {
    kpi: data?.kpi ?? null,
    recentActivity: data?.recentActivity ?? [],
    isLoading,
    isError: !!error,
  }
}
