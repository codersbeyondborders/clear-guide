import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

// ---------------------------------------------------------------------------
// IAM-authenticated RDS Signer
// The auth token is short-lived (~15 min) and fetched on every new connection.
// ---------------------------------------------------------------------------
const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION! },
    tokenAudience: 'https://vercel.com',
  }),
  region: process.env.AWS_REGION!,
  hostname: process.env.PGHOST!,
  username: process.env.PGUSER ?? 'postgres',
  port: 5432,
})

// ---------------------------------------------------------------------------
// Primary write pool — connects to the Writer endpoint (or RDS Proxy writer)
// ---------------------------------------------------------------------------
export const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE ?? 'postgres',
  port: 5432,
  user: process.env.PGUSER ?? 'postgres',
  // password is a function so each new connection gets a fresh IAM token
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})
attachDatabasePool(pool)

// ---------------------------------------------------------------------------
// Read replica pool — connects to the Reader endpoint for analytics queries.
// Falls back to the writer pool if PGHOST_READ is not set.
// ---------------------------------------------------------------------------
const readSigner = process.env.PGHOST_READ
  ? new Signer({
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN!,
        clientConfig: { region: process.env.AWS_REGION! },
        tokenAudience: 'https://vercel.com',
      }),
      region: process.env.AWS_REGION!,
      hostname: process.env.PGHOST_READ,
      username: process.env.PGUSER ?? 'postgres',
      port: 5432,
    })
  : signer

export const readPool = new Pool({
  host: process.env.PGHOST_READ ?? process.env.PGHOST,
  database: process.env.PGDATABASE ?? 'postgres',
  port: 5432,
  user: process.env.PGUSER ?? 'postgres',
  password: () => readSigner.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})
attachDatabasePool(readPool)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Single-query helper — uses the writer pool by default. */
export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

/** Single-query helper — uses the reader pool for analytics / read-heavy queries. */
export async function readQuery(text: string, params?: unknown[]) {
  return readPool.query(text, params)
}

/**
 * Acquires a client from the writer pool for multi-statement transactions.
 * Always releases the client in the finally block.
 *
 * @example
 * await withTransaction(async (client) => {
 *   await client.query('INSERT INTO manuals ...', [...])
 *   await client.query('INSERT INTO manual_sections ...', [...])
 * })
 */
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

/**
 * Acquires a client from the writer pool without wrapping in a transaction.
 * Use for multi-query flows that manage their own transaction boundaries.
 */
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
