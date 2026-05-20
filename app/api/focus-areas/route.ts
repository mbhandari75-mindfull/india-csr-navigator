import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const [{ data: focusAreas, error: faErr }, { data: orgs, error: orgErr }] = await Promise.all([
    supabase.from('focus_areas').select('*').order('name'),
    supabase.from('orgs_with_focus').select('id, name, saukhyam_fit, focus_areas')
  ])

  if (faErr || orgErr) return NextResponse.json({ error: faErr?.message || orgErr?.message }, { status: 500 })

  const result = (focusAreas || []).map((fa: any) => ({
    ...fa,
    orgs: (orgs || []).filter((o: any) => o.focus_areas?.includes(fa.name))
  }))

  return NextResponse.json(result)
}
