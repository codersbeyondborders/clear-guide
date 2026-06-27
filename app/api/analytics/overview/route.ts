import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readQuery } from '@/lib/db'

// ---------------------------------------------------------------------------
// GET /api/analytics/overview
// Aggregate analytics across ALL of the user's manuals.
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── Aggregate KPIs + trends (current 30d vs prior 30d) ─────────────────
    const kpiResult = await readQuery(
      `SELECT
         COUNT(a.id)::int                                                               AS "totalViews",
         COUNT(a.id) FILTER (WHERE a.viewed_at >= NOW() - INTERVAL '30 days')::int    AS "viewsCurrent",
         COUNT(a.id) FILTER (
           WHERE a.viewed_at >= NOW() - INTERVAL '60 days'
             AND a.viewed_at <  NOW() - INTERVAL '30 days')::int                      AS "viewsPrior",
         COUNT(DISTINCT a.user_session_id)
           FILTER (WHERE a.viewed_at >= NOW() - INTERVAL '30 days')::int              AS "activeUsers",
         COUNT(DISTINCT a.user_session_id)
           FILTER (
             WHERE a.viewed_at >= NOW() - INTERVAL '60 days'
               AND a.viewed_at <  NOW() - INTERVAL '30 days')::int                   AS "usersPrior",
         COUNT(ch.id)
           FILTER (WHERE ch.role = 'user')::int                                       AS "aiQueries"
       FROM manuals m
       LEFT JOIN analytics a ON a.manual_id = m.id
       LEFT JOIN ai_chat_history ch ON ch.manual_id = m.id
       WHERE m.user_id = $1
         AND m.deleted_at IS NULL`,
      [user.id],
    )

    const raw = kpiResult.rows[0] ?? {
      totalViews: 0, viewsCurrent: 0, viewsPrior: 0,
      activeUsers: 0, usersPrior: 0, aiQueries: 0,
    }

    const trendViews = raw.viewsPrior > 0
      ? Math.round(((raw.viewsCurrent - raw.viewsPrior) / raw.viewsPrior) * 100)
      : 0
    const trendUsers = raw.usersPrior > 0
      ? Math.round(((raw.activeUsers - raw.usersPrior) / raw.usersPrior) * 100)
      : 0

    // ── Views over time — last 30 days, grouped by day ──────────────────────
    const viewsOverTimeResult = await readQuery(
      `SELECT TO_CHAR(DATE_TRUNC('day', a.viewed_at), 'Mon DD') AS date,
              COUNT(*)::int                                      AS views
       FROM analytics a
       JOIN manuals m ON m.id = a.manual_id
       WHERE m.user_id = $1
         AND m.deleted_at IS NULL
         AND a.viewed_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE_TRUNC('day', a.viewed_at)
       ORDER BY DATE_TRUNC('day', a.viewed_at) ASC`,
      [user.id],
    )

    // ── Top 10 manuals by total views ───────────────────────────────────────
    const topManualsResult = await readQuery(
      `SELECT
         m.id,
         m.product_name             AS name,
         m.status,
         COUNT(a.id)::int           AS views,
         COUNT(DISTINCT a.user_session_id)::int AS users,
         COALESCE(AVG(a.time_spent_seconds), 0)::int AS "avgSeconds"
       FROM manuals m
       LEFT JOIN analytics a ON a.manual_id = m.id
       WHERE m.user_id = $1
         AND m.deleted_at IS NULL
       GROUP BY m.id, m.product_name, m.status
       ORDER BY views DESC
       LIMIT 10`,
      [user.id],
    )

    return NextResponse.json({
      kpi: {
        totalViews: raw.totalViews,
        activeUsers: raw.activeUsers,
        aiQueries: raw.aiQueries,
        trendViews,
        trendUsers,
      },
      viewsOverTime: viewsOverTimeResult.rows,
      topManuals: topManualsResult.rows,
    })
  } catch (err) {
    console.error('[analytics/overview] GET error:', err)
    return NextResponse.json({ error: 'Failed to load analytics overview' }, { status: 500 })
  }
}
