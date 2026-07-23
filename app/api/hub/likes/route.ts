import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// POST /api/hub/likes  { targetType, targetId }  → toggle like
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  let body: { targetType?: string; targetId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const { targetType, targetId } = body
  if (!targetType || !targetId) return NextResponse.json({ data: null, error: 'targetType and targetId are required' }, { status: 400 })
  if (!['post', 'comment', 'thread_reply'].includes(targetType)) {
    return NextResponse.json({ data: null, error: 'Invalid targetType' }, { status: 400 })
  }

  try {
    let liked = false
    await withTransaction(async (client) => {
      const { rows: existing } = await client.query(
        `SELECT id FROM public.hub_likes WHERE user_id=$1 AND target_type=$2 AND target_id=$3`,
        [user.id, targetType, targetId],
      )

      if (existing.length > 0) {
        // Unlike
        await client.query(
          `DELETE FROM public.hub_likes WHERE user_id=$1 AND target_type=$2 AND target_id=$3`,
          [user.id, targetType, targetId],
        )
        liked = false
      } else {
        // Like
        await client.query(
          `INSERT INTO public.hub_likes (user_id, target_type, target_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [user.id, targetType, targetId],
        )
        liked = true
      }

      // Update denormalised counter
      if (targetType === 'post') {
        await client.query(
          `UPDATE public.hub_posts SET like_count = like_count + $1 WHERE id = $2`,
          [liked ? 1 : -1, targetId],
        )
      } else if (targetType === 'comment') {
        await client.query(
          `UPDATE public.hub_comments SET like_count = like_count + $1 WHERE id = $2`,
          [liked ? 1 : -1, targetId],
        )
      }
    })

    // Return updated count
    let count = 0
    if (targetType === 'post') {
      const { rows } = await query(`SELECT like_count AS c FROM public.hub_posts WHERE id=$1`, [targetId])
      count = rows[0]?.c ?? 0
    } else if (targetType === 'comment') {
      const { rows } = await query(`SELECT like_count AS c FROM public.hub_comments WHERE id=$1`, [targetId])
      count = rows[0]?.c ?? 0
    }

    return NextResponse.json({ data: { liked, count }, error: null })
  } catch (err) {
    console.error('[POST /api/hub/likes]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
