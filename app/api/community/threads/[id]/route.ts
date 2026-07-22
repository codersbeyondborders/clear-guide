import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/community/threads/[id]  — thread + replies
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const [threadResult, repliesResult] = await Promise.all([
      query(
        `SELECT
          t.id, t.manual_id AS "manualId", t.user_id AS "userId",
          t.title, t.body, t.is_pinned AS "isPinned", t.is_solved AS "isSolved",
          t.reply_count AS "replyCount", t.created_at AS "createdAt", t.updated_at AS "updatedAt",
          u.name AS "authorName", u.image AS "authorImage",
          m.product_name AS "manualName", m.brand AS "productBrand"
        FROM public.forum_threads t
        LEFT JOIN public."user" u ON u.id = t.user_id
        LEFT JOIN public.manuals m ON m.id = t.manual_id
        WHERE t.id = $1`,
        [id],
      ),
      query(
        `SELECT
          r.id, r.thread_id AS "threadId", r.user_id AS "userId",
          r.body, r.is_solution AS "isSolution",
          r.created_at AS "createdAt", r.updated_at AS "updatedAt",
          u.name AS "authorName", u.image AS "authorImage"
        FROM public.forum_replies r
        LEFT JOIN public."user" u ON u.id = r.user_id
        WHERE r.thread_id = $1
        ORDER BY r.created_at ASC`,
        [id],
      ),
    ])

    if (threadResult.rows.length === 0) {
      return NextResponse.json({ data: null, error: 'Thread not found' }, { status: 404 })
    }

    const t = threadResult.rows[0]
    const thread = {
      id: t.id,
      manualId: t.manualId,
      userId: t.userId,
      title: t.title,
      body: t.body,
      isPinned: t.isPinned,
      isSolved: t.isSolved,
      replyCount: t.replyCount,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      author: { name: t.authorName ?? 'Anonymous', image: t.authorImage ?? null },
      manualName: t.manualName ?? null,
      productBrand: t.productBrand ?? null,
    }

    const replies = repliesResult.rows.map(r => ({
      id: r.id,
      threadId: r.threadId,
      userId: r.userId,
      body: r.body,
      isSolution: r.isSolution,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: { name: r.authorName ?? 'Anonymous', image: r.authorImage ?? null },
    }))

    return NextResponse.json({ data: { thread, replies }, error: null })
  } catch (err) {
    console.error('[GET /api/community/threads/[id]]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
