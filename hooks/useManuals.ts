'use client'

import useSWR from 'swr'
import type { ManualListItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Fetches the authenticated user's manual list with SWR.
 *
 * Caching strategy:
 * - `refreshInterval: 30_000`   — refetch every 30 s in the background (stale-while-revalidate)
 * - `dedupingInterval: 10_000`  — deduplicate identical requests within 10 s
 * - `revalidateOnFocus: true`   — revalidate when user returns to the tab
 * - `revalidateOnReconnect: true` — revalidate on network reconnect
 * - `keepPreviousData: true`    — show stale data while revalidating (avoids flash-of-empty)
 */
export function useManuals(status?: string) {
  const key = status && status !== 'all'
    ? `/api/manuals?status=${encodeURIComponent(status)}`
    : '/api/manuals'

  const { data, error, isLoading, mutate } = useSWR<ManualListItem[]>(
    key,
    fetcher,
    {
      refreshInterval: 30_000,
      dedupingInterval: 10_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    },
  )

  const deleteManual = async (id: string) => {
    // Optimistic update — remove from cache immediately
    mutate((prev) => prev?.filter((m) => m.id !== id), false)
    await fetch(`/api/manuals/${id}`, { method: 'DELETE' })
    // Revalidate from server to confirm
    mutate()
  }

  const createManual = async (body: object): Promise<ManualListItem | null> => {
    try {
      const res = await fetch('/api/manuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) return null
      const newManual = await res.json() as ManualListItem
      // Optimistic prepend
      mutate((prev) => [newManual, ...(prev ?? [])], false)
      return newManual
    } catch {
      return null
    }
  }

  return {
    manuals: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
    deleteManual,
    createManual,
  }
}

