import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// POST /api/community/threads/[id]/replies
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const { id: threadId } = await params

  let body: { body?: string }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.body?.trim()) {
    return NextResponse.json({ data: null, error: 'Reply body is required' }, { status: 400 })
  }

  try {
    const result = await withTransaction(async (client) => {
      const { rows: [reply] } = await client.query(
        `INSERT INTO public.forum_replies (thread_id, user_id, body)
         VALUES ($1, $2, $3)
         RETURNING id, thread_id AS "threadId", user_id AS "userId", body, is_solution AS "isSolution",
                   created_at AS "createdAt", updated_at AS "updatedAt"`,
        [threadId, user.id, body.body!.trim()],
      )
      await client.query(
        `UPDATE public.forum_threads SET reply_count = reply_count + 1, updated_at = now() WHERE id = $1`,
        [threadId],
      )
      return reply
    })
    return NextResponse.json({ data: result, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/community/threads/[id]/replies]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
