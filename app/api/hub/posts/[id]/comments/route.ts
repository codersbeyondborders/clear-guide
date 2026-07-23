import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth, getOptionalUser } from '@/lib/community-auth'

// GET /api/hub/posts/[id]/comments
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params
  const viewer = await getOptionalUser(req)

  try {
    const { rows } = await query(
      `SELECT
        c.id, c.post_id AS "postId", c.parent_id AS "parentId",
        c.user_id AS "userId", c.body, c.media,
        c.like_count AS "likeCount", c.created_at AS "createdAt",
        u.id AS "authorId", COALESCE(u.display_name, u.name) AS "authorName",
        u.username AS "authorUsername", u.avatar_url AS "authorAvatarUrl"
        ${viewer ? `, EXISTS(SELECT 1 FROM public.hub_likes l WHERE l.target_type='comment' AND l.target_id=c.id AND l.user_id='${viewer.id}') AS "isLiked"` : ', false AS "isLiked"'}
       FROM public.hub_comments c
       LEFT JOIN public."user" u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId],
    )

    const byId = new Map<string, ReturnType<typeof mapRow>>()
    const top: ReturnType<typeof mapRow>[] = []

    function mapRow(r: typeof rows[0]) {
      return {
        id: r.id, postId: r.postId, parentId: r.parentId, userId: r.userId,
        body: r.body, media: r.media ?? [], likeCount: r.likeCount,
        createdAt: r.createdAt, updatedAt: r.createdAt,
        author: { id: r.authorId, name: r.authorName ?? 'Anonymous', username: r.authorUsername ?? null, avatarUrl: r.authorAvatarUrl ?? null },
        isLiked: r.isLiked ?? false,
        replies: [] as ReturnType<typeof mapRow>[],
      }
    }

    for (const r of rows) {
      byId.set(r.id, mapRow(r))
    }
    for (const c of byId.values()) {
      if (c.parentId) byId.get(c.parentId)?.replies.push(c)
      else top.push(c)
    }

    return NextResponse.json({ data: top, error: null })
  } catch (err) {
    console.error('[GET /api/hub/posts/[id]/comments]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hub/posts/[id]/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  let body: { body?: string; parentId?: string; media?: unknown[] }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const { body: commentBody, parentId, media = [] } = body
  if (!commentBody?.trim()) return NextResponse.json({ data: null, error: 'Comment body is required' }, { status: 400 })
  if (commentBody.trim().length > 2000) return NextResponse.json({ data: null, error: 'Comment too long (max 2000 chars)' }, { status: 400 })

  try {
    let newComment: Record<string, unknown>
    await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO public.hub_comments (post_id, parent_id, user_id, body, media)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, post_id AS "postId", parent_id AS "parentId", user_id AS "userId",
                   body, media, like_count AS "likeCount", created_at AS "createdAt"`,
        [postId, parentId ?? null, user.id, commentBody.trim(), JSON.stringify(media)],
      )
      newComment = rows[0]
      await client.query(
        `UPDATE public.hub_posts SET comment_count = comment_count + 1 WHERE id = $1`,
        [postId],
      )
    })

    const { rows: uRows } = await query(
      `SELECT id, COALESCE(display_name, name) AS name, username, avatar_url AS "avatarUrl" FROM public."user" WHERE id = $1`,
      [user.id],
    )
    const author = uRows[0] ? { id: uRows[0].id, name: uRows[0].name, username: uRows[0].username, avatarUrl: uRows[0].avatarUrl } : { id: user.id, name: 'Anonymous', username: null, avatarUrl: null }

    return NextResponse.json({ data: { ...newComment!, author, isLiked: false, replies: [] }, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/hub/posts/[id]/comments]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
