import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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
    status: 'ok'
  })
}
