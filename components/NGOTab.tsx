'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { focusStyle } from '@/lib/colours'
import { isMeaningfulGrant } from '@/lib/ngo-grants'
import type { Ngo, NgoGrant } from '@/lib/supabase-server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const S = {
  saffron: '#E07A2F', ink: '#1A1A1A', muted: '#3D3830', faint: '#3D3830',
  ghost: '#9A9A94', cream: '#FAF7F2', border: '#E8E4DF', white: '#FFFFFF',
}

const FEATURED_SLUG = 'saukhyam-foundation'

// A row from `ngos` plus the funding facts derived from its linked grants.
interface NgoRow extends Ngo {
  focusAreas: string[]
  funders: string[]
  grantCount: number
  totalFunding: number
}

export default function NGOTab() {
  const [ngos, setNgos] = useState<NgoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFocus, setFilterFocus] = useState('all')
  const [filterFunder, setFilterFunder] = useState('all')

  useEffect(() => {
    async function load() {
      // Profiles come from `ngos` (the curated table). Funding facts come from
      // grants.ngo_id — the recipient link — with the funder read through
      // grants.org_id -> organisations. No name-matching anywhere.
      const [{ data: ngoData }, { data: grantData }] = await Promise.all([
        supabase.from('ngos').select('*, ngo_focus_areas(focus_areas(name))').order('name'),
        supabase
          .from('grants')
          .select('id, ngo_id, org_id, amount_lakhs, fiscal_year, programme, organisations(id, name, type)')
          .not('ngo_id', 'is', null),
      ])

      const grants = (grantData || []) as unknown as NgoGrant[]

      const rows: NgoRow[] = ((ngoData || []) as Ngo[]).map(n => {
        // Placeholder grant rows (no funder, no amount, no programme) are
        // excluded so card counts match what the profile page actually shows.
        const mine = grants.filter(g => g.ngo_id === n.id && isMeaningfulGrant(g))
        return {
          ...n,
          focusAreas: (n.ngo_focus_areas || [])
            .map(f => f.focus_areas?.name)
            .filter((x): x is string => Boolean(x))
            .sort(),
          funders: Array.from(new Set(mine.map(g => g.organisations?.name).filter((x): x is string => Boolean(x)))),
          grantCount: mine.length,
          totalFunding: mine.reduce((s, g) => s + (g.amount_lakhs || 0), 0),
        }
      })

      setNgos(rows)
      setLoading(false)
    }
    load()
  }, [])

  const allFocusAreas = useMemo(
    () => Array.from(new Set(ngos.flatMap(n => n.focusAreas))).sort(),
    [ngos]
  )
  const allFunders = useMemo(
    () => Array.from(new Set(ngos.flatMap(n => n.funders))).sort(),
    [ngos]
  )

  const sorted = useMemo(() => [...ngos].sort((a, b) => {
    if (a.slug === FEATURED_SLUG) return -1
    if (b.slug === FEATURED_SLUG) return 1
    if (b.totalFunding !== a.totalFunding) return b.totalFunding - a.totalFunding
    return a.name.localeCompare(b.name)
  }), [ngos])

  const filtered = useMemo(() => sorted.filter(n => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q
      || n.name.toLowerCase().includes(q)
      || (n.description || '').toLowerCase().includes(q)
      || (n.states || []).some(s => s.toLowerCase().includes(q))
    const matchFocus = filterFocus === 'all' || n.focusAreas.includes(filterFocus)
    const matchFunder = filterFunder === 'all' || n.funders.includes(filterFunder)
    return matchSearch && matchFocus && matchFunder
  }), [sorted, search, filterFocus, filterFunder])

  const formatAmount = (lakhs: number) =>
    lakhs >= 100 ? `₹${(lakhs / 100).toFixed(lakhs % 100 === 0 ? 0 : 1)} Cr` : `₹${lakhs}L`

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48, color: S.faint, fontSize: 13 }}>Loading NGO profiles…</div>
  }

  return (
    <div>
      <div style={{ borderBottom: `2px solid ${S.ink}`, paddingBottom: 12, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: S.ink }}>NGO Profiles</h2>
        <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>
          {ngos.length} curated NGO profiles. Click any NGO for its full profile — focus areas,
          registrations, leadership, and documented funding history.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <input
          type="text" placeholder="Search NGOs…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, width: 220, background: S.white, outline: 'none' }}
        />
        <select value={filterFocus} onChange={e => setFilterFocus(e.target.value)}
          style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, background: S.white, cursor: 'pointer' }}>
          <option value="all">All focus areas</option>
          {allFocusAreas.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterFunder} onChange={e => setFilterFunder(e.target.value)}
          style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, background: S.white, cursor: 'pointer' }}>
          <option value="all">All funders</option>
          {allFunders.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: S.faint, alignSelf: 'center' }}>
          {filtered.length} of {ngos.length} NGOs
        </div>
      </div>

      {/* NGO cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {filtered.map(ngo => {
          const s = focusStyle(ngo.focusAreas[0] || '')
          const states = ngo.states || []

          const card = (
            <div style={{
              background: S.white, border: `1px solid ${S.border}`,
              borderTop: `3px solid ${s.hex}`, borderRadius: 8, padding: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%', boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: S.ink, lineHeight: 1.3, flex: 1, overflowWrap: 'break-word' }}>
                  {ngo.name}
                </div>
                {ngo.verified && (
                  <span title="Verified" style={{ fontSize: 9, fontWeight: 700, color: '#1A5C2E', background: '#E8F4ED', border: '1px solid #B7DCC4', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>✓</span>
                )}
              </div>

              {ngo.slug === FEATURED_SLUG && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, padding: '2px 7px', borderRadius: 3, background: '#FFF3E8', color: '#C45A1A', border: '1px solid #F0C0A0', marginBottom: 6, fontWeight: 600, letterSpacing: '0.03em' }}>
                  ★ Built for this tool
                </div>
              )}

              {ngo.focusAreas.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 10 }}>
                  {ngo.focusAreas.slice(0, 3).map(f => {
                    const fs = focusStyle(f)
                    return (
                      <span key={f} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: fs.bg, color: fs.text, border: `1px solid ${fs.border}` }}>{f}</span>
                    )
                  })}
                  {ngo.focusAreas.length > 3 && (
                    <span style={{ fontSize: 9, padding: '2px 7px', color: S.ghost }}>+{ngo.focusAreas.length - 3}</span>
                  )}
                </div>
              )}

              {/* Funding facts — only where grant links exist */}
              {ngo.grantCount > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: `1px solid ${S.border}`, paddingTop: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: S.ink }}>{formatAmount(ngo.totalFunding)}</div>
                    <div style={{ fontSize: 9, color: S.ghost, marginTop: 1 }}>Documented</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: S.ink }}>{ngo.funders.length}</div>
                    <div style={{ fontSize: 9, color: S.ghost, marginTop: 1 }}>Funder{ngo.funders.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: S.ink }}>{ngo.grantCount}</div>
                    <div style={{ fontSize: 9, color: S.ghost, marginTop: 1 }}>Grant{ngo.grantCount !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ) : (
                <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 10, fontSize: 10, color: S.ghost, fontStyle: 'italic' }}>
                  Funding history not yet recorded
                </div>
              )}

              {states.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 10, color: S.ghost }}>
                  📍 {states.slice(0, 2).join(', ')}{states.length > 2 ? ` +${states.length - 2} more` : ''}
                </div>
              )}
            </div>
          )

          // Guard: an NGO without a slug must not link to /ngos/undefined.
          if (!ngo.slug) return <div key={ngo.id}>{card}</div>

          return (
            <Link key={ngo.id} href={`/ngos/${ngo.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              {card}
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: S.faint, fontSize: 13, gridColumn: '1/-1' }}>
            No NGOs match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
