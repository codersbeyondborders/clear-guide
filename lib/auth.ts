import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

// ---------------------------------------------------------------------------
// Auth Pool — uses PGPASSWORD env var for direct password auth.
// Better Auth needs a pg Pool directly; OIDC/IAM is used for app data queries
// in lib/db.ts, but auth session queries use password auth for reliability.
// ---------------------------------------------------------------------------
const authPool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE ?? 'postgres',
  port: 5432,
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 10,
})

// ---------------------------------------------------------------------------
// baseURL cascade: explicit env → Vercel prod URL → Vercel preview URL → v0 runtime
// ---------------------------------------------------------------------------
const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

const trustedOrigins = [
  baseURL,
  process.env.V0_RUNTIME_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,
].filter(Boolean) as string[]

// ---------------------------------------------------------------------------
// Better Auth server config
// ---------------------------------------------------------------------------
export const auth = betterAuth({
  database: authPool,
  baseURL,
  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // refresh token every 24 h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5-minute client-side cache
    },
  },

  // Dev-mode cookie override: required for v0 preview iframe (cross-site).
  // NEVER remove this block — without it, the browser drops the session cookie.
  ...(process.env.NODE_ENV === 'development' && {
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
  }),
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
