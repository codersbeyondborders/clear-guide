import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { readQuery } from '@/lib/db'

const DB_READY = !!(process.env.PGHOST && process.env.AWS_ROLE_ARN)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!DB_READY) {
    // Rich mock data keyed by manual ID
    const mockNames: Record<string, string> = {
      'demo-qr-123': 'Smart Coffee Maker X1',
      'demo-qr-456': 'Smart Toaster Pro',
      'demo-qr-789': 'SonicBuds Wireless Earbuds',
    }
    return NextResponse.json({
      manualName: mockNames[id] ?? 'Manual Analytics',
      totalViews: 12_450,
      activeUsers: 843,
      avgTimeSpent: '4m 12s',
      trendViews: 12,
      trendUsers: -3,
      viewsOverTime: [
        { date: 'Mon', views: 1200 },
        { date: 'Tue', views: 1900 },
        { date: 'Wed', views: 1500 },
        { date: 'Thu', views: 2200 },
        { date: 'Fri', views: 2800 },
        { date: 'Sat', views: 3100 },
        { date: 'Sun', views: 2600 },
      ],
      topAIQueries: [
        { query: 'How to descale?',       count: 450 },
        { query: 'Filter replacement',    count: 320 },
        { query: 'Error code E2',         count: 210 },
        { query: 'Water not heating',     count: 180 },
        { query: 'Timer setting',         count: 95 },
      ],
    })
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the manual belongs to this user
    const ownerCheck = await readQuery(
      `SELECT product_name FROM manuals WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, session.user.id],
    )
    if (!ownerCheck.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const manualName = ownerCheck.rows[0].product_name

    // KPI aggregates — use read replica for analytics
    const kpiResult = await readQuery(
      `SELECT
         COUNT(*)::int                                        AS total_views,
         COUNT(DISTINCT user_session_id)::int                AS active_users,
         COALESCE(AVG(time_spent_seconds), 0)::int           AS avg_seconds
       FROM analytics
       WHERE manual_id = $1
         AND viewed_at >= NOW() - INTERVAL '30 days'`,
      [id],
    )

    const kpi = kpiResult.rows[0]
    const avgMin = Math.floor(kpi.avg_seconds / 60)
    const avgSec = kpi.avg_seconds % 60
    const avgTimeSpent = `${avgMin}m ${String(avgSec).padStart(2, '0')}s`

    // Views over time — last 7 days by day
    const viewsResult = await readQuery(
      `SELECT TO_CHAR(DATE_TRUNC('day', viewed_at), 'Dy') AS date,
              COUNT(*)::int AS views
       FROM analytics
       WHERE manual_id = $1
         AND viewed_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE_TRUNC('day', viewed_at)
       ORDER BY DATE_TRUNC('day', viewed_at) ASC`,
      [id],
    )

    // Top AI queries
    const queriesResult = await readQuery(
      `SELECT message AS query, COUNT(*)::int AS count
       FROM ai_chat_history
       WHERE manual_id = $1 AND role = 'user'
       GROUP BY message
       ORDER BY count DESC
       LIMIT 5`,
      [id],
    )

    return NextResponse.json({
      manualName,
      totalViews: kpi.total_views,
      activeUsers: kpi.active_users,
      avgTimeSpent,
      trendViews: 0,   // trend calc requires prior-period query; placeholder
      trendUsers: 0,
      viewsOverTime: viewsResult.rows,
      topAIQueries: queriesResult.rows,
    })
  } catch (err) {
    console.error('[v0] GET /api/manuals/[id]/analytics error:', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
