/**
 * scripts/migrate-community.mjs
 * Applies the community SQL migration directly via pg (no ts-node cycle).
 * Usage:
 *   node --env-file-if-exists=.env.development.local scripts/migrate-community.mjs
 */

import pg from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { Pool } = pg

const host   = process.env.AWS_APG_PGHOST
const user   = process.env.AWS_APG_PGUSER   ?? 'postgres'
const db     = process.env.AWS_APG_PGDATABASE ?? 'postgres'
const port   = parseInt(process.env.AWS_APG_PGPORT ?? '5432', 10)
const region = process.env.AWS_APG_AWS_REGION
const role   = process.env.AWS_APG_AWS_ROLE_ARN

if (!host || !region || !role) {
  console.error('[migrate-community] Missing AWS_APG_* environment variables.')
  process.exit(1)
}

const signer = new Signer({
  credentials: awsCredentialsProvider({ roleArn: role, clientConfig: { region } }),
  region,
  hostname: host,
  username: user,
  port,
})

const pool = new Pool({
  host,
  database: db,
  port,
  user,
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 3,
})

async function run() {
  const client = await pool.connect()
  const sqlPath = join(__dirname, '003_community.sql')

  if (!existsSync(sqlPath)) {
    console.error('[migrate-community] scripts/003_community.sql not found')
    process.exit(1)
  }

  const sql = readFileSync(sqlPath, 'utf-8')
  console.log('[migrate-community] Applying 003_community.sql…')

  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('[migrate-community] Done.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[migrate-community] FAILED:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
