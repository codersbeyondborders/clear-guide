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

const sql = readFileSync(join(__dirname, '004-manual-visibility.sql'), 'utf8')

console.log('Applying migration 004 (manual visibility) against Aurora PostgreSQL...')
const client = await pool.connect()
try {
  await client.query(sql)
  console.log('Migration 004 applied successfully.')
} finally {
  client.release()
}

await pool.end()
console.log('Done.')
