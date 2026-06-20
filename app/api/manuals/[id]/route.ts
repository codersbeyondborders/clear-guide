import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { query, withTransaction } from '@/lib/db'
import { UpdateManualSchema, parseOrError } from '@/lib/validation'
import { sanitizeManualInput } from '@/lib/sanitize'

// ---------------------------------------------------------------------------
// GET /api/manuals/:id
// ---------------------------------------------------------------------------
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const manualResult = await query(
      `SELECT id, product_name AS "productName", product_model AS "productModel",
              brand, serial_number AS "serialNumber", status, languages,
              cover_image AS "coverImage", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM manuals
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, user.id],
    )
    if (!manualResult.rows[0]) return NextResponse.json({ error: 'Manual not found' }, { status: 404 })

    const sectionsResult = await query(
      `SELECT id, section_number AS "sectionNumber", title, content,
              image_urls AS "imageUrls", video_urls AS "videoUrls"
       FROM manual_sections
       WHERE manual_id = $1
       ORDER BY section_number ASC`,
      [id],
    )

    return NextResponse.json({ ...manualResult.rows[0], sections: sectionsResult.rows })
  } catch (err) {
    console.error('[v0] GET /api/manuals/[id] error:', err)
    return NextResponse.json({ error: 'Failed to fetch manual' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PUT /api/manuals/:id
// ---------------------------------------------------------------------------
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = parseOrError(UpdateManualSchema, body)
    if (!parsed.success) return parsed.response

    const sanitized = sanitizeManualInput({
      productName: parsed.data.productName ?? '',
      productModel: parsed.data.productModel ?? '',
      brand: parsed.data.brand ?? '',
      serialNumber: parsed.data.serialNumber,
      sections: parsed.data.sections,
    })

    const { languages, status } = parsed.data
    const { productName, productModel, brand, serialNumber, sections } = sanitized

    await withTransaction(async (client) => {
      // Update manual
      await client.query(
        `UPDATE manuals SET
           product_name = COALESCE($1, product_name),
           product_model = COALESCE($2, product_model),
           brand = COALESCE($3, brand),
           serial_number = $4,
           languages = COALESCE($5, languages),
           status = COALESCE($6, status),
           updated_at = NOW()
         WHERE id = $7 AND user_id = $8 AND deleted_at IS NULL`,
        [productName, productModel, brand, serialNumber ?? null, languages, status, id, user.id],
      )

      // Replace sections if provided
      if (Array.isArray(sections)) {
        await client.query('DELETE FROM manual_sections WHERE manual_id = $1', [id])
        for (let i = 0; i < sections.length; i++) {
          const s = sections[i]
          await client.query(
            `INSERT INTO manual_sections (manual_id, section_number, title, content, image_urls, video_urls)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, i + 1, s.title, s.content ?? '', s.imageUrls ?? [], s.videoUrls ?? []],
          )
        }
      }
    })

    return NextResponse.json({ id, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[v0] PUT /api/manuals/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update manual' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/manuals/:id  (soft delete)
// ---------------------------------------------------------------------------
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await query(
      `UPDATE manuals SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, user.id],
    )

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[v0] DELETE /api/manuals/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete manual' }, { status: 500 })
  }
}
