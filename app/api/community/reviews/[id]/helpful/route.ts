import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// POST /api/community/reviews/[id]/helpful
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  try {
    const { rows } = await query(
      `UPDATE public.product_reviews
       SET helpful_count = helpful_count + 1
       WHERE id = $1
       RETURNING id, helpful_count AS "helpfulCount"`,
      [id],
    )
    if (rows.length === 0) {
      return NextResponse.json({ data: null, error: 'Review not found' }, { status: 404 })
    }
    return NextResponse.json({ data: rows[0], error: null })
  } catch (err) {
    console.error('[POST /api/community/reviews/[id]/helpful]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
