/**
 * lib/community-auth.ts
 * ---------------------
 * Auth helpers for community (end-user) API routes.
 * Uses the Supabase server client to read the session from request cookies.
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Reads the authenticated Supabase user from a Route Handler request.
 * Returns the user object on success, or a 401 NextResponse on failure.
 */
export async function requireAuth(req: NextRequest): Promise<
  | { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } }
  | NextResponse
> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        // Route handlers are read-only for cookies in this helper
        setAll() {},
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  return { user }
}

/**
 * Reads the optional Supabase user from a Route Handler request.
 * Returns null if not authenticated (no error thrown).
 */
export async function getOptionalUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll() {},
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
}
