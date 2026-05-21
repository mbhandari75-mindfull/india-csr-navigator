'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import HomePage from './HomePage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BannerCounts {
  grantsOpen: number
  grantsUpcoming: number
  incubatorOrgs: number
  incubatorProgrammes: number
  incubatorCohorts: number
}

export default function ClientApp() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [focusAreas, setFocusAreas] = useState<any[]>([])
  const [bannerCounts, setBannerCounts] = useState<BannerCounts>({ grantsOpen: 0, grantsUpcoming: 0, incubatorOrgs: 0, incubatorProgrammes: 0, incubatorCohorts: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: orgsData, error: orgsErr },
          { data: faData, error: faErr },
          { data: grants },
          { data: incOrgs },
          { data: incProgs },
          { data: incCohorts },
        ] = await Promise.all([
          supabase.from('orgs_with_focus').select('*').order('spend_max_cr', { ascending: false }),
          supabase.from('focus_areas').select('*').order('name'),
          supabase.from('active_grants').select('status').in('status', ['open', 'upcoming']),
          supabase.from('incubators').select('id'),
          supabase.from('incubator_programmes').select('id'),
          supabase.from('incubator_cohorts').select('id, notable_winners'),
        ])

        if (orgsErr) throw new Error(orgsErr.message)
        if (faErr) throw new Error(faErr.message)

        setOrgs(orgsData || [])
        setFocusAreas(faData || [])
        setBannerCounts({
          grantsOpen: (grants || []).filter(g => g.status === 'open').length,
          grantsUpcoming: (grants || []).filter(g => g.status === 'upcoming').length,
          incubatorOrgs: (incOrgs || []).length,
          incubatorProgrammes: (incProgs || []).length,
          incubatorCohorts: (incCohorts || []).filter(c => {
            const w = c.notable_winners
            return w && w !== '' && w !== '{}'
          }).length,
        })
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>India CSR Navigator</div>
        <div style={{ fontSize: 14, color: '#6b6b67' }}>Loading foundations...</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f6' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Connection Error</div>
        <div style={{ fontSize: 13, color: '#d4521e', background: '#fdf1ec', padding: 16, borderRadius: 6, marginBottom: 16 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    </div>
  )

  const totalSpend = Math.round(orgs.reduce((s, o) => s + ((o.spend_min_cr + o.spend_max_cr) / 2), 0))

  return <HomePage initialOrgs={orgs} focusAreas={focusAreas} totalSpend={totalSpend} bannerCounts={bannerCounts} />
}
