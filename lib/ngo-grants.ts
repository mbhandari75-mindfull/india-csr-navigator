import type { NgoGrant } from './supabase-server'

// Some rows in `grants` carry an ngo_id but no funder, no amount and no
// programme — placeholder records with nothing to show. They are excluded from
// funding history so they don't render as blank rows or inflate grant counts.
export function isMeaningfulGrant(g: NgoGrant): boolean {
  return Boolean(g.organisations?.name || g.amount_lakhs || g.programme)
}

// Grants can carry a valid ngo_id (recipient) while org_id (funder) is null.
// Those still represent real money, so they group here rather than being
// dropped for lacking a funder to group under.
export const UNATTRIBUTED = 'Funder not recorded'

export interface FunderGroup {
  name: string
  rows: NgoGrant[]
  total: number
  years: string[]
  org: NgoGrant['organisations']
  attributed: boolean
}

export function groupByFunder(grants: NgoGrant[]): FunderGroup[] {
  const meaningful = grants.filter(isMeaningfulGrant)

  const build = (name: string, rows: NgoGrant[], attributed: boolean): FunderGroup => ({
    name,
    rows: [...rows].sort((a, b) => (b.fiscal_year || '').localeCompare(a.fiscal_year || '')),
    total: rows.reduce((s, g) => s + (g.amount_lakhs || 0), 0),
    years: Array.from(new Set(rows.map(g => g.fiscal_year).filter((y): y is string => Boolean(y) && y !== 'N/A'))),
    org: rows[0]?.organisations ?? null,
    attributed,
  })

  const named = Array.from(new Set(
    meaningful.map(g => g.organisations?.name).filter((x): x is string => Boolean(x))
  ))
    .map(name => build(name, meaningful.filter(g => g.organisations?.name === name), true))
    .sort((a, b) => b.years.length - a.years.length || b.total - a.total)

  const orphans = meaningful.filter(g => !g.organisations?.name)
  return orphans.length ? [...named, build(UNATTRIBUTED, orphans, false)] : named
}
