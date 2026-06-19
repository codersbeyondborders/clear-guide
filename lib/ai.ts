import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime'
import { awsCredentialsProvider } from '@vercel/functions/oidc'

// ---------------------------------------------------------------------------
// Client — Amazon Nova Lite v2
// Uses the Converse / ConverseStream API (model-agnostic message format).
// IAM role must have:
//   bedrock:InvokeModel
//   bedrock:InvokeModelWithResponseStream
// ---------------------------------------------------------------------------
const MODEL_ID =
  process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-lite-v1:0'

const AI_READY = !!(process.env.AWS_REGION && process.env.AWS_ROLE_ARN)

function getClient() {
  return new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN!,
      clientConfig: { region: process.env.AWS_REGION ?? 'us-east-1' },
      tokenAudience: 'https://vercel.com',
    }),
  })
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface BedrockMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ParsedSection {
  sectionNumber: number
  title: string
  content: string
}

export interface KnowledgeChunk {
  sectionId: string
  sectionNumber: number
  title: string
  text: string
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Single-turn invocation — returns the model's text response as a string.
 * Used for parsing, translation, and summarisation tasks.
 */
export async function bedrockInvoke(
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  if (!AI_READY) {
    return `[AI_MOCK] Response to: ${prompt.slice(0, 80)}...`
  }

  const client = getClient()
  const cmd = new ConverseCommand({
    modelId: MODEL_ID,
    system: [{ text: systemPrompt ?? 'You are a helpful assistant for ClearGuide, a product manual platform.' }],
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 4096 },
  })

  const response = await client.send(cmd)
  return response.output?.message?.content?.[0]?.text ?? ''
}

/**
 * Streaming invocation — yields text delta chunks as an async generator.
 * Used for real-time chat responses.
 */
export async function* bedrockStream(
  messages: BedrockMessage[],
  systemPrompt: string,
): AsyncGenerator<string> {
  if (!AI_READY) {
    const mock = 'I am a simulated AI assistant. AWS Bedrock credentials are not configured in this environment.'
    for (const word of mock.split(' ')) {
      yield word + ' '
      await new Promise(r => setTimeout(r, 40))
    }
    return
  }

  const client = getClient()
  const cmd = new ConverseStreamCommand({
    modelId: MODEL_ID,
    system: [{ text: systemPrompt }],
    messages: messages.map(m => ({
      role: m.role,
      content: [{ text: m.content }],
    })),
    inferenceConfig: { maxTokens: 2048 },
  })

  const response = await client.send(cmd)
  if (!response.stream) return

  for await (const event of response.stream) {
    const text = event.contentBlockDelta?.delta?.text
    if (text) yield text
  }
}

// ---------------------------------------------------------------------------
// AI Pipeline helpers
// ---------------------------------------------------------------------------

/**
 * Parses raw uploaded text into structured sections.
 * Called when uploadMethod === 'upload' and the file has been extracted to text.
 */
export async function parseManualContent(rawText: string): Promise<ParsedSection[]> {
  const prompt = `You are a technical document parser. Given the following raw product manual text, split it into logical sections.

Return ONLY a valid JSON array (no markdown, no explanation) in this format:
[
  { "sectionNumber": 1, "title": "Section Title", "content": "Full section content..." },
  ...
]

Raw text:
${rawText.slice(0, 12000)}`

  const result = await bedrockInvoke(prompt)

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    return [{ sectionNumber: 1, title: 'Content', content: rawText.slice(0, 5000) }]
  }
}

/**
 * Translates a single content string into the target BCP-47 language.
 * Returns the translated string.
 */
export async function translateContent(
  content: string,
  targetLanguage: string,
  context?: string,
): Promise<string> {
  const prompt = `Translate the following product manual content to ${targetLanguage} (BCP-47 language code).
Keep technical terminology accurate. Preserve markdown formatting if present.
${context ? `Product context: ${context}` : ''}

Content to translate:
${content.slice(0, 8000)}

Return ONLY the translated text, nothing else.`

  return bedrockInvoke(prompt)
}

/**
 * Builds a searchable knowledge base from manual sections.
 * Chunks content by section and returns structured chunks for RAG.
 */
export async function buildKnowledgeBase(
  sections: Array<{ id: string; sectionNumber: number; title: string; content: string }>,
  modelVersion = MODEL_ID,
): Promise<{ chunks: KnowledgeChunk[]; modelVersion: string }> {
  // For RAG we keep it simple — one chunk per section, cleaned and trimmed.
  // In production you'd also generate embeddings and store in pgvector.
  const chunks: KnowledgeChunk[] = sections.map(s => ({
    sectionId: s.id,
    sectionNumber: s.sectionNumber,
    title: s.title,
    text: s.content.replace(/\s+/g, ' ').trim().slice(0, 2000),
  }))

  return { chunks, modelVersion }
}

/**
 * Builds the system prompt for AI chat, injecting knowledge base context.
 */
export function buildChatSystemPrompt(
  productName: string,
  brand: string,
  chunks: KnowledgeChunk[],
  language = 'en',
): string {
  const context = chunks
    .map(c => `## ${c.title}\n${c.text}`)
    .join('\n\n')

  return `You are an AI support assistant for the "${productName}" by ${brand}.
You help end users understand and use their product by answering questions based on the product manual.

INSTRUCTIONS:
- Answer only based on the manual content provided below.
- If the answer is not in the manual, say so honestly and suggest contacting support.
- Be concise, helpful, and friendly.
- Respond in the same language as the user's message (default: ${language}).
- Never make up specifications, part numbers, or safety instructions.

MANUAL CONTENT:
${context.slice(0, 8000)}`
}
