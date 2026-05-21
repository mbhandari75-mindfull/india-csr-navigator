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

export interface Incubator {
  id: string
  name: string
  slug: string
  incubator_type: 'social_enterprise' | 'institutional' | 'government' | 'sector_specific' | 'foundation_backed' | 'international'
  description: string | null
  hq_city: string | null
  hq_country: string | null
  year_founded: number | null
  website: string | null
  founder_or_ceo: string | null
  sectors: string[] | null
  geographic_focus: string | null
  total_startups_supported: number | null
  total_funding_deployed: string | null
  lives_impacted: string | null
  jobs_created: string | null
  recognition: string | null
  application_model: string | null
  application_url: string | null
  source_url: string | null
  data_quality: string | null
  verified: boolean
}

export interface IncubatorProgramme {
  id: string
  incubator_id: string
  programme_name: string
  programme_type: 'incubator' | 'accelerator' | 'fellowship' | 'award' | 'challenge' | 'hybrid' | 'fund'
  description: string | null
  duration_months: number | null
  sector_focus: string[] | null
  funding_amount_text: string | null
  funding_type: string | null
  equity_taken: string | null
  eligibility_criteria: string | null
  applicant_stage: string | null
  mentorship_provided: boolean | null
  network_access: boolean | null
  lab_facility: boolean | null
  follow_on_funding: boolean | null
  support_details: string | null
  cohorts_per_year: number | null
  application_url: string | null
  partners: string[] | null
  status: string | null
  source_url: string | null
  incubator_cohorts?: IncubatorCohort[]
}

export interface IncubatorCohort {
  id: string
  programme_id: string
  cohort_name: string | null
  cohort_year: number | null
  cohort_period: string | null
  announcement_date: string | null
  sector_focus: string[] | null
  number_of_winners: number | null
  total_funding_text: string | null
  description: string | null
  notable_winners: string[] | null
  source_url: string | null
  data_quality: string | null
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
