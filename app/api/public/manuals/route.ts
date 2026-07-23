import { NextResponse } from 'next/server'
import { readQuery } from '@/lib/db'

/**
 * GET /api/public/manuals
 *
 * Public (no auth) listing for the Products Forum. Returns every manual that is
 * BOTH published and flagged public (is_public = true). Supports free-text
 * search, a brand filter, and sorting. Includes community aggregate stats
 * (avg rating, review count, thread count) for each product.
 *
 * Query params:
 *   q      (optional) — free text matched against product name, brand, model
 *   brand  (optional) — exact brand filter
 *   sort   (optional) — 'recent' (default) | 'top-rated' | 'discussed' | 'name'
 *   limit  (optional) — max rows, default 60, capped at 100
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q     = searchParams.get('q')?.trim() ?? ''
  const brand = searchParams.get('brand')?.trim() ?? ''
  const sort  = searchParams.get('sort')?.trim() ?? 'recent'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '60', 10) || 60, 100)

  const orderBy =
    sort === 'top-rated' ? `"avgRating" DESC NULLS LAST, "reviewCount" DESC`
    : sort === 'discussed' ? `"threadCount" DESC, m.updated_at DESC`
    : sort === 'name'      ? `m.product_name ASC`
    : `m.updated_at DESC`

  try {
    const params: unknown[] = []
    const conditions: string[] = [
      `m.status = 'published'`,
      `m.is_public = true`,
      `m.deleted_at IS NULL`,
    ]

    if (q) {
      params.push(`%${q}%`)
      const p = `$${params.length}`
      conditions.push(`(m.product_name ILIKE ${p} OR m.brand ILIKE ${p} OR m.product_model ILIKE ${p})`)
    }

    if (brand) {
      params.push(brand)
      conditions.push(`m.brand = $${params.length}`)
    }

    params.push(limit)
    const limitParam = `$${params.length}`

    const { rows } = await readQuery(
      `SELECT
         m.id,
         m.product_name   AS "productName",
         m.product_model  AS "productModel",
         m.brand,
         m.description,
         m.cover_image    AS "coverImage",
         m.languages,
         m.created_at     AS "createdAt",
         m.updated_at     AS "updatedAt",
         COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)::float AS "avgRating",
         COUNT(DISTINCT r.id)::int                            AS "reviewCount",
         COUNT(DISTINCT t.id)::int                            AS "threadCount"
       FROM manuals m
       LEFT JOIN public.product_reviews r ON r.manual_id = m.id
       LEFT JOIN public.forum_threads   t ON t.manual_id = m.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY m.id
       ORDER BY ${orderBy}
       LIMIT ${limitParam}`,
      params,
    )

    // Distinct brand list for the filter dropdown (public + published only)
    const { rows: brandRows } = await readQuery(
      `SELECT DISTINCT brand
       FROM manuals
       WHERE status = 'published' AND is_public = true AND deleted_at IS NULL
         AND brand IS NOT NULL AND brand <> ''
       ORDER BY brand ASC`,
    )

    return NextResponse.json(
      { data: rows, brands: brandRows.map(b => b.brand), error: null },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
    )
  } catch (err) {
    console.error('[public] GET /api/public/manuals error:', err)
    return NextResponse.json({ data: null, brands: [], error: 'Failed to load products.' }, { status: 500 })
  }
}
