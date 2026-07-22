import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/community/top-rated — manuals sorted by avg review rating
export async function GET(_req: NextRequest) {
  try {
    const { rows } = await query(
      `SELECT
        m.id, m.product_name AS "productName", m.product_model AS "productModel",
        m.brand, m.cover_image AS "coverImage", m.description,
        ROUND(AVG(r.rating)::numeric, 1) AS "avgRating",
        COUNT(r.id)::int AS "reviewCount"
      FROM public.manuals m
      INNER JOIN public.product_reviews r ON r.manual_id = m.id
      WHERE m.status = 'published' AND m.deleted_at IS NULL
      GROUP BY m.id, m.product_name, m.product_model, m.brand, m.cover_image, m.description
      HAVING COUNT(r.id) >= 1
      ORDER BY "avgRating" DESC, "reviewCount" DESC
      LIMIT 20`,
    )

    return NextResponse.json({ data: rows, error: null })
  } catch (err) {
    console.error('[GET /api/community/top-rated]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
