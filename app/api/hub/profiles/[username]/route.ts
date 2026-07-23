import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOptionalUser } from '@/lib/community-auth'

// GET /api/hub/profiles/[username]  (username OR user id)
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const viewer = await getOptionalUser(req)

  try {
    // Allow lookup by username OR by id (id starts with alphanumeric but not @)
    const { rows } = await query(
      `SELECT
        u.id, u.name, u.email, u.username, u.display_name AS "displayName",
        u.bio, u.avatar_url AS "avatarUrl", u.location, u.website_url AS "websiteUrl",
        u.repair_specialty AS "repairSpecialty", u."createdAt",
        (SELECT COUNT(*) FROM public.hub_posts WHERE user_id = u.id) AS "postCount",
        (SELECT COUNT(*) FROM public.hub_follows WHERE following_id = u.id) AS "followerCount",
        (SELECT COUNT(*) FROM public.hub_follows WHERE follower_id = u.id) AS "followingCount"
        ${viewer ? `, EXISTS(SELECT 1 FROM public.hub_follows WHERE follower_id='${viewer.id}' AND following_id=u.id) AS "isFollowing"` : ', false AS "isFollowing"'}
       FROM public."user" u
       WHERE u.username = $1 OR u.id = $1
       LIMIT 1`,
      [username],
    )

    if (!rows.length) return NextResponse.json({ data: null, error: 'User not found' }, { status: 404 })

    const r = rows[0]
    return NextResponse.json({
      data: {
        id: r.id, name: r.name, username: r.username, displayName: r.displayName,
        bio: r.bio, avatarUrl: r.avatarUrl, location: r.location, websiteUrl: r.websiteUrl,
        repairSpecialty: r.repairSpecialty ?? [], createdAt: r.createdAt,
        postCount: parseInt(r.postCount ?? '0'),
        followerCount: parseInt(r.followerCount ?? '0'),
        followingCount: parseInt(r.followingCount ?? '0'),
        isFollowing: r.isFollowing ?? false,
      },
      error: null,
    })
  } catch (err) {
    console.error('[GET /api/hub/profiles/[username]]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
