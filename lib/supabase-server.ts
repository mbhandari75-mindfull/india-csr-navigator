import { createClient } from '@supabase/supabase-js'

// Server-side client — uses anon key (public read RLS is sufficient)
// Only called from Server Components, never shipped to the client bundle
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export interface ActiveGrant {
  id: string
  org_id: string
  programme_name: string
  programme_slug: string
  programme_description: string | null
  focus_areas: string[]
  geography: string[] | null
  rural_urban: string | null
  entity_type: string
  eligibility_summary: string | null
  eligibility_details: string | null
  min_ngo_age_years: number | null
  fcra_required: boolean | null
  min_annual_budget_lakhs: number | null
  languages_supported: string[] | null
  grant_size_min_lakhs: number | null
  grant_size_max_lakhs: number | null
  grant_size_text: string | null
  duration_text: string | null
  co_funding_policy: string | null
  grant_purpose: string[] | null
  reporting_burden: string | null
  application_url: string | null
  source_url: string | null
  previous_grantees_url: string | null
  application_start: string | null
  application_deadline: string | null
  is_year_round: boolean
  status: 'open' | 'upcoming' | 'recently_closed'
  status_notes: string | null
  routing_notes: string | null
  routing_type: string | null
  is_featured: boolean
  notes: string | null
  last_verified_at: string | null
  organisations: { id: string; name: string } | null
}
