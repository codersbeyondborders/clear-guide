/**
 * Run migrations 007 (company accounts) + 008 (analytics events)
 * Usage: node --env-file-if-exists=/vercel/share/.env.project scripts/run-007-008-migration.mjs
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pkg from 'pg'

const { Client } = pkg
const __dirname = dirname(fileURLToPath(import.meta.url))

const DB_URL =
  process.env.DATABASE_URL ??
  process.env.AURORA_DATABASE_URL ??
  process.env.POSTGRES_URL

if (!DB_URL) {
  console.error('ERROR: No database URL found. Set DATABASE_URL, AURORA_DATABASE_URL, or POSTGRES_URL.')
  process.exit(1)
}

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()

  for (const file of ['007_company_accounts.sql', '008_analytics_extended.sql']) {
    const sql = readFileSync(join(__dirname, file), 'utf8')
    console.log(`\nRunning ${file}…`)
    try {
      await client.query(sql)
      console.log(`  ${file} — OK`)
    } catch (err) {
      console.error(`  ${file} — FAILED:`, err.message)
    }
  }

  await client.end()
  console.log('\nAll migrations complete.')
}

run().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
