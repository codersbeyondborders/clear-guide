import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { query, withTransaction } from '@/lib/db'

// ---------------------------------------------------------------------------
// GET /api/invitations/[token]  — resolve invitation details (pre-auth)
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  try {
    const result = await query(
      `SELECT ci.id, ci.email, ci.role, ci.expires_at AS "expiresAt", ci.accepted_at AS "acceptedAt",
              c.name AS "companyName", c.logo_url AS "companyLogoUrl"
       FROM company_invitations ci
       JOIN companies c ON c.id = ci.company_id
       WHERE ci.token = $1`,
      [token],
    )
    if (!result.rows[0]) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

    const invite = result.rows[0]
    if (invite.acceptedAt) return NextResponse.json({ error: 'Invitation already accepted' }, { status: 410 })
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    return NextResponse.json(invite)
  } catch (err) {
    console.error('[accept-invite] GET error:', err)
    return NextResponse.json({ error: 'Failed to resolve invitation' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/invitations/[token]  — accept invitation (requires auth)
// ---------------------------------------------------------------------------
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const invResult = await query(
      `SELECT id, company_id, email, role, expires_at, accepted_at
       FROM company_invitations WHERE token = $1`,
      [token],
    )
    const invite = invResult.rows[0]
    if (!invite) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    if (invite.accepted_at) return NextResponse.json({ error: 'Already accepted' }, { status: 410 })
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 410 })
    }
    if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
    }

    await withTransaction(async (client) => {
      // Upsert member
      await client.query(
        `INSERT INTO company_members (company_id, user_id, role, status, invited_by, accepted_at)
         VALUES ($1, $2, $3, 'active', $4, NOW())
         ON CONFLICT (company_id, user_id)
         DO UPDATE SET role = EXCLUDED.role, status = 'active', accepted_at = NOW()`,
        [invite.company_id, user.id, invite.role, user.id],
      )
      // Mark invitation as accepted
      await client.query(
        `UPDATE company_invitations SET accepted_at = NOW() WHERE id = $1`,
        [invite.id],
      )
    })

    return NextResponse.json({ companyId: invite.company_id })
  } catch (err) {
    console.error('[accept-invite] POST error:', err)
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
  }
}
