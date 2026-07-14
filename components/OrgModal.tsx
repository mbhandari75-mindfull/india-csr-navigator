'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { focusStyle, typeStyle } from '@/lib/colours'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props { org: any; onClose: () => void }

export default function OrgModal({ org, onClose }: Props) {
  const ts = typeStyle(org.type)
  const avgSpend = Math.round((org.spend_min_cr + org.spend_max_cr) / 2)
  const [grants, setGrants] = useState<any[]>([])
  const [grantsLoading, setGrantsLoading] = useState(true)
  const [grantFilter, setGrantFilter] = useState('all')

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  useEffect(() => {
    async function loadGrants() {
      setGrantsLoading(true)
      const { data } = await supabase
        .from('grants')
        .select('*, ngos(slug, name)')
        .eq('org_id', org.id)
        .order('fiscal_year', { ascending: false })
      setGrants(data || [])
      setGrantsLoading(false)
    }
    loadGrants()
  }, [org.id])

  const years = [...new Set(grants.map(g => g.fiscal_year))].sort().reverse()
  const filteredGrants = grantFilter === 'all' ? grants : grants.filter(g => g.fiscal_year === grantFilter)

  const totalGranted = grants.reduce((s, g) => s + (g.amount_lakhs || 0), 0)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#faf9f6', borderRadius: 8, border: '1px solid #e0ddd4', width: '100%', maxWidth: 760, boxShadow: '0 8px 48px rgba(0,0,0,0.12)', marginBottom: 20 }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e0ddd4', background: '#fff', borderRadius: '8px 8px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, margin: 0 }}>{org.name}</h2>
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 3, background: ts.bg, color: ts.text, fontWeight: 600 }}>{ts.label}</span>
                {org.verified && <span style={{ fontSize: 10, color: '#1a7a5a', background: '#edf7f3', border: '1px solid #a8dfc8', padding: '2px 8px', borderRadius: 3, fontWeight: 500 }}>✓ Verified</span>}
              </div>
              <p style={{ fontSize: 13, color: '#2e2e2a', margin: 0 }}>{org.parent_company} · Est. {org.founded} · {org.team_size} team</p>
            </div>
            <button onClick={onClose} style={{ fontSize: 20, color: '#2e2e2a', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 16px', lineHeight: 1 }}>×</button>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Data quality banner */}
          {org.data_quality === 'audited' && org.last_verified_date && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '7px 14px', borderRadius: 6, background: '#EDF7F3', border: '1px solid #A8DFC8', color: '#1a7a5a', marginBottom: -8 }}>
              <span style={{ fontWeight: 700 }}>✓ Manually audited {new Date(org.last_verified_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
              <span style={{ color: '#2e7a5a' }}>— cross-checked against foundation website</span>
            </div>
          )}
          {org.data_quality === 'verified' && org.last_verified_date && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '7px 14px', borderRadius: 6, background: '#F5F3EE', border: '1px solid #D4CFC8', color: '#5C5650', marginBottom: -8 }}>
              <span style={{ fontWeight: 700 }}>✓ Verified from public sources {new Date(org.last_verified_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
          {(!org.data_quality || org.data_quality === 'unaudited') && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '7px 14px', borderRadius: 6, background: '#FFFBF0', border: '1px solid #F0D080', color: '#8B6A00', marginBottom: -8 }}>
              <span style={{ fontWeight: 700 }}>⚠ Awaiting verification</span>
              <span>— data from public filings</span>
            </div>
          )}

          {/* About */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e2e2a', marginBottom: 8, borderBottom: '1px solid #e0ddd4', paddingBottom: 6 }}>About</div>
            <p style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.7, margin: 0 }}>{org.description}</p>
          </section>

          {/* Menstrual health */}
          {org.menstrual_note && (
            <section>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e2e2a', marginBottom: 8, borderBottom: '1px solid #e0ddd4', paddingBottom: 6 }}>Menstrual health relevance</div>
              <div style={{ background: '#fdf1ec', border: '1px solid #f5c0a8', borderRadius: 6, padding: '12px 16px' }}>
                <p style={{ fontSize: 13, color: '#8b3010', lineHeight: 1.6, margin: 0 }}>{org.menstrual_note}</p>
              </div>
            </section>
          )}

          {/* Focus areas */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e2e2a', marginBottom: 8, borderBottom: '1px solid #e0ddd4', paddingBottom: 6 }}>Focus areas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(org.focus_areas || []).map((f: string) => {
                const s = focusStyle(f)
                return <span key={f} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 4, background: s.bg, color: s.text, border: `1px solid ${s.border}`, fontWeight: 500 }}>{f}</span>
              })}
            </div>
          </section>

          {/* Key metrics */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e2e2a', marginBottom: 8, borderBottom: '1px solid #e0ddd4', paddingBottom: 6 }}>Funding profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { val: org.spend_label, lbl: 'Annual CSR budget' },
                { val: `₹${avgSpend} Cr/yr`, lbl: 'Estimated midpoint' },
                { val: `${org.programmes_count}`, lbl: 'Active programmes' },
                { val: org.grant_size, lbl: 'Typical grant size' },
                { val: org.ngo_size_preference || 'All sizes', lbl: 'NGO size preference' },
                { val: `${org.gender_score}/10`, lbl: 'Gender mandate score' },
              ].map(m => (
                <div key={m.lbl} style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 6, padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{m.val}</div>
                  <div style={{ fontSize: 10, color: '#2e2e2a', marginTop: 3 }}>{m.lbl}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Geography */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e2e2a', marginBottom: 8, borderBottom: '1px solid #e0ddd4', paddingBottom: 6 }}>Geographic focus</div>
            <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0 }}>{org.geography}</p>
          </section>

          {/* NGO Grants section */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e2e2a', marginBottom: 12, borderBottom: '1px solid #e0ddd4', paddingBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>NGOs funded ({grants.length} records · ₹{totalGranted >= 100 ? `${(totalGranted/100).toFixed(0)} Cr` : `${totalGranted}L`} documented)</span>
              {years.length > 0 && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setGrantFilter('all')} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, border: `1px solid ${grantFilter === 'all' ? '#1a1a1a' : '#e0ddd4'}`, background: grantFilter === 'all' ? '#1a1a1a' : '#fff', color: grantFilter === 'all' ? '#fff' : '#2e2e2a', cursor: 'pointer' }}>All</button>
                  {years.map(y => (
                    <button key={y} onClick={() => setGrantFilter(y)} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, border: `1px solid ${grantFilter === y ? '#1a1a1a' : '#e0ddd4'}`, background: grantFilter === y ? '#1a1a1a' : '#fff', color: grantFilter === y ? '#fff' : '#2e2e2a', cursor: 'pointer' }}>{y}</button>
                  ))}
                </div>
              )}
            </div>

            {grantsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#2e2e2a', fontSize: 13 }}>Loading grant records...</div>
            ) : filteredGrants.length === 0 ? (
              <div style={{ background: '#f5f3ee', borderRadius: 6, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#2e2e2a' }}>No grant records yet for this foundation.</div>
              </div>
            ) : (() => {
              // Build multi-year map from ALL grants (for badge), display filteredGrants
              const allNgoYears: Record<string, Set<string>> = {}
              grants.forEach(g => {
                if (!allNgoYears[g.ngo_name]) allNgoYears[g.ngo_name] = new Set()
                allNgoYears[g.ngo_name].add(g.fiscal_year)
              })
              // Group filteredGrants by NGO name
              const ngoMap: Record<string, any> = {}
              filteredGrants.forEach(g => {
                if (!ngoMap[g.ngo_name]) {
                  // Prefer the curated ngos row (reached via grants.ngo_id) for the
                  // display name and the profile link; ngo_name is free text and
                  // is often an abbreviation of the real name.
                  ngoMap[g.ngo_name] = { key: g.ngo_name, name: g.ngos?.name || g.ngo_name, slug: g.ngos?.slug || null, grants: [], total: 0 }
                }
                ngoMap[g.ngo_name].grants.push(g)
                ngoMap[g.ngo_name].total += g.amount_lakhs || 0
              })
              const fmt = (l: number) => l >= 100 ? `₹${(l/100).toFixed(0)} Cr` : `₹${l}L`
              const ngoGroups = Object.values(ngoMap).sort((a: any, b: any) => {
                const ay = allNgoYears[a.key]?.size || 1
                const by = allNgoYears[b.key]?.size || 1
                return by - ay || b.total - a.total
              })
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ngoGroups.map((ngo: any) => {
                    const totalYears = allNgoYears[ngo.key]?.size || 1
                    const isMultiYear = totalYears >= 2
                    const ngoGrants = ngo.grants.sort((a: any, b: any) => b.fiscal_year.localeCompare(a.fiscal_year))
                    return (
                      <div key={ngo.key} style={{ border: '1px solid #e0ddd4', borderRadius: 8, overflow: 'hidden' }}>
                        {/* NGO header */}
                        <div style={{ background: '#FAF7F2', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                            {/* Links to the curated profile only when the grant carries an ngo_id. */}
                            {ngo.slug ? (
                              <Link
                                href={`/ngos/${ngo.slug}`}
                                style={{ fontWeight: 700, fontSize: 13, color: '#E07A2F', textDecoration: 'none', textAlign: 'left' }}
                              >{ngo.name}</Link>
                            ) : (
                              <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>{ngo.name}</span>
                            )}
                            {isMultiYear && (
                              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: '#FFF3E8', color: '#E07A2F', border: '1px solid #F0C0A0', fontWeight: 600, flexShrink: 0 }}>★ {totalYears}-year partner</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                            <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{fmt(ngo.total)}</div>
                            <div style={{ fontSize: 9, color: '#6b6560' }}>{ngoGrants.length} record{ngoGrants.length !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        {/* Grant sub-rows */}
                        {ngoGrants.map((g: any, i: number) => {
                          const fs = focusStyle(g.focus_area)
                          return (
                            <div key={g.id} style={{ padding: '8px 14px', borderTop: '1px solid #e0ddd4', background: i % 2 === 0 ? '#fff' : '#FDFCFA', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6b6560', flexShrink: 0, minWidth: 52 }}>{g.fiscal_year}</span>
                              <span style={{ fontSize: 11, color: '#1a1a1a', flex: 1, minWidth: 80 }}>{g.programme || '—'}</span>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>{g.amount_lakhs ? fmt(g.amount_lakhs) : '—'}</span>
                              {g.focus_area && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: fs.bg, color: fs.text, border: `1px solid ${fs.border}`, flexShrink: 0 }}>{g.focus_area}</span>}
                              {g.verified && <span style={{ fontSize: 9, color: '#1a7a5a', fontWeight: 600, flexShrink: 0 }}>✓</span>}
                              {g.source_url && <a href={g.source_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 9, color: '#3d3796', textDecoration: 'none', flexShrink: 0 }}>↗</a>}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </section>

          {/* Contact */}
          <section>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e2e2a', marginBottom: 8, borderBottom: '1px solid #e0ddd4', paddingBottom: 6 }}>Key contact</div>
            <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0ede6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13, color: '#2e2e2a', flexShrink: 0 }}>
                  {org.contact_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{org.contact_name}</span>
                    {org.contact_linkedin && (
                      <a href={org.contact_linkedin} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: '#0A66C2', color: '#fff', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>
                        in Contact ↗
                      </a>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#2e2e2a' }}>{org.contact_title}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '6px 12px', fontSize: 12, borderTop: '1px solid #f0ede6', paddingTop: 10 }}>
                <span style={{ color: '#2e2e2a' }}>Email</span>
                <a href={`mailto:${org.contact_email}`} style={{ color: '#3d3796', textDecoration: 'none' }}>{org.contact_email}</a>
                <span style={{ color: '#2e2e2a' }}>Website</span>
                <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3d3796', textDecoration: 'none' }}>{org.website} ↗</a>
                {org.linkedin_url && (
                  <>
                    <span style={{ color: '#2e2e2a' }}>LinkedIn</span>
                    <a href={org.linkedin_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 10px', borderRadius: 3, background: '#0A66C2', color: '#fff', textDecoration: 'none', fontWeight: 600, width: 'fit-content' }}>
                      in Foundation page ↗
                    </a>
                  </>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
