import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readQuery } from '@/lib/db'

// ---------------------------------------------------------------------------
// GET /api/dashboard/analytics
// Returns aggregate KPI data + recent activity feed for the authenticated user
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── KPI aggregates ──────────────────────────────────────────────────────
    const kpiResult = await readQuery(
      `SELECT
         COUNT(DISTINCT m.id)::int                                            AS "totalManuals",
         COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'published')::int     AS "publishedManuals",
         COUNT(a.id)::int                                                     AS "totalViews",
         COUNT(DISTINCT a.user_session_id)
           FILTER (WHERE a.viewed_at >= NOW() - INTERVAL '30 days')::int     AS "activeUsers"
       FROM manuals m
       LEFT JOIN analytics a ON a.manual_id = m.id
       WHERE m.user_id = $1
         AND m.deleted_at IS NULL`,
      [user.id],
    )

    const kpi = kpiResult.rows[0] ?? {
      totalManuals: 0,
      publishedManuals: 0,
      totalViews: 0,
      activeUsers: 0,
    }

    // ── Recent activity feed (last 10 view events) ──────────────────────────
    const activityResult = await readQuery(
      `SELECT
         a.id,
         m.product_name   AS "manualName",
         m.id             AS "manualId",
         a.mode,
         a.time_spent_seconds AS "timeSpentSeconds",
         a.viewed_at      AS "viewedAt"
       FROM analytics a
       JOIN manuals m ON m.id = a.manual_id
       WHERE m.user_id = $1
         AND m.deleted_at IS NULL
       ORDER BY a.viewed_at DESC
       LIMIT 10`,
      [user.id],
    )

    return NextResponse.json({
      kpi: {
        totalManuals: kpi.totalManuals,
        publishedManuals: kpi.publishedManuals,
        totalViews: kpi.totalViews,
        activeUsers: kpi.activeUsers,
      },
      recentActivity: activityResult.rows,
    })
  } catch (err) {
    console.error('[dashboard/analytics] GET error:', err)
    return NextResponse.json({ error: 'Failed to load dashboard analytics' }, { status: 500 })
  }
}
