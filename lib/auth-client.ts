// Re-export Supabase browser client as the auth client
// Used by client components for signIn, signUp, signOut
export { createClient as createAuthClient } from '@/lib/supabase/client'
