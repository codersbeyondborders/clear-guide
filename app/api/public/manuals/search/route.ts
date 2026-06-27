import { NextResponse } from 'next/server'
import { readQuery } from '@/lib/db'

/**
 * GET /api/public/manuals/search
 *
 * Searches published manuals by brand, model, and optionally serial number.
 * Used by ManualSearchForm on the user portal (/user) — no auth required.
 *
 * Query params:
 *   brand   (required) — manufacturer / make
 *   model   (required) — product model name
 *   serial  (optional) — serial number for a more exact match
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const brand  = searchParams.get('brand')?.trim() ?? ''
  const model  = searchParams.get('model')?.trim() ?? ''
  const serial = searchParams.get('serial')?.trim() ?? ''

  if (!brand || !model) {
    return NextResponse.json(
      { error: 'brand and model are required.' },
      { status: 400 },
    )
  }

  try {
    // Fuzzy match: ILIKE allows partial brand/model text. Serial is exact when provided.
    const result = await readQuery(
      `SELECT
         id,
         product_name   AS "productName",
         product_model  AS "productModel",
         brand,
         serial_number  AS "serialNumber",
         description,
         cover_image    AS "coverImage"
       FROM manuals
       WHERE status = 'published'
         AND deleted_at IS NULL
         AND brand ILIKE $1
         AND product_model ILIKE $2
         ${serial ? 'AND (serial_number = $3 OR serial_number IS NULL)' : ''}
       ORDER BY
         -- Exact matches bubble up first
         (LOWER(brand) = LOWER($1))::int DESC,
         (LOWER(product_model) = LOWER($2))::int DESC,
         updated_at DESC
       LIMIT 10`,
      serial ? [
        `%${brand}%`,
        `%${model}%`,
        serial,
      ] : [
        `%${brand}%`,
        `%${model}%`,
      ],
    )

    return NextResponse.json({ results: result.rows })
  } catch (err) {
    console.error('[public] GET /api/public/manuals/search error:', err)
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}
