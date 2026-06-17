/**
 * scripts/migrate.ts
 * ------------------
 * Runs all numbered SQL scripts in scripts/ in order.
 * Tracks applied migrations in a `schema_migrations` table.
 *
 * Usage (from project root):
 *   node --env-file-if-exists=.env.development.local --loader ts-node/esm scripts/migrate.ts
 * Or via package.json script:
 *   pnpm db:migrate
 */

import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION! },
  }),
  region: process.env.AWS_REGION!,
  hostname: process.env.PGHOST!,
  username: process.env.PGUSER ?? 'postgres',
  port: 5432,
})

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE ?? 'postgres',
  port: 5432,
  user: process.env.PGUSER ?? 'postgres',
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  const client = await pool.connect()

  try {
    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const scriptsDir = path.join(process.cwd(), 'scripts')
    const files = fs
      .readdirSync(scriptsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file],
      )

      if (rows.length > 0) {
        console.log(`[migrate] skipped (already applied): ${file}`)
        continue
      }

      console.log(`[migrate] applying: ${file}`)
      const sql = fs.readFileSync(path.join(scriptsDir, file), 'utf-8')

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        )
        await client.query('COMMIT')
        console.log(`[migrate] done: ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`[migrate] FAILED: ${file}`, err)
        process.exit(1)
      }
    }

    console.log('[migrate] all migrations up to date.')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('[migrate] unexpected error', err)
  process.exit(1)
})
