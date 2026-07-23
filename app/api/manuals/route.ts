import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { query, withTransaction } from '@/lib/db'
import {
  parseManualContent,
  translateContent,
  buildKnowledgeBase,
} from '@/lib/ai'
import { CreateManualSchema, parseOrError } from '@/lib/validation'
import { sanitizeManualInput } from '@/lib/sanitize'

// ---------------------------------------------------------------------------
// GET /api/manuals
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
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
        m.brand, m.status, m.is_public AS "isPublic", m.languages, m.cover_image AS "coverImage",
        m.created_at AS "createdAt", m.updated_at AS "updatedAt",
        COUNT(DISTINCT s.id)::int                      AS "sectionCount",
        COUNT(DISTINCT a.id)::int                      AS "viewCount",
        COALESCE(AVG(a.time_spent_seconds), 0)::int    AS "avgTimeSeconds"
      FROM manuals m
      LEFT JOIN manual_sections s ON s.manual_id = m.id
      LEFT JOIN analytics a       ON a.manual_id  = m.id
      WHERE m.user_id = $1
        AND m.deleted_at IS NULL
        ${status && status !== 'all' ? 'AND m.status = $2' : ''}
        ${before ? `AND m.updated_at < ${status && status !== 'all' ? '$3' : '$2'}` : ''}
      GROUP BY m.id
      ORDER BY m.updated_at DESC
      LIMIT ${limit}
    `

    const params: (string | number)[] = [user.id]
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

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
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
      isPublic,
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
            status, languages, is_public, upload_method, original_file_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          user.id,
          productName,
          productModel,
          brand,
          serialNumber ?? null,
          'processing',
          languages,
          isPublic ?? true,
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
