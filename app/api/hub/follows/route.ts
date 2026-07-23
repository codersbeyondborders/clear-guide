import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// POST /api/hub/follows  { followingId }  → toggle follow
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  let body: { followingId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const { followingId } = body
  if (!followingId) return NextResponse.json({ data: null, error: 'followingId is required' }, { status: 400 })
  if (followingId === user.id) return NextResponse.json({ data: null, error: 'Cannot follow yourself' }, { status: 400 })

  try {
    let following = false
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT 1 FROM public.hub_follows WHERE follower_id=$1 AND following_id=$2`,
        [user.id, followingId],
      )
      if (rows.length > 0) {
        await client.query(`DELETE FROM public.hub_follows WHERE follower_id=$1 AND following_id=$2`, [user.id, followingId])
        following = false
      } else {
        await client.query(`INSERT INTO public.hub_follows (follower_id, following_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [user.id, followingId])
        following = true
      }
    })

    const { rows: countRow } = await query(
      `SELECT COUNT(*) AS c FROM public.hub_follows WHERE following_id=$1`,
      [followingId],
    )
    return NextResponse.json({ data: { following, followerCount: parseInt(countRow[0]?.c ?? '0') }, error: null })
  } catch (err) {
    console.error('[POST /api/hub/follows]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
