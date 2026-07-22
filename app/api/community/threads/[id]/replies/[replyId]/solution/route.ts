import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// PATCH /api/community/threads/[id]/replies/[replyId]/solution
// Only the thread owner may mark a reply as solution.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> },
) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const { id: threadId, replyId } = await params

  try {
    // Verify the requesting user owns the thread
    const { rows: [thread] } = await query(
      `SELECT user_id AS "userId" FROM public.forum_threads WHERE id = $1`,
      [threadId],
    )
    if (!thread) return NextResponse.json({ data: null, error: 'Thread not found' }, { status: 404 })
    if (thread.userId !== user.id) {
      return NextResponse.json({ data: null, error: 'Forbidden — only the thread author can mark a solution' }, { status: 403 })
    }

    await withTransaction(async (client) => {
      // Clear any existing solution on this thread
      await client.query(
        `UPDATE public.forum_replies SET is_solution = false WHERE thread_id = $1`,
        [threadId],
      )
      // Mark the chosen reply
      await client.query(
        `UPDATE public.forum_replies SET is_solution = true WHERE id = $1 AND thread_id = $2`,
        [replyId, threadId],
      )
      // Mark thread as solved
      await client.query(
        `UPDATE public.forum_threads SET is_solved = true, updated_at = now() WHERE id = $1`,
        [threadId],
      )
    })

    return NextResponse.json({ data: { replyId, threadId, isSolved: true }, error: null })
  } catch (err) {
    console.error('[PATCH solution]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
