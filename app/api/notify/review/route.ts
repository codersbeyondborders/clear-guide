import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/notify/review
 * Stub: logs the review notification payload.
 * Replace with a real email provider (Resend, SendGrid, etc.) in a later sprint.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { manualId, manualName, ownerEmail, ownerName } = body

    // Stub: log the email payload (replace with Resend / SendGrid in production)
    console.log('[notify/review] Email stub —', {
      to: ownerEmail,
      name: ownerName,
      subject: `Manual "${manualName}" has been submitted for review`,
      manualId,
      reviewUrl: `/manufacturer/review/${manualId}`,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ sent: true, stub: true })
  } catch (err) {
    console.error('[notify/review] Error:', err)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
