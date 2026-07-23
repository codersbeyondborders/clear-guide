import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOptionalUser, requireAuth } from '@/lib/community-auth'

// GET /api/hub/posts/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const viewer = await getOptionalUser(req)

  try {
    const { rows } = await query(
      `SELECT
        p.id, p.user_id AS "userId", p.manual_id AS "manualId",
        p.body, p.media, p.link_url AS "linkUrl", p.link_meta AS "linkMeta",
        p.like_count AS "likeCount", p.comment_count AS "commentCount",
        p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        u.id AS "authorId", COALESCE(u.display_name, u.name) AS "authorName",
        u.username AS "authorUsername", u.avatar_url AS "authorAvatarUrl",
        m.product_name AS "productName", m.brand AS "productBrand"
        ${viewer ? `, EXISTS(SELECT 1 FROM public.hub_likes l WHERE l.target_type='post' AND l.target_id=p.id AND l.user_id='${viewer.id}') AS "isLiked"` : ', false AS "isLiked"'}
        ${viewer ? `, EXISTS(SELECT 1 FROM public.hub_bookmarks b WHERE b.post_id=p.id AND b.user_id='${viewer.id}') AS "isBookmarked"` : ', false AS "isBookmarked"'}
       FROM public.hub_posts p
       LEFT JOIN public."user" u ON u.id = p.user_id
       LEFT JOIN public.manuals m ON m.id = p.manual_id
       WHERE p.id = $1`,
      [id],
    )

    if (!rows.length) return NextResponse.json({ data: null, error: 'Post not found' }, { status: 404 })
    const r = rows[0]
    return NextResponse.json({
      data: {
        ...r,
        media: r.media ?? [],
        author: { id: r.authorId, name: r.authorName ?? 'Anonymous', username: r.authorUsername, avatarUrl: r.authorAvatarUrl },
      },
      error: null,
    })
  } catch (err) {
    console.error('[GET /api/hub/posts/[id]]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/hub/posts/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  try {
    const { rows } = await query(`SELECT user_id FROM public.hub_posts WHERE id=$1`, [id])
    if (!rows.length) return NextResponse.json({ data: null, error: 'Post not found' }, { status: 404 })
    if (rows[0].user_id !== user.id) return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    await query(`DELETE FROM public.hub_posts WHERE id=$1`, [id])
    return NextResponse.json({ data: { deleted: true }, error: null })
  } catch (err) {
    console.error('[DELETE /api/hub/posts/[id]]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
