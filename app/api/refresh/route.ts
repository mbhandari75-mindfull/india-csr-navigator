import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface AutoCloseResult {
  closed: number
  grants: { programme_name: string; application_deadline: string }[]
  errors: string[]
}

/**
 * Flip grants whose application window has lapsed from 'open' to 'recently_closed'.
 *
 * Only touches status='open' rows with a deadline strictly in the past. Year-round
 * and rolling grants are excluded via is_year_round=false — a NULL is_year_round
 * will not match either, so an unclassified grant is never auto-closed. Rows with a
 * NULL deadline never match `.lt()`, and 'upcoming' rows are out of scope by status.
 *
 * Idempotent: a closed row no longer matches status='open', so the note is appended once.
 */
async function autoCloseLapsedGrants(db: SupabaseClient, today: string): Promise<AutoCloseResult> {
  const result: AutoCloseResult = { closed: 0, grants: [], errors: [] }

  const { data: lapsed, error } = await db
    .from('active_grants')
    .select('id, programme_name, application_deadline, status_notes')
    .eq('status', 'open')
    .eq('is_year_round', false)
    .lt('application_deadline', today)

  if (error) {
    result.errors.push(`select failed: ${error.message}`)
    return result
  }

  for (const g of lapsed || []) {
    const note = `auto-closed, deadline ${g.application_deadline}`
    const { error: updateError } = await db
      .from('active_grants')
      .update({
        status: 'recently_closed',
        status_notes: [g.status_notes, note].filter(Boolean).join(' · '),
      })
      .eq('id', g.id)

    if (updateError) {
      result.errors.push(`${g.programme_name}: ${updateError.message}`)
      continue
    }

    result.closed++
    result.grants.push({ programme_name: g.programme_name, application_deadline: g.application_deadline })
    console.log(`[refresh] auto-closed "${g.programme_name}" (deadline ${g.application_deadline})`)
  }

  return result
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Writes need the service-role key — public RLS only grants read.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let autoClose: AutoCloseResult
  if (!serviceRoleKey) {
    autoClose = { closed: 0, grants: [], errors: ['SUPABASE_SERVICE_ROLE_KEY not set — auto-close skipped'] }
    console.error('[refresh] SUPABASE_SERVICE_ROLE_KEY not set — auto-close skipped')
  } else {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
      auth: { persistSession: false },
    })
    const today = new Date().toISOString().slice(0, 10)
    autoClose = await autoCloseLapsedGrants(admin, today)
    console.log(`[refresh] auto-closed ${autoClose.closed} lapsed grant(s)`)
  }

  const { count: foundationCount } = await supabase
    .from('organisations')
    .select('*', { count: 'exact', head: true })

  const { count: grantCount } = await supabase
    .from('grants')
    .select('*', { count: 'exact', head: true })

  const { data: ngoData } = await supabase
    .from('grants')
    .select('ngo_name')

  const uniqueNGOs = new Set(
    ngoData?.map((g: { ngo_name: string }) => g.ngo_name) || []
  ).size

  const { count: uncheckedCount } = await supabase
    .from('grants')
    .select('*', { count: 'exact', head: true })
    .eq('spot_check_status', 'unchecked')

  const { count: flaggedCount } = await supabase
    .from('grants')
    .select('*', { count: 'exact', head: true })
    .eq('spot_check_status', 'flagged')

  return NextResponse.json({
    refreshed_at: new Date().toISOString(),
    foundations: foundationCount,
    grants: grantCount,
    unique_ngos: uniqueNGOs,
    unchecked_grants: uncheckedCount,
    flagged_grants: flaggedCount,
    auto_closed_count: autoClose.closed,
    auto_closed_grants: autoClose.grants,
    auto_close_errors: autoClose.errors,
    status: autoClose.errors.length > 0 ? 'ok_with_errors' : 'ok'
  })
}
