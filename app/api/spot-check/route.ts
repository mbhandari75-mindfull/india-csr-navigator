import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  return process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: grants } = await supabase
    .from('grants')
    .select(`
      id,
      ngo_name,
      amount_lakhs,
      fiscal_year,
      state,
      focus_area,
      programme,
      source_url,
      verified,
      spot_check_status,
      last_spot_checked,
      organisations (name, website)
    `)
    .or(`last_spot_checked.is.null,last_spot_checked.lt.${thirtyDaysAgo.toISOString().split('T')[0]}`)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    records_to_check: grants?.length || 0,
    instructions: 'For each record visit the source_url and verify the grant details are accurate. Update spot_check_status to confirmed or flagged in Supabase.',
    grants
  })
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  const body = await req.json()
  const { id, status } = body // status: 'confirmed' or 'flagged'

  const { error } = await supabase
    .from('grants')
    .update({
      spot_check_status: status,
      last_spot_checked: new Date().toISOString().split('T')[0]
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id, status })
}
