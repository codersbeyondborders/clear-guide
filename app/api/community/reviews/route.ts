import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'

// GET /api/community/reviews?manualId=<uuid>
export async function GET(req: NextRequest) {
  const manualId = req.nextUrl.searchParams.get('manualId')
  if (!manualId) {
    return NextResponse.json({ data: null, error: 'manualId is required' }, { status: 400 })
  }

  try {
    const { rows } = await query(
      `SELECT
        r.id, r.manual_id AS "manualId", r.user_id AS "userId",
        r.rating, r.title, r.body, r.helpful_count AS "helpfulCount",
        r.created_at AS "createdAt", r.updated_at AS "updatedAt",
        u.name AS "authorName", u.image AS "authorImage"
      FROM public.product_reviews r
      LEFT JOIN public."user" u ON u.id = r.user_id
      WHERE r.manual_id = $1
      ORDER BY r.created_at DESC`,
      [manualId],
    )

    const data = rows.map(r => ({
      id: r.id,
      manualId: r.manualId,
      userId: r.userId,
      rating: r.rating,
      title: r.title,
      body: r.body,
      helpfulCount: r.helpfulCount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: { name: r.authorName ?? 'Anonymous', image: r.authorImage ?? null },
    }))

    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[GET /api/community/reviews]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/community/reviews
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  let body: { manualId?: string; rating?: number; title?: string | null; body?: string }
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const { manualId, rating, title, body: reviewBody } = body
  if (!manualId || !rating || !reviewBody?.trim()) {
    return NextResponse.json({ data: null, error: 'manualId, rating, and body are required' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ data: null, error: 'rating must be between 1 and 5' }, { status: 400 })
  }

  try {
    const { rows } = await query(
      `INSERT INTO public.product_reviews (manual_id, user_id, rating, title, body)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (manual_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating, title = EXCLUDED.title, body = EXCLUDED.body, updated_at = now()
       RETURNING id, manual_id AS "manualId", rating, title, body, helpful_count AS "helpfulCount", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [manualId, user.id, rating, title ?? null, reviewBody.trim()],
    )
    return NextResponse.json({ data: rows[0], error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/community/reviews]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
