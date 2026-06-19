/**
 * POST /api/upload
 *
 * Accepts a multipart form upload with:
 *   file     — the File object
 *   userId   — the uploader's user ID
 *   manualId — the manual this file belongs to (use 'new' for pre-create uploads)
 *   type     — 'manual' | 'thumbnail' | 'section-asset'
 *   sectionId — required when type === 'section-asset'
 *
 * Returns: { pathname }
 * The client should store the pathname and pass it to /api/file?pathname=... for display.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  uploadManualFile,
  uploadThumbnail,
  uploadSectionAsset,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/blob'

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const manualId = (formData.get('manualId') as string | null) ?? 'new'
  const type = (formData.get('type') as string | null) ?? 'manual'
  const sectionId = (formData.get('sectionId') as string | null) ?? 'unknown'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate type for manual uploads
  if (type === 'manual' && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only PDF and Word documents are accepted.' },
      { status: 422 },
    )
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds the 50 MB limit.' },
      { status: 422 },
    )
  }

  try {
    const userId = user.id

    if (type === 'thumbnail') {
      const { pathname } = await uploadThumbnail(file, file.name, userId, manualId)
      return NextResponse.json({ pathname })
    }

    if (type === 'section-asset') {
      const { pathname } = await uploadSectionAsset(file, file.name, userId, manualId, sectionId)
      return NextResponse.json({ pathname })
    }

    // Default: manual source file
    const { pathname, contentType } = await uploadManualFile(
      file,
      file.name,
      userId,
      manualId,
    )
    return NextResponse.json({ pathname, contentType })
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
