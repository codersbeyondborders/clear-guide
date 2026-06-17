import { query, readQuery } from '@/lib/db'
import { bedrockStream, buildChatSystemPrompt } from '@/lib/ai'
import { ChatRequestSchema, parseOrError } from '@/lib/validation'
import type { KnowledgeChunk } from '@/lib/ai'

// ---------------------------------------------------------------------------
// POST /api/chat
//
// Body: { message, manualId, history?, language? }
// Returns text/event-stream SSE tokens (data: <token>\n\n, data: [DONE]\n\n)
// Falls back to JSON { reply } when client does not send Accept: text/event-stream
// ---------------------------------------------------------------------------

const DB_READY = !!(process.env.PGHOST && process.env.AWS_ROLE_ARN)

// Mock knowledge base — used when DB is not configured
const MOCK_KB: Record<string, KnowledgeChunk[]> = {
  'demo-qr-123': [
    { sectionId: 's1', sectionNumber: 1, title: 'Getting Started', text: 'Welcome to your new Smart Coffee Maker. Before first use, wash all removable parts with warm soapy water. Fill the water reservoir to the MAX line and run a brew cycle without coffee to flush the system.' },
    { sectionId: 's2', sectionNumber: 2, title: 'Brewing Coffee', text: 'Add coffee grounds to the filter basket (1 tbsp per 6 oz water). Fill the reservoir with fresh cold water. Press the Brew button. The machine will beep once when brewing is complete.' },
    { sectionId: 's3', sectionNumber: 3, title: 'Cleaning & Maintenance', text: 'Descale every 3 months using a 1:1 vinegar-water solution. Run two full brew cycles with plain water after descaling. Wipe the exterior with a damp cloth. Never immerse the base unit in water.' },
  ],
  'demo-qr-456': [
    { sectionId: 't1', sectionNumber: 1, title: 'Initial Setup', text: 'Place the toaster on a flat heat-resistant surface. Plug into a grounded outlet. Remove all packaging from the slots before first use.' },
    { sectionId: 't2', sectionNumber: 2, title: 'Toasting Bread', text: 'Insert bread into the slots. Select browning level 1-6 using the dial (1=light, 6=dark). Press the lever down to start. The toast will pop up automatically when done.' },
  ],
  'demo-qr-789': [
    { sectionId: 'e1', sectionNumber: 1, title: 'Pairing', text: 'Open the charging case lid with earbuds inside. On your device, go to Bluetooth settings and select SonicBuds. The LED will flash blue twice to confirm pairing.' },
    { sectionId: 'e2', sectionNumber: 2, title: 'Touch Controls', text: 'Single tap: Play/Pause. Double tap right: Next track. Double tap left: Previous track. Triple tap: Activate voice assistant. Hold 2s: Toggle ANC.' },
    { sectionId: 'e3', sectionNumber: 3, title: 'Charging', text: 'Place earbuds back in the case — LED pulses white while charging. Case charges via USB-C. Full charge takes ~90 minutes. Earbuds provide 8h playback; case provides 3 additional charges.' },
  ],
}

export async function POST(request: Request) {
  // ── 0. Validate request body ──────────────────────────────────────────────
  const rawBody = await request.json()
  const parsed = parseOrError(ChatRequestSchema, rawBody)
  if (!parsed.success) return parsed.response

  const { message, manualId, history, language } = parsed.data

  // ── 1. Fetch knowledge base ───────────────────────────────────────────────
  let chunks: KnowledgeChunk[] = []
  let productName = 'the product'
  let brand = 'the manufacturer'

  if (!DB_READY) {
    chunks = MOCK_KB[manualId] ?? []
  } else {
    try {
      const [kbResult, manualResult] = await Promise.all([
        readQuery(
          `SELECT chunks FROM manual_knowledge_base WHERE manual_id = $1`,
          [manualId],
        ),
        readQuery(
          `SELECT product_name, brand FROM manuals WHERE id = $1 AND deleted_at IS NULL`,
          [manualId],
        ),
      ])

      if (kbResult.rows[0]?.chunks) {
        chunks = kbResult.rows[0].chunks as KnowledgeChunk[]
      }
      if (manualResult.rows[0]) {
        productName = manualResult.rows[0].product_name
        brand = manualResult.rows[0].brand
      }
    } catch (err) {
      console.error('[chat] KB fetch error:', err)
      // Continue without KB context — model will still try to help
    }
  }

  // ── 2. Build system prompt with RAG context ───────────────────────────────
  const systemPrompt = buildChatSystemPrompt(productName, brand, chunks, language)

  // ── 3. Build Bedrock message history ─────────────────────────────────────
  const bedrockMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...history.slice(-10), // keep last 10 turns within context window
    { role: 'user', content: message },
  ]

  // ── 4. Stream response ────────────────────────────────────────────────────
  const acceptsStream = request.headers.get('accept')?.includes('text/event-stream')

  if (acceptsStream) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = ''
        try {
          for await (const token of bedrockStream(bedrockMessages, systemPrompt)) {
            fullReply += token
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(token)}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err) {
          console.error('[chat] stream error:', err)
          const errToken = "I'm sorry, I encountered an error. Please try again."
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errToken)}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          fullReply = errToken
        } finally {
          controller.close()
          if (DB_READY) {
            persistChatHistory(manualId, message, fullReply).catch(() => null)
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  }

  // ── 5. Non-streaming fallback ─────────────────────────────────────────────
  try {
    let reply = ''
    for await (const token of bedrockStream(bedrockMessages, systemPrompt)) {
      reply += token
    }

    if (DB_READY) {
      persistChatHistory(manualId, message, reply).catch(() => null)
    }

    return Response.json({ reply })
  } catch (err) {
    console.error('[chat] non-stream error:', err)
    return Response.json({
      reply: "I'm sorry, I'm having trouble connecting right now. Please try again.",
    })
  }
}

// ---------------------------------------------------------------------------
// Persist chat turn to ai_chat_history (fire-and-forget)
// ---------------------------------------------------------------------------
async function persistChatHistory(
  manualId: string,
  userMessage: string,
  assistantReply: string,
) {
  const sessionId = `anon-${manualId}-${Date.now()}`
  const tokenEstimate = (s: string) => Math.ceil(s.length / 4)

  await query(
    `INSERT INTO ai_chat_history (manual_id, user_session_id, role, message, token_count)
     VALUES ($1, $2, 'user', $3, $4), ($1, $2, 'assistant', $5, $6)`,
    [
      manualId,
      sessionId,
      userMessage,
      tokenEstimate(userMessage),
      assistantReply,
      tokenEstimate(assistantReply),
    ],
  )
}
