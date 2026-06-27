import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readQuery } from '@/lib/db'

// Derive interval strings from period param
function periodToInterval(period: string): { current: string; prior: string; groupFmt: string; labelFmt: string } {
  switch (period) {
    case '90d': return { current: '90 days', prior: '180 days', groupFmt: 'week', labelFmt: 'IW' }
    case '30d': return { current: '30 days', prior: '60 days',  groupFmt: 'day',  labelFmt: 'Mon DD' }
    default:    return { current: '7 days',  prior: '14 days',  groupFmt: 'day',  labelFmt: 'Dy' }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? '7d'
  const { current, prior, groupFmt, labelFmt } = periodToInterval(period)

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

    // KPI + trend in a single query — current period vs prior period
    const kpiResult = await readQuery(
      `SELECT
         COUNT(*) FILTER (WHERE viewed_at >= NOW() - $2::interval)::int            AS total_views,
         COUNT(*) FILTER (
           WHERE viewed_at >= NOW() - $3::interval
             AND viewed_at <  NOW() - $2::interval)::int                           AS prior_views,
         COUNT(DISTINCT user_session_id)
           FILTER (WHERE viewed_at >= NOW() - $2::interval)::int                  AS active_users,
         COUNT(DISTINCT user_session_id)
           FILTER (
             WHERE viewed_at >= NOW() - $3::interval
               AND viewed_at <  NOW() - $2::interval)::int                        AS prior_users,
         COALESCE(AVG(time_spent_seconds)
           FILTER (WHERE viewed_at >= NOW() - $2::interval), 0)::int              AS avg_seconds
       FROM analytics
       WHERE manual_id = $1`,
      [id, current, prior],
    )

    const kpi = kpiResult.rows[0]
    const avgMin = Math.floor(kpi.avg_seconds / 60)
    const avgSec = kpi.avg_seconds % 60
    const avgTimeSpent = `${avgMin}m ${String(avgSec).padStart(2, '0')}s`

    const trendViews = kpi.prior_views > 0
      ? Math.round(((kpi.total_views - kpi.prior_views) / kpi.prior_views) * 100)
      : 0
    const trendUsers = kpi.prior_users > 0
      ? Math.round(((kpi.active_users - kpi.prior_users) / kpi.prior_users) * 100)
      : 0

    // Views over time — grouped by day or week depending on period
    const viewsResult = await readQuery(
      `SELECT TO_CHAR(DATE_TRUNC($2, viewed_at), $3)  AS date,
              COUNT(*)::int                            AS views
       FROM analytics
       WHERE manual_id = $1
         AND viewed_at >= NOW() - $4::interval
       GROUP BY DATE_TRUNC($2, viewed_at)
       ORDER BY DATE_TRUNC($2, viewed_at) ASC`,
      [id, groupFmt, labelFmt, current],
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
      trendViews,
      trendUsers,
      viewsOverTime: viewsResult.rows,
      topAIQueries: queriesResult.rows,
    })
  } catch (err) {
    console.error('[analytics] GET /api/manuals/[id]/analytics error:', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
