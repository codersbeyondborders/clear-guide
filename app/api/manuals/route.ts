import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { query, withTransaction } from '@/lib/db'
import {
  parseManualContent,
  translateContent,
  buildKnowledgeBase,
} from '@/lib/ai'
import { CreateManualSchema, parseOrError } from '@/lib/validation'
import { sanitizeManualInput } from '@/lib/sanitize'
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
    // Keyset pagination: pass ?before=<ISO-timestamp> to page backwards in time
    const before = searchParams.get('before')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    const baseSQL = `
      SELECT
        m.id, m.product_name AS "productName", m.product_model AS "productModel",
        m.brand, m.status, m.languages, m.cover_image AS "coverImage",
        m.created_at AS "createdAt", m.updated_at AS "updatedAt",
        COUNT(s.id)::int AS "sectionCount"
      FROM manuals m
      LEFT JOIN manual_sections s ON s.manual_id = m.id
      WHERE m.user_id = $1
        AND m.deleted_at IS NULL
        ${status && status !== 'all' ? 'AND m.status = $2' : ''}
        ${before ? `AND m.updated_at < ${status && status !== 'all' ? '$3' : '$2'}` : ''}
      GROUP BY m.id
      ORDER BY m.updated_at DESC
      LIMIT ${limit}
    `

    const params: (string | number)[] = [session.user.id]
    if (status && status !== 'all') params.push(status)
    if (before) params.push(before)

    const result = await query(baseSQL, params)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[manuals] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch manuals' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/manuals  — create manual + run AI pipeline
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const body = await request.json()

  if (!DB_READY) {
    // Mock: return a new manual immediately without AI processing
    const newManual: ManualListItem = {
      id: `manual-${Date.now()}`,
      productName: body.productName ?? 'New Manual',
      productModel: body.productModel ?? null,
      brand: body.brand ?? null,
      status: 'published',
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

    const parsed = parseOrError(CreateManualSchema, body)
    if (!parsed.success) return parsed.response

    const sanitized = sanitizeManualInput(parsed.data)

    const {
      productName,
      productModel,
      brand,
      serialNumber,
      languages,
      uploadMethod,
      originalFileUrl,
      rawFileText,
      sections: clientSections,
    } = sanitized

    // ── Step 1: Determine sections ──────────────────────────────────────────
    // If uploaded file: parse raw text into sections via Bedrock.
    // If manual sections: use what the client submitted.
    let sections = clientSections as Array<{ title: string; content: string }>

    if (uploadMethod === 'upload' && rawFileText) {
      const parsed = await parseManualContent(rawFileText)
      sections = parsed.map(s => ({ title: s.title, content: s.content }))
    }

    // ── Step 2: Insert manual + sections in a transaction ──────────────────
    let manualId: string
    let insertedSections: Array<{ id: string; sectionNumber: number; title: string; content: string }>

    await withTransaction(async (client) => {
      const manualResult = await client.query(
        `INSERT INTO manuals
           (user_id, product_name, product_model, brand, serial_number,
            status, languages, upload_method, original_file_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          session.user.id,
          productName,
          productModel,
          brand,
          serialNumber ?? null,
          'processing',
          languages,
          uploadMethod ?? null,
          originalFileUrl ?? null,
        ],
      )

      manualId = manualResult.rows[0].id
      insertedSections = []

      for (let i = 0; i < sections.length; i++) {
        const s = sections[i]
        const secResult = await client.query(
          `INSERT INTO manual_sections
             (manual_id, section_number, title, content, image_urls, video_urls)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, section_number AS "sectionNumber", title, content`,
          [manualId, i + 1, s.title, s.content ?? '', [], []],
        )
        insertedSections.push(secResult.rows[0])
      }
    })

    // ── Step 3: AI pipeline (async — runs after response dispatched) ────────
    // We fire-and-forget the AI pipeline to avoid timeout. The manual status
    // starts as 'processing' and is updated to 'published' when done.
    runAIPipeline({
      manualId: manualId!,
      productName,
      brand,
      languages,
      sections: insertedSections!,
    }).catch(err => console.error('[manuals] AI pipeline error:', err))

    // Return immediately with the created manual
    const result = await query(
      `SELECT id, product_name AS "productName", product_model AS "productModel",
              brand, status, languages, cover_image AS "coverImage",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM manuals WHERE id = $1`,
      [manualId!],
    )

    return NextResponse.json(
      { ...result.rows[0], sectionCount: insertedSections!.length },
      { status: 201 },
    )
  } catch (err) {
    console.error('[manuals] POST error:', err)
    return NextResponse.json({ error: 'Failed to create manual' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// AI Pipeline — runs fire-and-forget after the manual is saved
// ---------------------------------------------------------------------------
async function runAIPipeline(params: {
  manualId: string
  productName: string
  brand: string
  languages: string[]
  sections: Array<{ id: string; sectionNumber: number; title: string; content: string }>
}) {
  const { manualId, productName, brand, languages, sections } = params
  const context = `${productName} by ${brand}`

  try {
    // Step A: Translate all sections for non-English languages
    const nonEnglish = languages.filter(l => l !== 'en')
    for (const lang of nonEnglish) {
      for (const section of sections) {
        if (!section.content.trim()) continue
        const translated = await translateContent(section.content, lang, context)
        await query(
          `INSERT INTO translations
             (manual_id, section_id, language, translated_content, generated_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (manual_id, section_id, language)
           DO UPDATE SET translated_content = EXCLUDED.translated_content,
                         generated_at = NOW(),
                         updated_at = NOW()`,
          [manualId, section.id, lang, translated],
        )
      }
    }

    // Step B: Build knowledge base for RAG chat
    const { chunks, modelVersion } = await buildKnowledgeBase(sections)
    await query(
      `INSERT INTO manual_knowledge_base (manual_id, chunks, model_version, built_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (manual_id)
       DO UPDATE SET chunks = EXCLUDED.chunks,
                     model_version = EXCLUDED.model_version,
                     built_at = NOW(),
                     updated_at = NOW()`,
      [manualId, JSON.stringify(chunks), modelVersion],
    )

    // Step C: Mark manual as published
    await query(
      `UPDATE manuals SET status = 'published', updated_at = NOW() WHERE id = $1`,
      [manualId],
    )
  } catch (err) {
    // On failure, mark as draft so the user can retry
    await query(
      `UPDATE manuals SET status = 'draft', updated_at = NOW() WHERE id = $1`,
      [manualId],
    ).catch(() => null)
    throw err
  }
}
