// Sector colour map — consistent across all tabs
export const SECTOR_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'Education':         { bg: '#EEF1F8', text: '#3B5998', border: '#C5CEEA', hex: '#3B5998' },
  'Health & Nutrition':{ bg: '#E8F4F5', text: '#0D7377', border: '#A8D5D7', hex: '#0D7377' },
  'Environment':       { bg: '#EDF5F0', text: '#4A7C59', border: '#B0D4BA', hex: '#4A7C59' },
  'Rural Development': { bg: '#F5EFE6', text: '#8B6F47', border: '#D4C0A4', hex: '#8B6F47' },
  'Livelihoods':       { bg: '#FAF3EB', text: '#C45A1A', border: '#E8D5B0', hex: '#E07A2F' },
  'Women & Girls':     { bg: '#F9EEF2', text: '#B44D6E', border: '#DFB0BF', hex: '#B44D6E' },
  'Water, Sanitation & Hygiene': { bg: '#F3EEF9', text: '#6B4C9A', border: '#C8B8E4', hex: '#6B4C9A' },
  'Menstrual Health':  { bg: '#FFF0E8', text: '#C45A1A', border: '#F0C0A0', hex: '#C45A1A' },
  'Disability & Special Needs': { bg: '#ECEEF8', text: '#5B6EAE', border: '#C5CBE8', hex: '#5B6EAE' },
  'Skill Development': { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80', hex: '#E65100' },
  'Culture, Heritage & Crafts': { bg: '#F5EFE6', text: '#8B4513', border: '#D4B896', hex: '#8B4513' },
}

export function focusStyle(tag: string) {
  return SECTOR_COLORS[tag] || { bg: '#F5F3EE', text: '#6B6560', border: '#E0DDD4', hex: '#6B6560' }
}

export const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'Corporate':     { bg: '#FAF3EB', text: '#C45A1A', label: 'Corporate' },
  'Philanthropic': { bg: '#E8F4F5', text: '#0D7377', label: 'Philanthropic' },
  'PSU':           { bg: '#F3EEF9', text: '#6B4C9A', label: 'PSU / Govt' },
  'International': { bg: '#EEF1F8', text: '#3B5998', label: 'International' },
}

export function typeStyle(type: string) {
  return TYPE_STYLES[type] || { bg: '#F5F3EE', text: '#6B6560', label: type }
}

export function scoreColor(score: number): string {
  if (score >= 75) return '#0D7377'
  if (score >= 50) return '#E07A2F'
  if (score >= 25) return '#B44D6E'
  return '#A0978A'
}

export function scoreLabel(score: number): string {
  if (score >= 75) return 'Strong match'
  if (score >= 50) return 'Good match'
  if (score >= 25) return 'Partial match'
  return 'Weak match'
}

// Size bands stored on ngos.size_band. Distinct from NGO_SIZES below, which is
// the self-reported vocabulary used by the funder-match form — the two overlap
// only on the word "established" and are not interchangeable.
export const SIZE_BANDS: Record<string, { label: string; range: string }> = {
  early_stage: { label: 'Early-stage', range: 'Under ₹50L' },
  emerging:    { label: 'Emerging',    range: '₹50L–₹2Cr' },
  growth:      { label: 'Growth',      range: '₹2Cr–₹10Cr' },
  established: { label: 'Established', range: '₹10Cr–₹100Cr' },
  large_scale: { label: 'Large-scale', range: 'Over ₹100Cr' },
}

export function sizeBandLabel(band: string | null | undefined): string | null {
  if (!band) return null
  const b = SIZE_BANDS[band]
  return b ? `${b.label} (${b.range})` : null
}

export const NGO_SIZES = [
  { value: 'grassroots', label: 'Grassroots', budget: 'Under ₹25L/yr', years: 'Under 3 years', description: 'Early-stage, community-based' },
  { value: 'growing',    label: 'Growing',    budget: '₹25L – ₹1Cr/yr', years: '3–7 years', description: 'Building systems and scale' },
  { value: 'established',label: 'Established',budget: '₹1Cr – ₹10Cr/yr', years: '7–15 years', description: 'Proven track record' },
  { value: 'large',      label: 'Large',      budget: '₹10Cr+/yr', years: '15+ years', description: 'Institutional-grade NGO' },
]

export const FOCUS_AREAS = [
  'Women & Girls', 'Menstrual Health', 'Education', 'Health & Nutrition',
  'Livelihoods', 'Skill Development', 'Environment', 'Rural Development', 'Water, Sanitation & Hygiene', 'Disability & Special Needs', 'Culture, Heritage & Crafts',
]

export const INDIA_STATES = [
  'Pan-India', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu',
  'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Jharkhand',
  'Odisha', 'West Bengal', 'Andhra Pradesh', 'Telangana', 'Kerala',
  'Delhi', 'Haryana', 'Punjab', 'Assam', 'North East India',
]
