import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// GET /api/community/threads?manualId=<uuid>  (optional manualId → global feed)
export async function GET(req: NextRequest) {
  const manualId = req.nextUrl.searchParams.get('manualId')

  try {
    const { rows } = manualId
      ? await query(
          `SELECT
            t.id, t.manual_id AS "manualId", t.user_id AS "userId",
            t.title, t.body, t.is_pinned AS "isPinned", t.is_solved AS "isSolved",
            t.reply_count AS "replyCount", t.created_at AS "createdAt", t.updated_at AS "updatedAt",
            u.name AS "authorName", u.image AS "authorImage"
          FROM public.forum_threads t
          LEFT JOIN public."user" u ON u.id = t.user_id
          WHERE t.manual_id = $1
          ORDER BY t.is_pinned DESC, t.updated_at DESC`,
          [manualId],
        )
      : await query(
          `SELECT
            t.id, t.manual_id AS "manualId", t.user_id AS "userId",
            t.title, t.body, t.is_pinned AS "isPinned", t.is_solved AS "isSolved",
            t.reply_count AS "replyCount", t.created_at AS "createdAt", t.updated_at AS "updatedAt",
            u.name AS "authorName", u.image AS "authorImage",
            m.product_name AS "manualName", m.brand AS "productBrand"
          FROM public.forum_threads t
          LEFT JOIN public."user" u ON u.id = t.user_id
          LEFT JOIN public.manuals m ON m.id = t.manual_id
          ORDER BY t.updated_at DESC
          LIMIT 50`,
        )

    const data = rows.map(r => ({
      id: r.id,
      manualId: r.manualId,
      userId: r.userId,
      title: r.title,
      body: r.body,
      isPinned: r.isPinned,
      isSolved: r.isSolved,
      replyCount: r.replyCount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: { name: r.authorName ?? 'Anonymous', image: r.authorImage ?? null },
      manualName: r.manualName ?? undefined,
      productBrand: r.productBrand ?? undefined,
    }))

    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[GET /api/community/threads]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/community/threads
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  let body: { manualId?: string; title?: string; body?: string }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const { manualId, title, body: threadBody } = body
  if (!manualId || !title?.trim() || !threadBody?.trim()) {
    return NextResponse.json({ data: null, error: 'manualId, title, and body are required' }, { status: 400 })
  }

  try {
    const { rows } = await query(
      `INSERT INTO public.forum_threads (manual_id, user_id, title, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, manual_id AS "manualId", title, body, is_pinned AS "isPinned", is_solved AS "isSolved",
                 reply_count AS "replyCount", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [manualId, user.id, title.trim(), threadBody.trim()],
    )
    return NextResponse.json({ data: rows[0], error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/community/threads]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
