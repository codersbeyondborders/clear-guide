import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAuth } from '@/lib/community-auth'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024    // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024   // 100 MB
const MAX_DOC_SIZE   = 25 * 1024 * 1024    // 25 MB

const ALLOWED_MIME: Record<string, 'image' | 'video' | 'document'> = {
  'image/jpeg': 'image', 'image/jpg': 'image', 'image/png': 'image',
  'image/gif': 'image', 'image/webp': 'image', 'image/avif': 'image',
  'video/mp4': 'video', 'video/webm': 'video', 'video/quicktime': 'video',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  let formData: FormData
  try { formData = await req.formData() } catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }) }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const mediaType = ALLOWED_MIME[file.type]
  if (!mediaType) return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })

  const maxSize = mediaType === 'image' ? MAX_IMAGE_SIZE : mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_DOC_SIZE
  if (file.size > maxSize) {
    return NextResponse.json({ error: `File too large (max ${Math.round(maxSize / 1024 / 1024)} MB for ${mediaType}s)` }, { status: 400 })
  }

  try {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const pathname = `hub/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({
      url: blob.url,
      type: mediaType,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    })
  } catch (err) {
    console.error('[POST /api/hub/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
