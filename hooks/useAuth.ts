'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, isPending, error } = useSession()
  const router = useRouter()

  const logout = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
    logout,
  }
}
