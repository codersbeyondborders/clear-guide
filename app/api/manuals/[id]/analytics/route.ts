import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readQuery } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the manual belongs to this user
    const ownerCheck = await readQuery(
      `SELECT product_name FROM manuals WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, user.id],
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
