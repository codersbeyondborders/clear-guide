import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, getOptionalUser } from '@/lib/community-auth'

// GET /api/hub/posts?filter=all|following&cursor=<iso>&limit=20&manualId=<uuid>
export async function GET(req: NextRequest) {
  const sp       = req.nextUrl.searchParams
  const filter   = sp.get('filter') ?? 'all'
  const cursor   = sp.get('cursor')            // ISO timestamp for keyset pagination
  const limit    = Math.min(parseInt(sp.get('limit') ?? '20', 10), 50)
  const manualId = sp.get('manualId')

  const viewer = await getOptionalUser(req)

  try {
    const params: unknown[] = [limit]
    let whereClause = 'WHERE 1=1'

    if (cursor) {
      params.push(cursor)
      whereClause += ` AND p.created_at < $${params.length}`
    }

    if (manualId) {
      params.push(manualId)
      whereClause += ` AND p.manual_id = $${params.length}`
    }

    if (filter === 'following' && viewer) {
      params.push(viewer.id)
      whereClause += ` AND p.user_id IN (
        SELECT following_id FROM public.hub_follows WHERE follower_id = $${params.length}
      )`
    }

    const viewerLikeJoin = viewer
      ? `LEFT JOIN public.hub_likes vl
           ON vl.target_type = 'post' AND vl.target_id = p.id AND vl.user_id = '${viewer.id}'`
      : ''
    const viewerBookmarkJoin = viewer
      ? `LEFT JOIN public.hub_bookmarks vb ON vb.post_id = p.id AND vb.user_id = '${viewer.id}'`
      : ''

    const { rows } = await query(
      `SELECT
        p.id, p.user_id AS "userId", p.manual_id AS "manualId",
        p.body, p.media, p.link_url AS "linkUrl", p.link_meta AS "linkMeta",
        p.like_count AS "likeCount", p.comment_count AS "commentCount",
        p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        u.id AS "authorId", COALESCE(u.display_name, u.name) AS "authorName",
        u.username AS "authorUsername", u.avatar_url AS "authorAvatarUrl",
        m.product_name AS "productName", m.brand AS "productBrand"
        ${viewer ? ', vl.id IS NOT NULL AS "isLiked", vb.post_id IS NOT NULL AS "isBookmarked"' : ', false AS "isLiked", false AS "isBookmarked"'}
       FROM public.hub_posts p
       LEFT JOIN public."user" u ON u.id = p.user_id
       LEFT JOIN public.manuals m ON m.id = p.manual_id
       ${viewerLikeJoin}
       ${viewerBookmarkJoin}
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $1`,
      params,
    )

    const data = rows.map(r => ({
      id: r.id,
      userId: r.userId,
      manualId: r.manualId,
      body: r.body,
      media: r.media ?? [],
      linkUrl: r.linkUrl,
      linkMeta: r.linkMeta,
      likeCount: r.likeCount,
      commentCount: r.commentCount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: { id: r.authorId, name: r.authorName ?? 'Anonymous', username: r.authorUsername ?? null, avatarUrl: r.authorAvatarUrl ?? null },
      productName: r.productName ?? null,
      productBrand: r.productBrand ?? null,
      isLiked: r.isLiked ?? false,
      isBookmarked: r.isBookmarked ?? false,
    }))

    const nextCursor = data.length === limit ? data[data.length - 1].createdAt : null
    return NextResponse.json({ data, nextCursor, error: null })
  } catch (err) {
    console.error('[GET /api/hub/posts]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hub/posts
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  let body: { body?: string; manualId?: string; media?: unknown[]; linkUrl?: string; linkMeta?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const { body: postBody, manualId, media = [], linkUrl, linkMeta } = body
  if (!postBody?.trim() && (!media || media.length === 0) && !linkUrl) {
    return NextResponse.json({ data: null, error: 'Post must have text, media, or a link' }, { status: 400 })
  }
  if (postBody && postBody.trim().length > 4000) {
    return NextResponse.json({ data: null, error: 'Post body too long (max 4000 chars)' }, { status: 400 })
  }

  try {
    const { rows } = await query(
      `INSERT INTO public.hub_posts (user_id, manual_id, body, media, link_url, link_meta)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id AS "userId", manual_id AS "manualId", body, media,
                 link_url AS "linkUrl", link_meta AS "linkMeta",
                 like_count AS "likeCount", comment_count AS "commentCount",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [user.id, manualId ?? null, postBody?.trim() ?? '', JSON.stringify(media), linkUrl ?? null, linkMeta ? JSON.stringify(linkMeta) : null],
    )

    // fetch author
    const { rows: uRows } = await query(
      `SELECT id, COALESCE(display_name, name) AS name, username, avatar_url AS "avatarUrl" FROM public."user" WHERE id = $1`,
      [user.id],
    )
    const author = uRows[0] ? { id: uRows[0].id, name: uRows[0].name, username: uRows[0].username, avatarUrl: uRows[0].avatarUrl } : { id: user.id, name: 'Anonymous', username: null, avatarUrl: null }

    return NextResponse.json({ data: { ...rows[0], author, isLiked: false, isBookmarked: false }, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/hub/posts]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
