// Server-side auth helper — wraps Supabase server client
// Use this in Server Components and Route Handlers to get the current user/session
import { createClient } from '@/lib/supabase/server'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export type User = {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}
