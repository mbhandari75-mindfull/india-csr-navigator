'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { focusStyle } from '@/lib/colours'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const S = {
  saffron: '#E07A2F', teal: '#0D7377', ink: '#1A1A1A', muted: '#3D3830',
  faint: '#3D3830', ghost: '#3D3830', cream: '#FAF7F2', creamWarm: '#FAF3EB',
  border: '#E8E4DF', borderWarm: '#E8DDD0', white: '#FFFFFF',
}

interface NGOProfile {
  name: string
  totalFunding: number
  grantCount: number
  funders: string[]
  states: string[]
  focusAreas: string[]
  grants: any[]
  latestYear: string
}

interface Props { onSelectOrg: (org: any) => void; initialSelectedNGO?: string | null; onNGOSelected?: () => void }

const FEATURED_NGO = 'Saukhyam Pads'

export default function NGOTab({ onSelectOrg, initialSelectedNGO, onNGOSelected }: Props) {
  const [grants, setGrants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<NGOProfile | null>(null)
  const [search, setSearch] = useState('')
  const [filterFocus, setFilterFocus] = useState('all')
  const [filterFunder, setFilterFunder] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('grants')
        .select('*, organisations(id, name, type, spend_label)')
        .order('fiscal_year', { ascending: false })
      setGrants(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Auto-select NGO if coming from OrgModal click-through
  useEffect(() => {
    if (!initialSelectedNGO || loading) return
    const profile = Object.values(ngoProfiles).find(n => n.name === initialSelectedNGO)
    if (profile) { setSelected(profile); onNGOSelected?.() }
  }, [initialSelectedNGO, loading])

  // Build NGO profiles from grants
  const ngoProfiles: Record<string, NGOProfile> = {}
  grants.forEach(g => {
    if (!g.ngo_name) return
    if (!ngoProfiles[g.ngo_name]) {
      ngoProfiles[g.ngo_name] = { name: g.ngo_name, totalFunding: 0, grantCount: 0, funders: [], states: [], focusAreas: [], grants: [], latestYear: '' }
    }
    const p = ngoProfiles[g.ngo_name]
    p.totalFunding += g.amount_lakhs || 0
    p.grantCount++
    p.grants.push(g)
    if (g.organisations?.name && !p.funders.includes(g.organisations.name)) p.funders.push(g.organisations.name)
    if (g.state && !p.states.includes(g.state)) p.states.push(g.state)
    if (g.focus_area && !p.focusAreas.includes(g.focus_area)) p.focusAreas.push(g.focus_area)
    if (!p.latestYear || g.fiscal_year > p.latestYear) p.latestYear = g.fiscal_year
  })

  const ngoList = Object.values(ngoProfiles).sort((a, b) => {
    if (a.name === FEATURED_NGO) return -1
    if (b.name === FEATURED_NGO) return 1
    return b.totalFunding - a.totalFunding
  })
  const allFunders = [...new Set(grants.map(g => g.organisations?.name).filter(Boolean))].sort()
  const allFocusAreas = [...new Set(grants.map(g => g.focus_area).filter(Boolean))].sort()

  const filtered = ngoList.filter(n => {
    const matchSearch = !search || n.name.toLowerCase().includes(search.toLowerCase())
    const matchFocus = filterFocus === 'all' || n.focusAreas.includes(filterFocus)
    const matchFunder = filterFunder === 'all' || n.funders.includes(filterFunder)
    return matchSearch && matchFocus && matchFunder
  })

  const formatAmount = (lakhs: number) => lakhs >= 100 ? `₹${(lakhs / 100).toFixed(0)} Cr` : `₹${lakhs}L`

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: S.faint, fontSize: 13 }}>Loading NGO data...</div>

  return (
    <div>
      <div style={{ borderBottom: `2px solid ${S.ink}`, paddingBottom: 12, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: S.ink }}>NGOs in the Database</h2>
        <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>
          {ngoList.length} NGOs derived from {grants.length} verified grant records.
          Click any NGO to see who funded them, how much, and when.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <input type="text" placeholder="Search NGOs…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, width: 220, background: S.white, outline: 'none' }} />
        <select value={filterFocus} onChange={e => setFilterFocus(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, background: S.white, cursor: 'pointer' }}>
          <option value="all">All focus areas</option>
          {allFocusAreas.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterFunder} onChange={e => setFilterFunder(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, background: S.white, cursor: 'pointer' }}>
          <option value="all">All funders</option>
          {allFunders.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: S.faint, alignSelf: 'center' }}>{filtered.length} NGOs shown</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16, alignItems: 'start' }}>

        {/* NGO cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {filtered.map(ngo => {
            const isSelected = selected?.name === ngo.name
            const primaryFocus = ngo.focusAreas[0]
            const s = focusStyle(primaryFocus || '')
            return (
              <button key={ngo.name} onClick={() => setSelected(isSelected ? null : ngo)} style={{
                textAlign: 'left', background: isSelected ? S.creamWarm : S.white,
                border: `1px solid ${isSelected ? S.borderWarm : S.border}`,
                borderTop: `3px solid ${isSelected ? S.saffron : s.hex || S.border}`,
                borderRadius: 8, padding: '16px', cursor: 'pointer',
                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.12s',
              }}>
                {/* NGO name */}
                <div style={{ fontWeight: 600, fontSize: 13, color: S.ink, lineHeight: 1.3, marginBottom: 4 }}>{ngo.name}</div>
                {ngo.name === FEATURED_NGO && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, padding: '2px 7px', borderRadius: 3, background: '#FFF3E8', color: '#C45A1A', border: '1px solid #F0C0A0', marginBottom: 6, fontWeight: 600, letterSpacing: '0.03em' }}>
                    ★ Built for this tool
                  </div>
                )}

                {/* Focus tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 10 }}>
                  {ngo.focusAreas.slice(0, 3).map(f => {
                    const fs = focusStyle(f)
                    return <span key={f} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: fs.bg, color: fs.text, border: `1px solid ${fs.border}` }}>{f}</span>
                  })}
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: `1px solid ${S.border}`, paddingTop: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: S.ink }}>{formatAmount(ngo.totalFunding)}</div>
                    <div style={{ fontSize: 9, color: S.faint, marginTop: 1 }}>Total funded</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: S.ink }}>{ngo.funders.length}</div>
                    <div style={{ fontSize: 9, color: S.faint, marginTop: 1 }}>Funder{ngo.funders.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: S.ink }}>{ngo.grantCount}</div>
                    <div style={{ fontSize: 9, color: S.faint, marginTop: 1 }}>Grant record{ngo.grantCount !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                {/* Geography */}
                {ngo.states.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 10, color: S.faint }}>
                    📍 {ngo.states.slice(0, 2).join(', ')}{ngo.states.length > 2 ? ` +${ngo.states.length - 2} more` : ''}
                  </div>
                )}

                {/* Latest year */}
                <div style={{ marginTop: 4, fontSize: 10, color: S.ghost }}>Latest: {ngo.latestYear}</div>
              </button>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: S.faint, fontSize: 13, gridColumn: '1/-1' }}>No NGOs match your filters.</div>
          )}
        </div>

        {/* NGO detail panel */}
        {selected && (
          <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 8, padding: '20px', position: 'sticky', top: 80, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: S.ink }}>{selected.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selected.focusAreas.map(f => {
                    const s = focusStyle(f)
                    return <span key={f} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{f}</span>
                  })}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ fontSize: 18, color: S.faint, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Featured NGO note */}
            {selected.name === FEATURED_NGO && (
              <div style={{ background: '#FFF3E8', border: '1px solid #F0C0A0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#8B3E0A', lineHeight: 1.5 }}>
                <strong style={{ color: '#C45A1A' }}>★ This tool was built for Saukhyam Pads.</strong> India CSR Navigator was originally created to help this organisation find CSR funders for their reusable pad programme.
              </div>
            )}

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { val: formatAmount(selected.totalFunding), lbl: 'Total documented funding' },
                { val: `${selected.grantCount} records`, lbl: 'Grant records in database' },
                { val: `${selected.funders.length} funder${selected.funders.length !== 1 ? 's' : ''}`, lbl: 'CSR foundations' },
                { val: selected.latestYear, lbl: 'Most recent grant' },
              ].map(m => (
                <div key={m.lbl} style={{ background: S.cream, borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: S.ink }}>{m.val}</div>
                  <div style={{ fontSize: 10, color: S.faint, marginTop: 2 }}>{m.lbl}</div>
                </div>
              ))}
            </div>

            {/* Funding history summary line */}
            {(() => {
              const allYears = [...new Set(selected.grants.map((g: any) => g.fiscal_year))].sort()
              const yearRange = allYears.length > 1 ? `${allYears[0]}–${allYears[allYears.length - 1]}` : allYears[0]
              return (
                <div style={{ fontSize: 11, color: S.muted, background: S.cream, borderRadius: 6, padding: '8px 12px', marginBottom: 16, lineHeight: 1.5 }}>
                  Funded by <strong style={{ color: S.ink }}>{selected.funders.length}</strong> foundation{selected.funders.length !== 1 ? 's' : ''} · <strong style={{ color: S.ink }}>{formatAmount(selected.totalFunding)}</strong> total · <strong style={{ color: S.ink }}>{allYears.length} year{allYears.length !== 1 ? 's' : ''}</strong> funding history{allYears.length > 0 ? ` (${yearRange})` : ''}
                </div>
              )
            })()}

            {/* Grouped funders with multi-year history */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.faint, marginBottom: 8 }}>Funding history by foundation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(() => {
                  const funderGroups = selected.funders.map((funderName: string) => {
                    const funderGrants = selected.grants
                      .filter((g: any) => g.organisations?.name === funderName)
                      .sort((a: any, b: any) => b.fiscal_year.localeCompare(a.fiscal_year))
                    const total = funderGrants.reduce((s: number, g: any) => s + (g.amount_lakhs || 0), 0)
                    const years = [...new Set(funderGrants.map((g: any) => g.fiscal_year))] as string[]
                    const funderOrg = funderGrants[0]?.organisations
                    return { funderName, funderGrants, total, years, funderOrg }
                  }).sort((a: any, b: any) => b.years.length - a.years.length || b.total - a.total)

                  return funderGroups.map(({ funderName, funderGrants, total, years, funderOrg }: any) => (
                    <div key={funderName} style={{ border: `1px solid ${S.border}`, borderRadius: 8, overflow: 'hidden' }}>
                      {/* Funder header row */}
                      <div style={{ background: S.cream, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                          <button
                            onClick={() => funderOrg && onSelectOrg(funderOrg)}
                            style={{ fontWeight: 700, fontSize: 12, color: funderOrg ? S.saffron : S.ink, background: 'none', border: 'none', padding: 0, cursor: funderOrg ? 'pointer' : 'default', textAlign: 'left', textDecoration: funderOrg ? 'underline' : 'none', textDecorationColor: 'transparent' }}
                            onMouseEnter={e => { if (funderOrg) (e.currentTarget as HTMLElement).style.textDecorationColor = S.saffron }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecorationColor = 'transparent' }}
                          >{funderName}</button>
                          {years.length >= 2 && (
                            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: '#FFF3E8', color: S.saffron, border: `1px solid #F0C0A0`, fontWeight: 600, flexShrink: 0 }}>★ multi-year partner</span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: S.ink }}>{formatAmount(total)}</div>
                          <div style={{ fontSize: 9, color: S.faint }}>{years.length} year{years.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      {/* Grant sub-rows */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {funderGrants.map((g: any, i: number) => {
                          const fs = focusStyle(g.focus_area)
                          return (
                            <div key={g.id} style={{ padding: '8px 12px', borderTop: `1px solid ${S.border}`, background: i % 2 === 0 ? S.white : '#FDFCFA', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: S.muted, flexShrink: 0, minWidth: 52 }}>{g.fiscal_year}</span>
                              <span style={{ fontSize: 11, color: S.ink, flex: 1, minWidth: 80 }}>{g.programme || '—'}</span>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: S.ink, flexShrink: 0 }}>{g.amount_lakhs ? formatAmount(g.amount_lakhs) : '—'}</span>
                              {g.verified && <span style={{ fontSize: 9, color: '#0D7377', fontWeight: 600, flexShrink: 0 }}>✓</span>}
                              {g.source_url && <a href={g.source_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 9, color: '#3B5998', textDecoration: 'none', flexShrink: 0 }}>↗</a>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
