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

const InviteSchema = z.object({
  email: z.string().email(),
  role:  z.enum(['admin', 'manager', 'creator', 'viewer']),
})

// ---------------------------------------------------------------------------
// GET /api/company/[id]/invitations  — list pending invitations
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
    if (!role || !can(role, 'invite_members')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await query(
      `SELECT id, email, role, token, expires_at AS "expiresAt", accepted_at AS "acceptedAt"
       FROM company_invitations
       WHERE company_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC`,
      [id],
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[invitations] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/company/[id]/invitations  — send an invite
// ---------------------------------------------------------------------------
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const actorRole = await getMemberRole(id, user.id)
    if (!actorRole || !can(actorRole, 'invite_members')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = InviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
    }

    const { email, role } = parsed.data

    // Revoke any existing pending invite for same email+company
    await query(
      `DELETE FROM company_invitations WHERE company_id = $1 AND email = $2 AND accepted_at IS NULL`,
      [id, email],
    )

    const result = await query(
      `INSERT INTO company_invitations (company_id, email, role, invited_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, token, expires_at AS "expiresAt"`,
      [id, email, role, user.id],
    )

    const invite = result.rows[0]

    // Email stub — log payload; wire to real email provider in a later sprint
    console.log('[invite] Email payload:', {
      to: email,
      subject: 'You have been invited to join ClearGuide',
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://clearguide.app'}/accept-invite/${invite.token}`,
      role,
      expiresAt: invite.expiresAt,
    })

    return NextResponse.json({ id: invite.id, token: invite.token }, { status: 201 })
  } catch (err) {
    console.error('[invitations] POST error:', err)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/company/[id]/invitations  — revoke by invitationId
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
    if (!actorRole || !can(actorRole, 'invite_members')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { invitationId } = await request.json()
    if (!invitationId) return NextResponse.json({ error: 'invitationId required' }, { status: 400 })

    await query(
      `DELETE FROM company_invitations WHERE id = $1 AND company_id = $2`,
      [invitationId, id],
    )
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[invitations] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 })
  }
}
