'use client'

import useSWR from 'swr'
import type { ManualListItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useManuals() {
  const { data, error, isLoading, mutate } = useSWR<ManualListItem[]>(
    '/api/manuals',
    fetcher,
    { refreshInterval: 30_000 },
  )

  const deleteManual = async (id: string) => {
    // Optimistic update — remove from cache immediately
    mutate((prev) => prev?.filter((m) => m.id !== id), false)
    await fetch(`/api/manuals/${id}`, { method: 'DELETE' })
    mutate()
  }

  return {
    manuals: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
    deleteManual,
  }
}
