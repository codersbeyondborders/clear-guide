import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

// Aurora PostgreSQL integration env vars (AWS_APG_* prefix)
const auroraHost   = process.env.AWS_APG_PGHOST!
const auroraUser   = process.env.AWS_APG_PGUSER ?? 'postgres'
const auroraDb     = process.env.AWS_APG_PGDATABASE ?? 'postgres'
const auroraPort   = parseInt(process.env.AWS_APG_PGPORT ?? '5432', 10)
const auroraRegion = process.env.AWS_APG_AWS_REGION!
const auroraRole   = process.env.AWS_APG_AWS_ROLE_ARN!

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: auroraRole,
    clientConfig: { region: auroraRegion },
  }),
  region: auroraRegion,
  hostname: auroraHost,
  username: auroraUser,
  port: auroraPort,
})

export const pool = new Pool({
  host: auroraHost,
  database: auroraDb,
  port: auroraPort,
  user: auroraUser,
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})
attachDatabasePool(pool)

// Read queries use the same pool (no separate replica configured)
export const readPool = pool

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
