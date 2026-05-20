import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('orgs_with_focus')
    .select('saukhyam_fit, focus_areas, spend_max_cr, spend_min_cr, gender_score, type')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orgs = data || []
  const total = orgs.length
  const highFit = orgs.filter((o: any) => o.saukhyam_fit === 'High').length
  const menstrualFocus = orgs.filter((o: any) => o.focus_areas?.includes('Menstrual Health')).length
  const avgSpend = total
    ? Math.round(orgs.reduce((s: number, o: any) => s + ((o.spend_min_cr + o.spend_max_cr) / 2), 0) / total)
    : 0
  const totalSpend = Math.round(orgs.reduce((s: number, o: any) => s + ((o.spend_min_cr + o.spend_max_cr) / 2), 0))

  const byType = orgs.reduce((acc: any, o: any) => {
    acc[o.type] = (acc[o.type] || 0) + 1
    return acc
  }, {})

  const byFit = orgs.reduce((acc: any, o: any) => {
    acc[o.saukhyam_fit] = (acc[o.saukhyam_fit] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({ total, highFit, menstrualFocus, avgSpend, totalSpend, byType, byFit })
}
