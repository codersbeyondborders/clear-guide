import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import type { ManualListItem } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock data — used when DB env vars are not configured
// ---------------------------------------------------------------------------
const MOCK_MANUALS: ManualListItem[] = [
  {
    id: 'demo-qr-123',
    productName: 'Smart Coffee Maker X1',
    productModel: 'CX-1000',
    brand: 'BrewTech',
    status: 'published',
    languages: ['en', 'fr', 'de'],
    coverImage: null,
    sectionCount: 3,
    createdAt: new Date(Date.now() - 86_400_000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-qr-456',
    productName: 'Smart Toaster Pro',
    productModel: 'TP-200',
    brand: 'BrewTech',
    status: 'draft',
    languages: ['en'],
    coverImage: null,
    sectionCount: 2,
    createdAt: new Date(Date.now() - 86_400_000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
  },
  {
    id: 'demo-qr-789',
    productName: 'SonicBuds Wireless Earbuds',
    productModel: 'SB-Pro',
    brand: 'AudioSync',
    status: 'published',
    languages: ['en', 'es', 'ja', 'ko'],
    coverImage: null,
    sectionCount: 3,
    createdAt: new Date(Date.now() - 86_400_000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86_400_000 * 5).toISOString(),
  },
]

const DB_READY = !!(process.env.PGHOST && process.env.AWS_ROLE_ARN)

// ---------------------------------------------------------------------------
// GET /api/manuals
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  if (!DB_READY) {
    return NextResponse.json(MOCK_MANUALS)
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const baseSQL = `
      SELECT
        m.id, m.product_name AS "productName", m.product_model AS "productModel",
        m.brand, m.status, m.languages, m.thumbnail_url AS "coverImage",
        m.created_at AS "createdAt", m.updated_at AS "updatedAt",
        COUNT(s.id)::int AS "sectionCount"
      FROM manuals m
      LEFT JOIN manual_sections s ON s.manual_id = m.id
      WHERE m."userId" = $1
        AND m.deleted_at IS NULL
        ${status && status !== 'all' ? 'AND m.status = $2' : ''}
      GROUP BY m.id
      ORDER BY m.updated_at DESC
      LIMIT 100
    `

    const params = status && status !== 'all'
      ? [session.user.id, status]
      : [session.user.id]

    const result = await query(baseSQL, params)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[v0] GET /api/manuals error:', err)
    return NextResponse.json({ error: 'Failed to fetch manuals' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/manuals
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  if (!DB_READY) {
    const body = await request.json()
    const newManual: ManualListItem = {
      id: `manual-${Date.now()}`,
      productName: body.productName ?? 'New Manual',
      productModel: body.productModel ?? null,
      brand: body.brand ?? null,
      status: 'draft',
      languages: body.languages ?? ['en'],
      coverImage: null,
      sectionCount: body.sections?.length ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return NextResponse.json(newManual, { status: 201 })
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productName, productModel, brand, serialNumber, languages, status, uploadMethod, originalFileUrl } = body

    if (!productName || !productModel || !brand) {
      return NextResponse.json({ error: 'productName, productModel, and brand are required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO manuals
         ("userId", product_name, product_model, brand, serial_number, status, languages, upload_method, original_file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, product_name AS "productName", product_model AS "productModel",
         brand, status, languages, thumbnail_url AS "coverImage",
         created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        session.user.id,
        productName,
        productModel,
        brand,
        serialNumber ?? null,
        status ?? 'draft',
        languages ?? ['en'],
        uploadMethod ?? null,
        originalFileUrl ?? null,
      ],
    )

    return NextResponse.json({ ...result.rows[0], sectionCount: 0 }, { status: 201 })
  } catch (err) {
    console.error('[v0] POST /api/manuals error:', err)
    return NextResponse.json({ error: 'Failed to create manual' }, { status: 500 })
  }
}
