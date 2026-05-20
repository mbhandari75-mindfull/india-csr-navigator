// Scoring engine — weights based on India CSR market research
// Focus area match: 35% | NGO size compatibility: 25% | Geography: 20% | Grant size fit: 20%

export interface NGOProfile {
  focusAreas: string[]
  state: string
  size: 'grassroots' | 'growing' | 'established' | 'large'
  grantNeeded: 'small' | 'medium' | 'large' // <₹25L / ₹25L-1Cr / ₹1Cr+
}

const SIZE_COMPATIBILITY: Record<string, Record<string, number>> = {
  // CSR org preference vs NGO size
  grassroots:  { grassroots: 100, growing: 70,  established: 40,  large: 10 },
  growing:     { grassroots: 70,  growing: 100, established: 80,  large: 40 },
  established: { grassroots: 30,  growing: 60,  established: 100, large: 90 },
  large:       { grassroots: 10,  growing: 30,  established: 80,  large: 100 },
}

const GRANT_FIT: Record<string, Record<string, number>> = {
  // Grant size needed vs what org typically gives
  small:  { small: 100, medium: 60, large: 20 },
  medium: { small: 60,  medium: 100, large: 70 },
  large:  { small: 20,  medium: 70,  large: 100 },
}

export function scoreOrg(org: any, profile: NGOProfile): number {
  if (!profile.focusAreas.length) return 0

  // 1. Focus area match (35%)
  const orgFocus: string[] = org.focus_areas || []
  const matchCount = profile.focusAreas.filter(f => orgFocus.includes(f)).length
  const focusScore = Math.min(100, (matchCount / profile.focusAreas.length) * 100)

  // 2. NGO size compatibility (25%)
  const orgSizePref: string = org.ngo_size_preference || 'established'
  const sizeScore = SIZE_COMPATIBILITY[orgSizePref]?.[profile.size] ?? 50

  // 3. Geographic match (20%)
  const orgGeo: string = org.geography || ''
  let geoScore = 30 // default — some national orgs fund everywhere
  if (profile.state === 'Pan-India') {
    geoScore = 80
  } else if (orgGeo.toLowerCase().includes('pan-india') || orgGeo.toLowerCase().includes('national')) {
    geoScore = 80
  } else if (orgGeo.toLowerCase().includes(profile.state.toLowerCase())) {
    geoScore = 100
  } else {
    geoScore = 30
  }

  // 4. Grant size fit (20%)
  const orgGrantTier: string = org.grant_tier || 'medium'
  const grantScore = GRANT_FIT[profile.grantNeeded]?.[orgGrantTier] ?? 50

  const total = Math.round(
    focusScore * 0.35 +
    sizeScore  * 0.25 +
    geoScore   * 0.20 +
    grantScore * 0.20
  )

  return Math.min(100, Math.max(0, total))
}
