import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

/**
 * POST /api/find/upload
 *
 * Stores a device photo in private Blob storage and returns its pathname.
 * The pathname is then passed to /api/find/identify. Open access (finding is
 * available to guests) — the photo is private and only read server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image is too large (max 8MB).' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const key = `find/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(key, file, { access: 'public', contentType: file.type })

    // Public store — the URL is directly readable and passed to /identify.
    return NextResponse.json({ url: blob.url, contentType: file.type })
  } catch (err) {
    console.error('[find] POST /api/find/upload error:', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
