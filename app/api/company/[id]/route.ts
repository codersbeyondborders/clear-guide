import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { z } from 'zod'
import { can } from '@/lib/company-roles'
import type { CompanyRole } from '@/lib/types'

const UpdateCompanySchema = z.object({
  name:     z.string().min(2).max(200).optional(),
  industry: z.string().max(100).optional().nullable(),
  website:  z.string().url().max(500).optional().nullable(),
  logoUrl:  z.string().max(1000).optional().nullable(),
})

async function getMemberRole(companyId: string, userId: string): Promise<CompanyRole | null> {
  const r = await query(
    `SELECT role FROM company_members WHERE company_id = $1 AND user_id = $2 AND status = 'active'`,
    [companyId, userId],
  )
  return r.rows[0]?.role ?? null
}

// ---------------------------------------------------------------------------
// GET /api/company/[id]
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getMemberRole(id, user.id)
    if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const result = await query(
      `SELECT id, name, slug, logo_url AS "logoUrl", industry, website,
              owner_user_id AS "ownerUserId", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM companies WHERE id = $1`,
      [id],
    )
    if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...result.rows[0], myRole: role })
  } catch (err) {
    console.error('[company/id] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/company/[id]
// ---------------------------------------------------------------------------
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getMemberRole(id, user.id)
    if (!role || !can(role, 'edit_company')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = UpdateCompanySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
    }

    const { name, industry, website, logoUrl } = parsed.data
    await query(
      `UPDATE companies SET
         name = COALESCE($1, name),
         industry = COALESCE($2, industry),
         website = COALESCE($3, website),
         logo_url = COALESCE($4, logo_url),
         updated_at = NOW()
       WHERE id = $5`,
      [name ?? null, industry ?? null, website ?? null, logoUrl ?? null, id],
    )
    return NextResponse.json({ id, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[company/id] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}
