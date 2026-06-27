import { NextResponse } from 'next/server'
import { readQuery } from '@/lib/db'

/**
 * GET /api/public/manuals/:id
 *
 * Public (no auth) endpoint used by the product viewer after a QR scan.
 * Returns only published manuals — drafts/archived are not exposed.
 * Also records a view event for analytics (fire-and-forget).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  // Optional session id passed by the client so we can de-dupe analytics
  const sessionId = searchParams.get('sid') ?? crypto.randomUUID()

  try {
    const manualResult = await readQuery(
      `SELECT
         id,
         product_name   AS "productName",
         product_model  AS "productModel",
         brand,
         serial_number  AS "serialNumber",
         description,
         status,
         languages,
         cover_image    AS "coverImage",
         created_at     AS "createdAt",
         updated_at     AS "updatedAt"
       FROM manuals
       WHERE id = $1
         AND status = 'published'
         AND deleted_at IS NULL`,
      [id],
    )

    if (!manualResult.rows[0]) {
      return NextResponse.json({ error: 'Manual not found or not yet published.' }, { status: 404 })
    }

    const sectionsResult = await readQuery(
      `SELECT
         id,
         section_number  AS "sectionNumber",
         title,
         content,
         image_urls      AS "imageUrls",
         video_urls      AS "videoUrls"
       FROM manual_sections
       WHERE manual_id = $1
       ORDER BY section_number ASC`,
      [id],
    )

    // Fire-and-forget analytics insert (non-blocking)
    readQuery(
      `INSERT INTO analytics (manual_id, user_session_id, mode, time_spent_seconds, viewed_at)
       VALUES ($1, $2, 'qr', 0, NOW())
       ON CONFLICT DO NOTHING`,
      [id, sessionId],
    ).catch(() => { /* swallow — analytics must never break the viewer */ })

    return NextResponse.json(
      { ...manualResult.rows[0], sections: sectionsResult.rows },
      {
        headers: {
          // Cache at the CDN for 60 s; revalidate in background
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (err) {
    console.error('[public] GET /api/public/manuals/[id] error:', err)
    return NextResponse.json({ error: 'Failed to load manual.' }, { status: 500 })
  }
}
