'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import HomePage from './HomePage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ClientApp() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [focusAreas, setFocusAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: orgsData, error: orgsErr }, { data: faData, error: faErr }] = await Promise.all([
          supabase.from('orgs_with_focus').select('*').order('spend_max_cr', { ascending: false }),
          supabase.from('focus_areas').select('*').order('name')
        ])

        if (orgsErr) throw new Error(orgsErr.message)
        if (faErr) throw new Error(faErr.message)

        setOrgs(orgsData || [])
        setFocusAreas(faData || [])
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
        <div style={{ fontSize: 14, color: '#6b6b67' }}>Loading 35 foundations...</div>
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

  return <HomePage initialOrgs={orgs} focusAreas={focusAreas} totalSpend={totalSpend} />
}
