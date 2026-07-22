'use client'

/**
 * hooks/useEndUser.ts
 * -------------------
 * Returns the current Supabase session user and helpers for role-gating.
 *
 * - isAuthenticated: user has any active session (manufacturer OR end_user)
 * - isGuest:         no active session at all — read-only access applies
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UseEndUserResult {
  user: User | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
}

export function useEndUser(): UseEndUserResult {
  const [user, setUser]       = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isGuest: !user && !isLoading,
    isLoading,
  }
}
