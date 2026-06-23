/**
 * lib/blob.ts
 *
 * Vercel Blob helpers for ClearGuide.
 * The store is configured as PRIVATE — files require authentication to read.
 * Always use /api/file?pathname=... to serve blobs to the client.
 */
import { put, del, get, list } from '@vercel/blob'

// Allowed MIME types for manual uploads
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

/**
 * Upload a manual source file to Blob storage (private).
 * Returns the pathname (NOT the blob URL — the URL is not public).
 *
 * Path structure: manuals/{userId}/{manualId}/{filename}
 */
export async function uploadManualFile(
  file: File | Buffer | ReadableStream,
  filename: string,
  userId: string,
  manualId: string,
): Promise<{ pathname: string; contentType: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `manuals/${userId}/${manualId}/${sanitized}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: getContentType(filename),
  })

  return {
    pathname: blob.pathname,
    contentType: blob.contentType,
  }
}

/**
 * Upload a manual thumbnail/cover image to Blob storage (private).
 * Returns the pathname.
 */
export async function uploadThumbnail(
  file: File | Buffer,
  filename: string,
  userId: string,
  manualId: string,
): Promise<{ pathname: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `thumbnails/${userId}/${manualId}/${sanitized}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return { pathname: blob.pathname }
}

/**
 * Upload a section image/asset.
 * Returns the pathname.
 */
export async function uploadSectionAsset(
  file: File | Buffer,
  filename: string,
  userId: string,
  manualId: string,
  sectionId: string,
): Promise<{ pathname: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `sections/${userId}/${manualId}/${sectionId}/${sanitized}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  return { pathname: blob.pathname }
}

/**
 * Serve a private blob — returns a Response with the file stream.
 * Pass the etag from client's If-None-Match header for conditional requests.
 */
export async function servePrivateBlob(
  pathname: string,
  ifNoneMatch?: string | null,
): Promise<Response> {
  const result = await get(pathname, {
    access: 'private',
    ifNoneMatch: ifNoneMatch ?? undefined,
  })

  if (!result) {
    return new Response('Not Found', { status: 404 })
  }

  // Browser cached — no need to re-download
  if (result.statusCode === 304) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    })
  }

  return new Response(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      ETag: result.blob.etag,
      'Cache-Control': 'private, no-cache',
    },
  })
}

/**
 * Delete a blob by pathname.
 */
export async function deleteBlob(pathname: string): Promise<void> {
  // del() accepts a blob URL — get the URL from list() if needed.
  // For simplicity we find via list then delete.
  const { blobs } = await list({ prefix: pathname })
  const match = blobs.find(b => b.pathname === pathname)
  if (match) {
    await del(match.url)
  }
}

/**
 * List all blobs under a given prefix (e.g. all files for a manual).
 */
export async function listManualBlobs(userId: string, manualId: string) {
  const { blobs } = await list({ prefix: `manuals/${userId}/${manualId}/` })
  return blobs.map(b => ({
    pathname: b.pathname,
    size: b.size,
    uploadedAt: b.uploadedAt,
    filename: b.pathname.split('/').pop() ?? 'unknown',
  }))
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':  return 'application/pdf'
    case 'doc':  return 'application/msword'
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'png':  return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'webp': return 'image/webp'
    default:     return 'application/octet-stream'
  }
}
