import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { query, withTransaction } from '@/lib/db'
import { UpdateManualSchema, parseOrError } from '@/lib/validation'
import { sanitizeManualInput } from '@/lib/sanitize'

// ---------------------------------------------------------------------------
// Mock section data — used when DB is not configured
// ---------------------------------------------------------------------------
const MOCK_SECTIONS: Record<string, {
  id: string; productName: string; productModel: string; brand: string
  serialNumber: string | null; status: string; languages: string[]
  sections: { id: string; sectionNumber: number; title: string; content: string; imageUrls: string[]; videoUrls: string[] }[]
}> = {
  'demo-qr-123': {
    id: 'demo-qr-123', productName: 'Smart Coffee Maker X1', productModel: 'CX-1000',
    brand: 'BrewTech', serialNumber: null, status: 'published', languages: ['en', 'fr', 'de'],
    sections: [
      { id: 's1', sectionNumber: 1, title: 'Getting Started', content: 'Welcome to your new Smart Coffee Maker. Before first use, please wash all removable parts with warm soapy water.', imageUrls: [], videoUrls: [] },
      { id: 's2', sectionNumber: 2, title: 'Brewing Coffee', content: '1. Add coffee grounds to the filter.\n2. Fill the reservoir with fresh water.\n3. Press the Brew button.', imageUrls: [], videoUrls: [] },
      { id: 's3', sectionNumber: 3, title: 'Cleaning & Maintenance', content: 'Descale the machine every 3 months. Wipe the exterior with a damp cloth.', imageUrls: [], videoUrls: [] },
    ],
  },
  'demo-qr-456': {
    id: 'demo-qr-456', productName: 'Smart Toaster Pro', productModel: 'TP-200',
    brand: 'BrewTech', serialNumber: null, status: 'draft', languages: ['en'],
    sections: [
      { id: 't1', sectionNumber: 1, title: 'Initial Setup', content: 'Place the toaster on a flat, heat-resistant surface. Plug it into a grounded outlet.', imageUrls: [], videoUrls: [] },
      { id: 't2', sectionNumber: 2, title: 'Toasting Bread', content: 'Insert bread into the slots. Select your desired browning level using the dial (1-6). Press the lever down to start.', imageUrls: [], videoUrls: [] },
    ],
  },
  'demo-qr-789': {
    id: 'demo-qr-789', productName: 'SonicBuds Wireless Earbuds', productModel: 'SB-Pro',
    brand: 'AudioSync', serialNumber: null, status: 'published', languages: ['en', 'es', 'ja', 'ko'],
    sections: [
      { id: 'e1', sectionNumber: 1, title: 'Pairing with your Device', content: '1. Open the charging case lid.\n2. Go to Bluetooth settings.\n3. Select SonicBuds.', imageUrls: [], videoUrls: [] },
      { id: 'e2', sectionNumber: 2, title: 'Touch Controls', content: 'Single tap: Play/Pause. Double tap right: Next track. Double tap left: Previous track.', imageUrls: [], videoUrls: [] },
      { id: 'e3', sectionNumber: 3, title: 'Charging', content: 'Place the earbuds back into the case. The LED will pulse white while charging.', imageUrls: [], videoUrls: [] },
    ],
  },
}

const DB_READY = !!(process.env.PGHOST && process.env.AWS_ROLE_ARN)

// ---------------------------------------------------------------------------
// GET /api/manuals/:id
// ---------------------------------------------------------------------------
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!DB_READY) {
    const manual = MOCK_SECTIONS[id]
    if (!manual) return NextResponse.json({ error: 'Manual not found' }, { status: 404 })
    return NextResponse.json(manual)
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const manualResult = await query(
      `SELECT id, product_name AS "productName", product_model AS "productModel",
              brand, serial_number AS "serialNumber", status, languages,
              thumbnail_url AS "coverImage", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM manuals
       WHERE id = $1 AND "userId" = $2 AND deleted_at IS NULL`,
      [id, session.user.id],
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

  if (!DB_READY) {
    return NextResponse.json({ ...body, id, updatedAt: new Date().toISOString() })
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
         WHERE id = $7 AND "userId" = $8 AND deleted_at IS NULL`,
        [productName, productModel, brand, serialNumber ?? null, languages, status, id, session.user.id],
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

  if (!DB_READY) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await query(
      `UPDATE manuals SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND "userId" = $2 AND deleted_at IS NULL`,
      [id, session.user.id],
    )

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[v0] DELETE /api/manuals/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete manual' }, { status: 500 })
  }
}
