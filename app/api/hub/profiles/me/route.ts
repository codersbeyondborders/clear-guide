import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/community-auth'
import { put } from '@vercel/blob'

// GET /api/hub/profiles/me
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  try {
    const { rows } = await query(
      `SELECT
        u.id, u.name, u.email, u.username, u.display_name AS "displayName",
        u.bio, u.avatar_url AS "avatarUrl", u.location, u.website_url AS "websiteUrl",
        u.repair_specialty AS "repairSpecialty", u."createdAt",
        (SELECT COUNT(*) FROM public.hub_posts WHERE user_id = u.id) AS "postCount",
        (SELECT COUNT(*) FROM public.hub_follows WHERE following_id = u.id) AS "followerCount",
        (SELECT COUNT(*) FROM public.hub_follows WHERE follower_id = u.id) AS "followingCount"
       FROM public."user" u WHERE u.id = $1`,
      [user.id],
    )
    if (!rows.length) return NextResponse.json({ data: null, error: 'User not found' }, { status: 404 })
    const r = rows[0]
    return NextResponse.json({
      data: {
        id: r.id, name: r.name, email: r.email, username: r.username, displayName: r.displayName,
        bio: r.bio, avatarUrl: r.avatarUrl, location: r.location, websiteUrl: r.websiteUrl,
        repairSpecialty: r.repairSpecialty ?? [], createdAt: r.createdAt,
        postCount: parseInt(r.postCount ?? '0'),
        followerCount: parseInt(r.followerCount ?? '0'),
        followingCount: parseInt(r.followingCount ?? '0'),
      },
      error: null,
    })
  } catch (err) {
    console.error('[GET /api/hub/profiles/me]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/hub/profiles/me  → update profile fields
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  const contentType = req.headers.get('content-type') ?? ''

  // Avatar upload via multipart
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('avatar') as File | null
    if (!file) return NextResponse.json({ data: null, error: 'No avatar file' }, { status: 400 })
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      return NextResponse.json({ data: null, error: 'Invalid image type' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ data: null, error: 'Avatar too large (max 5 MB)' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const blob = await put(`avatars/${user.id}.${ext}`, file, { access: 'public', contentType: file.type })
    await query(`UPDATE public."user" SET avatar_url=$1, "updatedAt"=NOW() WHERE id=$2`, [blob.url, user.id])
    return NextResponse.json({ data: { avatarUrl: blob.url }, error: null })
  }

  // JSON profile update
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const allowed = [
    'displayName', 'username', 'bio', 'location', 'websiteUrl', 'repairSpecialty',
    // personalisation preferences
    'ageGroup', 'fontSizePref', 'highContrast', 'reducedMotion', 'screenReader', 'colorBlindMode',
  ] as const
  const setClauses: string[] = []
  const vals: unknown[] = []
  const colMap: Record<string, string> = {
    displayName:    'display_name',
    username:       'username',
    bio:            'bio',
    location:       'location',
    websiteUrl:     'website_url',
    repairSpecialty:'repair_specialty',
    ageGroup:       'age_group',
    fontSizePref:   'font_size_pref',
    highContrast:   'high_contrast',
    reducedMotion:  'reduced_motion',
    screenReader:   'screen_reader',
    colorBlindMode: 'color_blind_mode',
  }

  for (const key of allowed) {
    if (key in body) {
      vals.push(body[key])
      setClauses.push(`${colMap[key]} = $${vals.length}`)
    }
  }

  if (!setClauses.length) return NextResponse.json({ data: null, error: 'No valid fields provided' }, { status: 400 })

  // Username uniqueness check
  if ('username' in body && body.username) {
    const uname = (body.username as string).toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (uname.length < 3) return NextResponse.json({ data: null, error: 'Username must be at least 3 characters' }, { status: 400 })
    const { rows } = await query(`SELECT id FROM public."user" WHERE username=$1 AND id<>$2`, [uname, user.id])
    if (rows.length) return NextResponse.json({ data: null, error: 'Username already taken' }, { status: 409 })
    body.username = uname
  }

  vals.push(user.id)
  try {
    await query(
      `UPDATE public."user" SET ${setClauses.join(', ')}, "updatedAt"=NOW() WHERE id = $${vals.length}`,
      vals,
    )
    return NextResponse.json({ data: { updated: true }, error: null })
  } catch (err) {
    console.error('[PATCH /api/hub/profiles/me]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
