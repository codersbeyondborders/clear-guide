import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider'
import { attachDatabasePool } from '@vercel/functions'

// ---------------------------------------------------------------------------
// Aurora PostgreSQL uses AWS_APG_* prefixed env vars from the Vercel
// Aurora integration. Fall back to PGPASSWORD for local dev if set.
// ---------------------------------------------------------------------------
const apgHost     = process.env.AWS_APG_PGHOST     ?? ''
const apgUser     = process.env.AWS_APG_PGUSER     ?? 'postgres'
const apgDatabase = process.env.AWS_APG_PGDATABASE ?? 'postgres'
const apgPort     = parseInt(process.env.AWS_APG_PGPORT ?? '5432', 10)
const apgRegion   = process.env.AWS_APG_AWS_REGION ?? process.env.AWS_REGION ?? 'us-east-1'
const apgRoleArn  = process.env.AWS_APG_AWS_ROLE_ARN ?? process.env.AWS_ROLE_ARN ?? ''

const usePassword = !!process.env.PGPASSWORD

function getPassword(host: string): (() => Promise<string>) | string | undefined {
  if (usePassword) return process.env.PGPASSWORD

  const signer = new Signer({
    credentials: awsCredentialsProvider({
      roleArn: apgRoleArn,
    }),
    region: apgRegion,
    hostname: host,
    username: apgUser,
    port: apgPort,
  })
  return () => signer.getAuthToken()
}

// ---------------------------------------------------------------------------
// Primary write pool
// ---------------------------------------------------------------------------
const writerHost = apgHost

export const pool = new Pool({
  host: writerHost,
  database: apgDatabase,
  port: apgPort,
  user: apgUser,
  password: getPassword(writerHost),
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})
attachDatabasePool(pool)

// ---------------------------------------------------------------------------
// Read replica pool — falls back to writer if no dedicated reader host
// ---------------------------------------------------------------------------
const readerHost = process.env.AWS_APG_PGHOST_READ ?? writerHost

export const readPool = new Pool({
  host: readerHost,
  database: apgDatabase,
  port: apgPort,
  user: apgUser,
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
