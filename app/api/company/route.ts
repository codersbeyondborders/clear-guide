import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { query, withTransaction } from '@/lib/db'
import { z } from 'zod'

const CreateCompanySchema = z.object({
  name:     z.string().min(2).max(200),
  industry: z.string().max(100).optional().nullable(),
  website:  z.string().url().max(500).optional().nullable(),
  logoUrl:  z.string().max(1000).optional().nullable(),
})

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ---------------------------------------------------------------------------
// POST /api/company  — create company, set caller as owner
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = CreateCompanySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
    }

    const { name, industry, website, logoUrl } = parsed.data
    let slug = slugify(name)

    let company: { id: string; slug: string } | null = null
    await withTransaction(async (client) => {
      // Ensure slug is unique — append random suffix if taken
      const existing = await client.query('SELECT id FROM companies WHERE slug = $1', [slug])
      if (existing.rows.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`

      const result = await client.query(
        `INSERT INTO companies (owner_user_id, name, slug, industry, website, logo_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, slug`,
        [user.id, name, slug, industry ?? null, website ?? null, logoUrl ?? null],
      )
      company = result.rows[0]

      // Add owner as a member
      await client.query(
        `INSERT INTO company_members (company_id, user_id, role, status, invited_by, accepted_at)
         VALUES ($1, $2, 'owner', 'active', $2, NOW())`,
        [company!.id, user.id],
      )
    })

    return NextResponse.json(company, { status: 201 })
  } catch (err) {
    console.error('[company] POST error:', err)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// GET /api/company  — get the company the caller belongs to (first active one)
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await query(
      `SELECT c.id, c.name, c.slug, c.logo_url AS "logoUrl", c.industry, c.website,
              c.owner_user_id AS "ownerUserId", c.created_at AS "createdAt",
              cm.role AS "myRole", cm.status AS "myStatus"
       FROM companies c
       JOIN company_members cm ON cm.company_id = c.id AND cm.user_id = $1
       WHERE cm.status = 'active'
       ORDER BY c.created_at ASC
       LIMIT 1`,
      [user.id],
    )

    if (!result.rows[0]) return NextResponse.json(null)
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error('[company] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}
