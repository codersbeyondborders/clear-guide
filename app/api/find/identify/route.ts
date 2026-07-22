import { type NextRequest, NextResponse } from 'next/server'
import { readQuery } from '@/lib/db'
import { identifyDeviceFromImage, mimeToImageFormat } from '@/lib/vision'
import { buildWebLinks, type DeviceSpecs } from '@/lib/web-links'

/**
 * POST /api/find/identify
 * Body: { pathname: string, contentType: string }
 *
 * 1. Reads the private device photo from Blob.
 * 2. Uses Nova Lite (vision) to extract structured specs.
 * 3. Searches the manuals table for a match.
 *    - Match found      -> { validated: true,  specs, manuals }
 *    - No match found   -> { validated: false, specs, community, tips, webLinks }
 *
 * Open access — no auth required (finding is available to guests).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string; contentType?: string }
    const url = body.url?.trim()
    const contentType = body.contentType?.trim() ?? 'image/jpeg'

    if (!url) {
      return NextResponse.json({ error: 'Missing image reference.' }, { status: 400 })
    }

    const format = mimeToImageFormat(contentType)
    if (!format) {
      return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 })
    }

    // 1. Read the image bytes from the (public) Blob URL.
    const imgRes = await fetch(url)
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Image not found.' }, { status: 404 })
    }
    const arrayBuffer = await imgRes.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // 2. Vision identification.
    const vision = await identifyDeviceFromImage(bytes, format)
    const specs: DeviceSpecs = vision.specs

    // 3. Search manuals when we have something to search for.
    let manuals: unknown[] = []
    const brand = specs.brand ?? ''
    const model = specs.model ?? ''
    const type = specs.productType ?? ''

    if (vision.confident && (brand || model || type)) {
      const search = await readQuery(
        `SELECT
           id,
           product_name  AS "productName",
           product_model AS "productModel",
           brand,
           description,
           cover_image   AS "coverImage"
         FROM manuals
         WHERE status = 'published'
           AND deleted_at IS NULL
           AND (
             ($1 <> '' AND brand ILIKE '%' || $1 || '%')
             OR ($2 <> '' AND product_model ILIKE '%' || $2 || '%')
             OR ($2 <> '' AND product_name ILIKE '%' || $2 || '%')
             OR ($3 <> '' AND product_name ILIKE '%' || $3 || '%')
           )
         ORDER BY
           (LOWER(brand) = LOWER($1))::int DESC,
           (LOWER(product_model) = LOWER($2))::int DESC,
           updated_at DESC
         LIMIT 10`,
        [brand, model, type],
      )
      manuals = search.rows
    }

    // VALIDATED FLOW — in-system match found.
    if (manuals.length > 0) {
      return NextResponse.json({ validated: true, specs, description: vision.description, manuals })
    }

    // NON-VALIDATED / OPEN-SOURCE FLOW.
    // Community results from forums + reviews.
    let community: { threads: unknown[]; reviews: unknown[] } = { threads: [], reviews: [] }

    if (brand || model || type) {
      const term = [brand, model, type].filter(Boolean).join(' ')
      const [threads, reviews] = await Promise.all([
        readQuery(
          `SELECT
             t.id,
             t.manual_id   AS "manualId",
             t.title,
             t.body,
             t.is_solved   AS "isSolved",
             t.reply_count AS "replyCount",
             t.created_at  AS "createdAt",
             m.product_name AS "manualName",
             m.brand        AS "productBrand"
           FROM forum_threads t
           JOIN manuals m ON m.id = t.manual_id
           WHERE t.title ILIKE '%' || $1 || '%'
              OR t.body  ILIKE '%' || $1 || '%'
              OR m.brand ILIKE '%' || $2 || '%'
           ORDER BY t.reply_count DESC, t.created_at DESC
           LIMIT 5`,
          [term, brand],
        ).catch(() => ({ rows: [] })),
        readQuery(
          `SELECT
             r.id,
             r.manual_id AS "manualId",
             r.rating,
             r.title,
             r.body,
             m.product_name AS "manualName",
             m.brand        AS "productBrand"
           FROM product_reviews r
           JOIN manuals m ON m.id = r.manual_id
           WHERE r.title ILIKE '%' || $1 || '%'
              OR r.body  ILIKE '%' || $1 || '%'
              OR m.brand ILIKE '%' || $2 || '%'
           ORDER BY r.helpful_count DESC, r.created_at DESC
           LIMIT 5`,
          [term, brand],
        ).catch(() => ({ rows: [] })),
      ])
      community = { threads: threads.rows, reviews: reviews.rows }
    }

    const webLinks = buildWebLinks(specs)

    return NextResponse.json({
      validated: false,
      specs,
      description: vision.description,
      tips: vision.tips,
      community,
      webLinks,
    })
  } catch (err) {
    console.error('[find] POST /api/find/identify error:', err)
    return NextResponse.json({ error: 'Identification failed. Please try again.' }, { status: 500 })
  }
}
