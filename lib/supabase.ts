import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type OrgType = 'Corporate' | 'Philanthropic' | 'PSU' | 'International'
export type SaukhyamFit = 'High' | 'Medium' | 'Low'
export type OutreachStage = 'Identified' | 'Contacted' | 'Meeting' | 'Proposal Sent' | 'Under Review' | 'Funded' | 'Declined' | 'On Hold'

export interface Organisation {
  id: string
  name: string
  parent_company: string
  type: OrgType
  founded: number
  team_size: string
  spend_label: string
  spend_min_cr: number
  spend_max_cr: number
  gender_score: number
  programmes_count: number
  saukhyam_fit: SaukhyamFit
  description: string
  menstrual_note: string
  grant_size: string
  geography: string
  website: string
  contact_name: string
  contact_title: string
  contact_email: string
  verified: boolean
  notes: string | null
  focus_areas: string[]
}

export interface FocusArea {
  id: number
  name: string
  color: string
  icon: string
}

export interface Outreach {
  id: string
  org_id: string
  date: string
  stage: OutreachStage
  notes: string
  created_by: string
}
