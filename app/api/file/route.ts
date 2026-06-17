/**
 * GET /api/file?pathname=<blob-pathname>
 *
 * Serves a private Vercel Blob file to authenticated users.
 * Supports conditional requests (ETag / If-None-Match) for browser caching.
 *
 * Usage in client code:
 *   <img src={`/api/file?pathname=${encodeURIComponent(pathname)}`} alt="..." />
 *   <a href={`/api/file?pathname=${encodeURIComponent(pathname)}`}>Download</a>
 */

import { type NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { servePrivateBlob } from '@/lib/blob'

export async function GET(request: NextRequest) {
  // Auth check — private files require a valid session
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname) {
    return NextResponse.json({ error: 'Missing pathname parameter' }, { status: 400 })
  }

  // Ensure users can only access files under their own userId prefix
  // (thumbnails and sections follow the same userId path structure)
  const userId = session.user.id
  const isOwned =
    pathname.startsWith(`manuals/${userId}/`) ||
    pathname.startsWith(`thumbnails/${userId}/`) ||
    pathname.startsWith(`sections/${userId}/`)

  if (!isOwned) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ifNoneMatch = request.headers.get('if-none-match')

  return servePrivateBlob(pathname, ifNoneMatch)
}
