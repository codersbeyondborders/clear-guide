import { Pool } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_APG_AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_APG_AWS_REGION },
  }),
  region: process.env.AWS_APG_AWS_REGION,
  hostname: process.env.AWS_APG_PGHOST,
  username: process.env.AWS_APG_PGUSER ?? 'postgres',
  port: parseInt(process.env.AWS_APG_PGPORT ?? '5432'),
})

const pool = new Pool({
  host: process.env.AWS_APG_PGHOST,
  database: process.env.AWS_APG_PGDATABASE ?? 'postgres',
  port: parseInt(process.env.AWS_APG_PGPORT ?? '5432'),
  user: process.env.AWS_APG_PGUSER ?? 'postgres',
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

// Split schema from VACUUM (which cannot run inside a transaction)
const rawSql = readFileSync(join(__dirname, '001-setup-schema.sql'), 'utf8')
const [schemaSql, vacuumSql] = rawSql.split(/^\s*VACUUM ANALYZE\s*;/m)

console.log('Running schema against Aurora PostgreSQL...')
const client = await pool.connect()
try {
  await client.query(schemaSql)
  console.log('Schema DDL applied successfully.')
} finally {
  client.release()
}

// VACUUM must run outside a transaction block
if (vacuumSql !== undefined) {
  console.log('Running VACUUM ANALYZE...')
  await pool.query('VACUUM ANALYZE')
  console.log('VACUUM ANALYZE complete.')
}

await pool.end()
console.log('Done.')
