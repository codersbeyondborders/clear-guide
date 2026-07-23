import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { can } from '@/lib/company-roles'
import type { CompanyRole } from '@/lib/types'
import { z } from 'zod'

async function getMemberRole(companyId: string, userId: string): Promise<CompanyRole | null> {
  const r = await query(
    `SELECT role FROM company_members WHERE company_id = $1 AND user_id = $2 AND status = 'active'`,
    [companyId, userId],
  )
  return r.rows[0]?.role ?? null
}

// ---------------------------------------------------------------------------
// GET /api/company/[id]/members
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
      `SELECT cm.user_id AS "userId", cm.role, cm.status,
              cm.invited_at AS "invitedAt", cm.accepted_at AS "acceptedAt",
              u.name, u.email, u.image
       FROM company_members cm
       JOIN "user" u ON u.id = cm.user_id
       WHERE cm.company_id = $1
       ORDER BY cm.invited_at ASC`,
      [id],
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[company/members] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

const PatchMemberSchema = z.object({
  userId: z.string().min(1),
  role:   z.enum(['owner', 'admin', 'manager', 'creator', 'viewer']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
})

// ---------------------------------------------------------------------------
// PATCH /api/company/[id]/members  — change role or status
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

    const actorRole = await getMemberRole(id, user.id)
    if (!actorRole || !can(actorRole, 'change_roles')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = PatchMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
    }

    const { userId, role, status } = parsed.data
    if (!role && !status) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    await query(
      `UPDATE company_members SET
         role   = COALESCE($1, role),
         status = COALESCE($2, status)
       WHERE company_id = $3 AND user_id = $4`,
      [role ?? null, status ?? null, id, userId],
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[company/members] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/company/[id]/members  — remove member
// ---------------------------------------------------------------------------
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const actorRole = await getMemberRole(id, user.id)
    if (!actorRole || !can(actorRole, 'change_roles')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Prevent removing the owner
    const target = await query(
      `SELECT role FROM company_members WHERE company_id = $1 AND user_id = $2`,
      [id, userId],
    )
    if (target.rows[0]?.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove the owner' }, { status: 400 })
    }

    await query(
      `DELETE FROM company_members WHERE company_id = $1 AND user_id = $2`,
      [id, userId],
    )
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[company/members] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
