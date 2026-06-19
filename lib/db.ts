import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider'
import { attachDatabasePool } from '@vercel/functions'

// ---------------------------------------------------------------------------
// Auth strategy: prefer PGPASSWORD (direct) over OIDC (IAM).
// OIDC requires a correctly configured Vercel ↔ AWS trust policy; until that
// is confirmed working, PGPASSWORD is the reliable fallback.
// ---------------------------------------------------------------------------
const usePassword = !!process.env.PGPASSWORD

function getPassword(host: string): (() => Promise<string>) | string | undefined {
  if (usePassword) return process.env.PGPASSWORD

  const signer = new Signer({
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN!,
    }),
    region: process.env.AWS_REGION!,
    hostname: host,
    username: process.env.PGUSER ?? 'postgres',
    port: 5432,
  })
  return () => signer.getAuthToken()
}

// ---------------------------------------------------------------------------
// Primary write pool
// ---------------------------------------------------------------------------
const writerHost = process.env.PGHOST ?? ''

export const pool = new Pool({
  host: writerHost,
  database: process.env.PGDATABASE ?? 'postgres',
  port: 5432,
  user: process.env.PGUSER ?? 'postgres',
  password: getPassword(writerHost),
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})
attachDatabasePool(pool)

// ---------------------------------------------------------------------------
// Read replica pool — falls back to writer if PGHOST_READ is not set
// ---------------------------------------------------------------------------
const readerHost = process.env.PGHOST_READ ?? writerHost

export const readPool = new Pool({
  host: readerHost,
  database: process.env.PGDATABASE ?? 'postgres',
  port: 5432,
  user: process.env.PGUSER ?? 'postgres',
  password: getPassword(readerHost),
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})
attachDatabasePool(readPool)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

export async function readQuery(text: string, params?: unknown[]) {
  return readPool.query(text, params)
}

export async function withTransaction<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
