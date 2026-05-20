import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const focus = searchParams.get('focus')
  const fit   = searchParams.get('fit')
  const q     = searchParams.get('q')

  const { data, error } = await supabase
    .from('orgs_with_focus')
    .select('*')
    .order('spend_max_cr', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let orgs = data || []

  if (focus && focus !== 'all') {
    orgs = orgs.filter((o: any) => o.focus_areas?.includes(focus))
  }
  if (fit && fit !== 'all') {
    orgs = orgs.filter((o: any) => o.saukhyam_fit === fit)
  }
  if (q) {
    const lower = q.toLowerCase()
    orgs = orgs.filter((o: any) =>
      o.name.toLowerCase().includes(lower) ||
      o.parent_company?.toLowerCase().includes(lower) ||
      o.geography?.toLowerCase().includes(lower)
    )
  }

  return NextResponse.json(orgs)
}
