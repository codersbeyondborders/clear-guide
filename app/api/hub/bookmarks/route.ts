import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// GET /api/hub/bookmarks  → list my bookmarks
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  try {
    const { rows } = await query(
      `SELECT
        p.id, p.user_id AS "userId", p.manual_id AS "manualId",
        p.body, p.media, p.link_url AS "linkUrl", p.link_meta AS "linkMeta",
        p.like_count AS "likeCount", p.comment_count AS "commentCount",
        p.created_at AS "createdAt",
        u.id AS "authorId", COALESCE(u.display_name, u.name) AS "authorName",
        u.username AS "authorUsername", u.avatar_url AS "authorAvatarUrl",
        true AS "isLiked", true AS "isBookmarked"
       FROM public.hub_bookmarks b
       JOIN public.hub_posts p ON p.id = b.post_id
       LEFT JOIN public."user" u ON u.id = p.user_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [user.id],
    )

    const data = rows.map(r => ({
      id: r.id, userId: r.userId, manualId: r.manualId, body: r.body,
      media: r.media ?? [], linkUrl: r.linkUrl, linkMeta: r.linkMeta,
      likeCount: r.likeCount, commentCount: r.commentCount, createdAt: r.createdAt,
      author: { id: r.authorId, name: r.authorName ?? 'Anonymous', username: r.authorUsername, avatarUrl: r.authorAvatarUrl },
      isLiked: r.isLiked, isBookmarked: r.isBookmarked,
    }))

    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[GET /api/hub/bookmarks]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hub/bookmarks  { postId }  → toggle bookmark
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  let body: { postId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const { postId } = body
  if (!postId) return NextResponse.json({ data: null, error: 'postId is required' }, { status: 400 })

  try {
    let bookmarked = false
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT 1 FROM public.hub_bookmarks WHERE user_id=$1 AND post_id=$2`,
        [user.id, postId],
      )
      if (rows.length > 0) {
        await client.query(`DELETE FROM public.hub_bookmarks WHERE user_id=$1 AND post_id=$2`, [user.id, postId])
        bookmarked = false
      } else {
        await client.query(`INSERT INTO public.hub_bookmarks (user_id, post_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [user.id, postId])
        bookmarked = true
      }
    })

    return NextResponse.json({ data: { bookmarked }, error: null })
  } catch (err) {
    console.error('[POST /api/hub/bookmarks]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
