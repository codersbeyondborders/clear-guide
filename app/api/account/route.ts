import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { withTransaction } from '@/lib/db'

// ---------------------------------------------------------------------------
// DELETE /api/account
// Permanently deletes all of the authenticated user's data.
// Order: delete child rows first, then manuals, then Supabase auth user.
// ---------------------------------------------------------------------------
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = user.id

    // ── Delete all Aurora data in a transaction ─────────────────────────────
    await withTransaction(async (client) => {
      // 1. Get all manual IDs for this user
      const { rows: manuals } = await client.query(
        `SELECT id FROM manuals WHERE user_id = $1`,
        [userId],
      )
      const manualIds = manuals.map((r: { id: string }) => r.id)

      if (manualIds.length > 0) {
        const ids = manualIds.map((_: string, i: number) => `$${i + 1}`).join(',')

        // 2. Delete leaf tables first
        await client.query(`DELETE FROM ai_chat_history WHERE manual_id IN (${ids})`, manualIds)
        await client.query(`DELETE FROM analytics       WHERE manual_id IN (${ids})`, manualIds)
        await client.query(`DELETE FROM translations    WHERE manual_id IN (${ids})`, manualIds)

        // Delete section-level children
        const { rows: sections } = await client.query(
          `SELECT id FROM manual_sections WHERE manual_id IN (${ids})`,
          manualIds,
        )
        if (sections.length > 0) {
          const sectionIds = sections.map((r: { id: string }) => r.id)
          const sids = sectionIds.map((_: string, i: number) => `$${i + 1}`).join(',')
          await client.query(`DELETE FROM manual_knowledge_base WHERE section_id IN (${sids})`, sectionIds)
        }

        await client.query(`DELETE FROM manual_sections WHERE manual_id IN (${ids})`, manualIds)
        await client.query(`DELETE FROM manuals         WHERE id        IN (${ids})`, manualIds)
      }
    })

    // ── Delete the Supabase auth user (requires service role key) ───────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      await admin.auth.admin.deleteUser(userId)
    } else {
      // Fallback: sign out the user so the session is invalidated
      await supabase.auth.signOut()
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[account] DELETE /api/account error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
