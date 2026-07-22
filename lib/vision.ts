/**
 * lib/vision.ts
 *
 * Wraps Amazon Nova Lite (Bedrock Converse) multimodal calls to identify a
 * physical device from a photo. Returns structured specs we can use to search
 * the manuals table (validated flow) or the community + web (open-source flow).
 *
 * Bedrock's Converse API expects raw image BYTES in an image content block —
 * not a URL — so callers pass the bytes + format directly.
 */

import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ImageFormat,
} from '@aws-sdk/client-bedrock-runtime'
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider'
import type { DeviceSpecs } from '@/lib/web-links'

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-lite-v1:0'
const AI_READY = !!(process.env.AWS_REGION && process.env.AWS_ROLE_ARN)

function getClient() {
  return new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN! }),
  })
}

export interface VisionResult {
  specs: DeviceSpecs
  /** A short, human-readable description of what the model saw. */
  description: string
  /** General troubleshooting tips for this kind of device (open-source flow). */
  tips: string[]
  /** True when the model is confident it identified a real product. */
  confident: boolean
  /**
   * True when the vision service itself could not run (missing/expired AWS
   * credentials, Bedrock error, throttling, etc.). The caller should route the
   * user to the open-source flow and show a "service temporarily unavailable"
   * notice rather than a hard failure.
   */
  unavailable?: boolean
}

/** Maps a MIME type to the Bedrock ImageFormat enum. */
export function mimeToImageFormat(mime: string): ImageFormat | null {
  switch (mime.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpeg'
    case 'image/png':
      return 'png'
    case 'image/gif':
      return 'gif'
    case 'image/webp':
      return 'webp'
    default:
      return null
  }
}

const SYSTEM_PROMPT = `You are a product-identification assistant for ClearGuide, a product manual platform.
You are shown a photo of a physical consumer or industrial device.
Identify the device as precisely as you can from visible logos, model numbers, labels, and form factor.

Respond with ONLY valid JSON (no markdown fences, no prose) in EXACTLY this shape:
{
  "brand": "string or null",
  "model": "string or null",
  "productType": "string or null (e.g. 'coffee machine', 'electric wheelchair')",
  "keywords": "space-separated extra descriptive words or null",
  "description": "one short sentence describing what you see",
  "tips": ["2 to 4 short general troubleshooting tips for this type of device"],
  "confident": true or false
}
Set confident=false if you cannot make out a real product. Never invent a specific model number you cannot see.`

/** Safely pulls the first JSON object out of a model response string. */
function parseVisionJSON(raw: string): VisionResult {
  const fallback: VisionResult = {
    specs: { brand: null, model: null, productType: null, keywords: null },
    description: 'We could not confidently identify the device in this photo.',
    tips: [],
    confident: false,
  }

  try {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return fallback
    const obj = JSON.parse(match[0]) as Record<string, unknown>

    const str = (v: unknown) =>
      typeof v === 'string' && v.trim() && v.trim().toLowerCase() !== 'null'
        ? v.trim()
        : null

    return {
      specs: {
        brand: str(obj.brand),
        model: str(obj.model),
        productType: str(obj.productType),
        keywords: str(obj.keywords),
      },
      description: str(obj.description) ?? fallback.description,
      tips: Array.isArray(obj.tips)
        ? (obj.tips as unknown[]).map(String).filter(Boolean).slice(0, 4)
        : [],
      confident: obj.confident === true,
    }
  } catch {
    return fallback
  }
}

/**
 * Identifies a device from image bytes using Nova Lite.
 * Falls back to a mock result when AWS credentials are not configured so the
 * flow remains testable in local/preview environments.
 */
export async function identifyDeviceFromImage(
  bytes: Uint8Array,
  format: ImageFormat,
): Promise<VisionResult> {
  if (!AI_READY) {
    return {
      specs: {
        brand: 'BrewTech',
        model: 'Smart Coffee Maker X1',
        productType: 'coffee machine',
        keywords: 'espresso brewer kitchen appliance',
      },
      description: '[AI_MOCK] A countertop coffee machine with a digital display.',
      tips: [
        'Check that the water reservoir is seated correctly.',
        'Run a descaling cycle if brewing is slow.',
        'Ensure the drip tray is fully inserted before starting.',
      ],
      confident: true,
    }
  }

  try {
    const client = getClient()
    const cmd = new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: SYSTEM_PROMPT }],
      messages: [
        {
          role: 'user',
          content: [
            { image: { format, source: { bytes } } },
            { text: 'Identify this device and return the JSON described in your instructions.' },
          ],
        },
      ],
      inferenceConfig: { maxTokens: 1024, temperature: 0.2 },
    })

    const response = await client.send(cmd)
    const text = response.output?.message?.content?.[0]?.text ?? ''
    return parseVisionJSON(text)
  } catch (err) {
    // Bedrock unreachable (expired web-identity token, throttling, region
    // issues, unsupported image, etc.). Degrade gracefully to the open-source
    // flow instead of failing the whole request.
    console.error('[vision] identifyDeviceFromImage failed:', err)
    return {
      specs: { brand: null, model: null, productType: null, keywords: null },
      description: 'Automatic photo identification is temporarily unavailable.',
      tips: [],
      confident: false,
      unavailable: true,
    }
  }
}
