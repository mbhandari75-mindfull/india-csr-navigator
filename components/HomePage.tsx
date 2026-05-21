'use client'

import { useState, useMemo, useCallback } from 'react'
import { track } from '@vercel/analytics'
import { scoreOrg, NGOProfile } from '@/lib/scoring'
import { focusStyle, typeStyle, scoreColor, scoreLabel, NGO_SIZES, FOCUS_AREAS, INDIA_STATES } from '@/lib/colours'
import { exportCSV, exportJSON } from '@/lib/export'
import OrgModal from './OrgModal'
import FocusLandscape from './FocusLandscape'
import OverviewTab from './OverviewTab'
import NGOTab from './NGOTab'

type Tab = 'overview' | 'navigator' | 'directory' | 'focus' | 'ngos' | 'guide' | 'about'

interface Props {
  initialOrgs: any[]
  focusAreas: any[]
  totalSpend: number
}

const S = {
  saffron: '#E07A2F',
  teal: '#0D7377',
  moss: '#4A7C59',
  ink: '#1A1A1A',
  muted: '#3D3830',
  faint: '#3D3830',
  ghost: '#3D3830',
  cream: '#FAF7F2',
  creamWarm: '#FAF3EB',
  border: '#E8E4DF',
  borderWarm: '#E8DDD0',
  white: '#FFFFFF',
}

export default function HomePage({ initialOrgs, focusAreas, totalSpend }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [activeFilter, setActiveFilter] = useState('all')
  const [fitFilter, setFitFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null)
  const [selectedNGOName, setSelectedNGOName] = useState<string | null>(null)
  const [ngoFocus, setNgoFocus] = useState<string[]>([])
  const [ngoState, setNgoState] = useState('Pan-India')
  const [ngoSize, setNgoSize] = useState<string>('')
  const [grantNeeded, setGrantNeeded] = useState<string>('')
  const [hasSearched, setHasSearched] = useState(false)
  const [dirSearch, setDirSearch] = useState('')
  const [dirType, setDirType] = useState('all')
  const [dirSort, setDirSort] = useState('spend')

  const profile: NGOProfile | null = (hasSearched && ngoFocus.length)
    ? { focusAreas: ngoFocus, state: ngoState, size: (ngoSize || 'growing') as any, grantNeeded: (grantNeeded || 'medium') as any }
    : null

  const scoredOrgs = useMemo(() => {
    if (!profile) return []
    return [...initialOrgs]
      .map(o => ({ ...o, _score: scoreOrg(o, profile) }))
      .filter(o => o._score > 0)
      .sort((a, b) => b._score - a._score)
  }, [initialOrgs, profile])

  const directoryOrgs = useMemo(() => {
    let orgs = initialOrgs
    if (activeFilter !== 'all') orgs = orgs.filter(o => o.focus_areas?.includes(activeFilter))
    if (dirType !== 'all') orgs = orgs.filter(o => o.type === dirType)
    if (dirSearch.trim()) {
      const q = dirSearch.toLowerCase()
      orgs = orgs.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.parent_company?.toLowerCase().includes(q) ||
        o.geography?.toLowerCase().includes(q)
      )
    }
    if (dirSort === 'spend') orgs = [...orgs].sort((a, b) => b.spend_max_cr - a.spend_max_cr)
    if (dirSort === 'name') orgs = [...orgs].sort((a, b) => a.name.localeCompare(b.name))
    if (dirSort === 'gender') orgs = [...orgs].sort((a, b) => b.gender_score - a.gender_score)
    return orgs
  }, [initialOrgs, activeFilter, dirType, dirSearch, dirSort])

  const toggleFocus = (f: string) => setNgoFocus(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  const openOrg = useCallback((org: any) => {
    track('org_opened', { org_name: org.name, org_type: org.type })
    setSelectedOrg(org)
  }, [])
  const closeOrg = useCallback(() => setSelectedOrg(null), [])
  const handleSelectNGO = useCallback((ngoName: string) => {
    setSelectedOrg(null)
    setSelectedNGOName(ngoName)
    setTab('ngos')
  }, [])
  const handleFind = () => {
    if (ngoFocus.length) {
      track('match_run', { focus_areas: ngoFocus.join(', '), state: ngoState })
      setHasSearched(true)
    }
  }
  const handleReset = () => { setNgoFocus([]); setNgoSize(''); setGrantNeeded(''); setNgoState('Pan-India'); setHasSearched(false) }
  const handleTabChange = (tabId: Tab) => {
    track('tab_viewed', { tab: tabId })
    setTab(tabId)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'CSR Overview' },
    { id: 'navigator', label: 'CSR Match' },
    { id: 'directory', label: 'Foundations' },
    { id: 'focus', label: 'Sectors' },
    { id: 'ngos', label: 'NGO Profiles' },
    { id: 'guide', label: 'HowTo Guide' },
    { id: 'about', label: 'About the Data' },
  ]

  const verifiedCount = initialOrgs.filter(o => o.verified).length

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: S.cream }}>

      {/* Masthead */}
      <header style={{ background: S.white, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: S.muted, textTransform: 'uppercase', fontWeight: 500 }}>
              An independent research initiative · India
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 10, color: S.muted, letterSpacing: '0.08em' }}>
              <span>{initialOrgs.length} foundations tracked</span>
              <span>·</span>
              <span>Updated May 2026</span>
              <span>·</span>
              <button onClick={() => exportCSV(initialOrgs)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.muted, fontSize: 10, letterSpacing: '0.08em' }}>↓ CSV</button>
              <button onClick={() => exportJSON(initialOrgs)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.muted, fontSize: 10, letterSpacing: '0.08em' }}>↓ JSON</button>
            </div>
          </div>
          {/* Title */}
          <div style={{ padding: '18px 0 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, color: S.ink, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
                India CSR Navigator
              </h1>
              <p style={{ fontSize: 13, color: '#3D3830', margin: '5px 0 0', fontWeight: 300 }}>
                ₹34,909 crore was spent on CSR in India last year. Find the foundations that fund work like yours.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <input
                type="text" placeholder="Search foundations…"
                value={search} onChange={e => {
                  const q = e.target.value
                  setSearch(q)
                  setDirSearch(q)
                  if (q.length >= 3) track('search_used', { query: q })
                }}
                style={{ width: 220, padding: '8px 14px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 13, background: S.cream, color: S.ink, outline: 'none' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav style={{ background: S.white, borderBottom: `2px solid ${S.ink}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
            {/* CSR Overview first */}
            {tabs.slice(0, 1).map(t => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
                padding: '11px 18px', fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? S.ink : S.muted,
                background: 'none', border: 'none',
                borderBottom: tab === t.id ? `3px solid ${S.saffron}` : '3px solid transparent',
                cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap',
                marginBottom: -2, letterSpacing: '0.02em',
              }}>
                {t.label}
              </button>
            ))}
            {/* External section tabs: Open Grants → Incubators */}
            <a href="/grants" style={{
              padding: '11px 18px', fontSize: 12, fontWeight: 400,
              color: S.muted,
              textDecoration: 'none', whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: '3px solid transparent',
              marginBottom: -2,
            }}>
              Open Grants
              <span style={{ background: '#EA580C', color: '#FFFFFF', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.2 }}>NEW</span>
            </a>
            <a href="/incubators" style={{
              padding: '11px 18px', fontSize: 12, fontWeight: 400,
              color: S.muted,
              textDecoration: 'none', whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: '3px solid transparent',
              marginBottom: -2,
            }}>
              Incubators
              <span style={{ background: '#EA580C', color: '#FFFFFF', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.2 }}>NEW</span>
            </a>
            {/* Remaining tabs: CSR Match, Foundations, Sectors, etc. */}
            {tabs.slice(1).map(t => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
                padding: '11px 18px', fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? S.ink : S.muted,
                background: 'none', border: 'none',
                borderBottom: tab === t.id ? `3px solid ${S.saffron}` : '3px solid transparent',
                cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap',
                marginBottom: -2, letterSpacing: '0.02em',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Open Grants banner strip — homepage only */}
      {tab === 'overview' && (
        <div style={{ background: '#FFFDF5', borderBottom: '1px solid #F0D5A0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1A5C2E', background: '#E8F4ED', padding: '2px 8px', borderRadius: 10, fontFamily: 'JetBrains Mono, monospace' }}>14 open</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#3B5998', background: '#EEF1F8', padding: '2px 8px', borderRadius: 10, fontFamily: 'JetBrains Mono, monospace' }}>1 upcoming</span>
            <span style={{ fontSize: 13, color: '#5C5650' }}>14 grants open · 1 upcoming — CSR funding for NGOs and social enterprises.</span>
            <a href="/grants" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#E07A2F', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              View all open grants →
            </a>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 24px 80px' }}>

        {tab === 'overview' && (
          <OverviewTab orgs={initialOrgs} onTabChange={handleTabChange} />
        )}

        {tab === 'navigator' && (
          <div>
            {/* Navigator form */}
            <div style={{ background: S.white, border: `1px solid ${S.border}`, borderTop: `3px solid ${S.saffron}`, borderRadius: 12, padding: '28px 32px', marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: S.ink }}>Find your matching CSR foundations</h2>
                <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>Tell us about your organisation — we score every foundation for fit.</p>
              </div>

              {/* Focus areas */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.muted, marginBottom: 10 }}>
                  1. What does your organisation work on? <span style={{ color: S.saffron }}>*</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {FOCUS_AREAS.map(f => {
                    const s = focusStyle(f)
                    const active = ngoFocus.includes(f)
                    return (
                      <button key={f} onClick={() => toggleFocus(f)} style={{
                        padding: '7px 16px', borderRadius: 999, fontSize: 12, fontWeight: active ? 600 : 400,
                        cursor: 'pointer', transition: 'all 0.12s', border: `1px solid ${active ? s.border : S.border}`,
                        background: active ? s.bg : S.white, color: active ? s.text : S.muted,
                      }}>
                        {active && '✓ '}{f}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.muted, marginBottom: 7 }}>2. Where do you work?</div>
                  <select value={ngoState} onChange={e => setNgoState(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 13, background: S.white, color: S.ink, cursor: 'pointer' }}>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.muted, marginBottom: 7 }}>3. Organisation size <span style={{ color: S.ghost, fontWeight: 400 }}>(optional)</span></div>
                  <select value={ngoSize} onChange={e => setNgoSize(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 13, background: S.white, color: ngoSize ? S.ink : S.faint, cursor: 'pointer' }}>
                    <option value="">Select size...</option>
                    {NGO_SIZES.map(s => <option key={s.value} value={s.value}>{s.label} — {s.budget}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.muted, marginBottom: 7 }}>4. Grant size needed <span style={{ color: S.ghost, fontWeight: 400 }}>(optional)</span></div>
                  <select value={grantNeeded} onChange={e => setGrantNeeded(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 13, background: S.white, color: grantNeeded ? S.ink : S.faint, cursor: 'pointer' }}>
                    <option value="">Select amount...</option>
                    <option value="small">Under ₹25 lakh</option>
                    <option value="medium">₹25 lakh – ₹1 crore</option>
                    <option value="large">₹1 crore+</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button onClick={handleFind} disabled={!ngoFocus.length} style={{
                  padding: '11px 28px', background: !ngoFocus.length ? S.border : S.ink,
                  color: !ngoFocus.length ? S.faint : S.cream,
                  border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  cursor: !ngoFocus.length ? 'not-allowed' : 'pointer', letterSpacing: '0.02em',
                }}>
                  Find matching foundations →
                </button>
                {hasSearched && <button onClick={handleReset} style={{ fontSize: 12, color: S.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Reset</button>}
                {!ngoFocus.length && <span style={{ fontSize: 12, color: S.muted }}>Select at least one focus area</span>}
              </div>
            </div>

            {/* Scored results */}
            {hasSearched && (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, borderBottom: `1px solid ${S.border}`, paddingBottom: 12 }}>
                  <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, margin: 0, color: S.ink }}>{scoredOrgs.length} foundations matched</h3>
                  <span style={{ fontSize: 13, color: S.muted }}>ranked by fit score · <button onClick={() => setTab('directory')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.saffron, fontSize: 13 }}>View full directory →</button></span>
                </div>

                {/* Top 3 podium */}
                {scoredOrgs.length >= 3 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                    {scoredOrgs.slice(0, 3).map((org, i) => {
                      const ts = typeStyle(org.type)
                      const col = scoreColor(org._score)
                      return (
                        <button key={org.id} onClick={() => openOrg(org)} style={{
                          textAlign: 'left', borderRadius: 12, padding: '20px 20px 16px', cursor: 'pointer',
                          background: i === 0 ? S.creamWarm : S.white,
                          border: `1px solid ${i === 0 ? S.borderWarm : S.border}`,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
                        }}>
                          <span style={{ position: 'absolute', top: 12, right: 16, fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 48, color: S.border, fontWeight: 700, lineHeight: 1 }}>{i + 1}</span>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: col, marginBottom: 2 }}>{org._score}%</div>
                          <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, fontWeight: 700, color: S.ink, marginBottom: 3, lineHeight: 1.3 }}>{org.name}</div>
                          <div style={{ fontSize: 11, color: S.muted, marginBottom: 10 }}>{org.parent_company}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                            {(org.focus_areas || []).slice(0, 3).map((f: string) => {
                              const s = focusStyle(f)
                              return <span key={f} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{f}</span>
                            })}
                          </div>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: S.ink }}>{org.spend_label}</div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Remaining results table */}
                {scoredOrgs.length > 3 && (
                  <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 140px 160px 100px', gap: 12, padding: '10px 16px', borderBottom: `1px solid ${S.border}`, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.muted, background: S.cream }}>
                      <span>Score</span><span>Foundation</span><span>Type</span><span>Focus Areas</span><span style={{ textAlign: 'right' }}>Spend</span>
                    </div>
                    {scoredOrgs.slice(3).map((org, i) => {
                      const ts = typeStyle(org.type)
                      const col = scoreColor(org._score)
                      return (
                        <button key={org.id} onClick={() => openOrg(org)} style={{
                          display: 'grid', gridTemplateColumns: '60px 1fr 140px 160px 100px', gap: 12,
                          alignItems: 'center', padding: '13px 16px', background: i % 2 === 0 ? S.white : S.cream,
                          border: 'none', borderBottom: `1px solid ${S.border}`, cursor: 'pointer', textAlign: 'left', width: '100%',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = S.creamWarm)}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? S.white : S.cream)}
                        >
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: col }}>{org._score}%</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: S.ink }}>{org.name}</div>
                            <div style={{ fontSize: 11, color: S.muted, marginTop: 1 }}>{org.parent_company}</div>
                          </div>
                          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 3, background: ts.bg, color: ts.text, fontWeight: 500, alignSelf: 'center', whiteSpace: 'nowrap' }}>{ts.label}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {(org.focus_areas || []).slice(0, 3).map((f: string) => {
                              const s = focusStyle(f)
                              return <span key={f} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{f}</span>
                            })}
                          </div>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: S.ink, textAlign: 'right' }}>{org.spend_label}</div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {!hasSearched && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 13, color: S.muted }}>Select focus areas above to find your matching foundations.</div>
                <button onClick={() => setTab('directory')} style={{ marginTop: 12, fontSize: 13, color: S.saffron, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Or browse the full directory →</button>
              </div>
            )}
          </div>
        )}

        {tab === 'directory' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, borderBottom: `2px solid ${S.ink}`, paddingBottom: 12 }}>
              <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 24, fontWeight: 700, margin: 0, color: S.ink }}>Full Directory</h2>
              <span style={{ fontSize: 13, color: S.muted }}>{directoryOrgs.length} of {initialOrgs.length} foundations · <button onClick={() => setTab('focus')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.saffron, fontSize: 13 }}>browse by focus area →</button></span>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
              <input type="text" placeholder="Search foundations, parent companies, geographies…" value={dirSearch} onChange={e => setDirSearch(e.target.value)}
                style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, width: 280, background: S.white, outline: 'none' }} />
              <select value={dirType} onChange={e => setDirType(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, background: S.white, cursor: 'pointer' }}>
                <option value="all">All types</option>
                <option value="Corporate">Corporate</option>
                <option value="Philanthropic">Philanthropic</option>
                <option value="PSU">PSU / Govt</option>
                <option value="International">International</option>
              </select>
              <select value={dirSort} onChange={e => setDirSort(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, background: S.white, cursor: 'pointer' }}>
                <option value="spend">Sort: Spend (high → low)</option>
                <option value="name">Sort: A–Z</option>
                <option value="gender">Sort: Gender mandate</option>
              </select>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                <button onClick={() => setActiveFilter('all')} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 11, border: `1px solid ${activeFilter === 'all' ? S.ink : S.border}`, background: activeFilter === 'all' ? S.ink : S.white, color: activeFilter === "all" ? "#FFFFFF" : S.muted, cursor: 'pointer', fontWeight: activeFilter === 'all' ? 600 : 400 }}>All</button>
                {FOCUS_AREAS.map(f => {
                  const s = focusStyle(f)
                  const active = activeFilter === f
                  return (
                    <button key={f} onClick={() => setActiveFilter(active ? 'all' : f)} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 11, border: `1px solid ${active ? s.border : S.border}`, background: active ? s.bg : S.white, color: active ? s.text : S.muted, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>{f}</button>
                  )
                })}
              </div>
            </div>

            {/* Dense table */}
            <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 110px 160px 130px 80px 80px', gap: 12, padding: '10px 20px', borderBottom: `2px solid ${S.border}`, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.muted, background: S.cream }}>
                <span>Foundation</span><span>Type</span><span>Annual spend</span><span>NGO preference</span><span style={{ textAlign: 'center' }}>Verified</span><span style={{ textAlign: 'right' }}>Score</span>
              </div>
              {directoryOrgs.map((org, i) => {
                const ts = typeStyle(org.type)
                return (
                  <button key={org.id} onClick={() => openOrg(org)} style={{
                    display: 'grid', gridTemplateColumns: '2fr 110px 160px 130px 80px 80px', gap: 12,
                    alignItems: 'center', padding: '14px 20px',
                    background: i % 2 === 0 ? S.white : S.cream,
                    border: 'none', borderBottom: `1px solid ${S.border}`, cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = S.creamWarm)}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? S.white : S.cream)}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: S.ink }}>{org.name}</div>
                      <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{org.parent_company}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                        {(org.focus_areas || []).slice(0, 4).map((f: string) => {
                          const s = focusStyle(f)
                          return <span key={f} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{f}</span>
                        })}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 3, background: ts.bg, color: ts.text, fontWeight: 500, alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{ts.label}</span>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: S.ink }}>{org.spend_label}</div>
                    <div style={{ fontSize: 11, color: S.muted }}>{org.ngo_size_preference ? `Prefers ${org.ngo_size_preference}` : 'All sizes'}</div>
                    <div style={{ textAlign: 'center', fontSize: 11, color: org.verified ? '#0D7377' : S.ghost, fontWeight: org.verified ? 500 : 400 }}>
                      {org.verified ? '✓' : '—'}
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: S.muted }}>{org.gender_score}/10</div>
                  </button>
                )
              })}
              {directoryOrgs.length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: S.muted, fontSize: 13 }}>No foundations match your filters.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'focus' && (
          <FocusLandscape orgs={initialOrgs} focusAreas={focusAreas} onSelect={openOrg} />
        )}

        {tab === 'ngos' && (
          <NGOTab onSelectOrg={openOrg} initialSelectedNGO={selectedNGOName} onNGOSelected={() => setSelectedNGOName(null)} />
        )}

        {tab === 'guide' && <GuideSection />}
        {tab === 'about' && <AboutSection />}

      </main>

      {/* Footer */}
      <footer style={{ background: S.ink, color: "#E8E4DF" }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, fontSize: 11 }}>
          <div>
            <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, color: S.cream, fontWeight: 700, marginBottom: 6 }}>India CSR Navigator</div>
            <div>An independent research initiative · Not affiliated with MCA, CSRBOX, or any foundation</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
            <span>Data sourced from public CSR annual reports, MCA filings, foundation websites</span>
            <span style={{ color: '#3D3830' }}>CSR spending data: CareEdge Analytics / MCA National CSR Portal · FY2024</span>
          </div>
        </div>
      </footer>

      {selectedOrg && <OrgModal org={selectedOrg} onClose={closeOrg} onSelectNGO={handleSelectNGO} />}
    </div>
  )
}

function GuideSection() {
  const S2 = { ink: '#1A1A1A', muted: '#3D3830', faint: '#5C5650', border: '#E8E4DF', white: '#FFFFFF', cream: '#FAF7F2', creamWarm: '#FAF3EB', borderWarm: '#E8DDD0', saffron: '#E07A2F', teal: '#0D7377', moss: '#4A7C59', berry: '#B44D6E' }
  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ borderBottom: `2px solid ${S2.ink}`, paddingBottom: 12, marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 28, fontWeight: 700, margin: '0 0 6px' }}>Guide</h2>
        <p style={{ fontSize: 13, color: S2.muted, margin: 0 }}>How to use India CSR Navigator to find funders, discover partners and understand the CSR landscape.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, fontSize: 14, color: '#3d3830', lineHeight: 1.8 }}>

        {/* Section 1 — How to Use */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 8, color: S2.ink }}>How to Use India CSR Navigator</h3>
          <p style={{ fontSize: 13, color: S2.muted, marginBottom: 24, lineHeight: 1.7 }}>Whether you are an NGO looking for funders, a CSR manager finding implementation partners, or a researcher exploring India's social capital landscape — here is how to get the most out of this tool.</p>
          <div style={{ background: S2.creamWarm, border: `1px solid ${S2.borderWarm}`, borderRadius: 10, padding: '24px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { n: 1, icon: '📊', heading: 'Start with CSR Overview', body: "See where India's ₹34,909 Cr CSR spend flows — by sector, by state, year on year. Understand which sectors are well-funded and which are underfunded before you start your search." },
                { n: 2, icon: '🔍', heading: 'Run a CSR Match', body: 'Click CSR Match in the nav. Select your focus areas, set your geography and organisation size, then click Find Matching Foundations. Every foundation is scored on alignment. Start with the top 3.' },
                { n: 3, icon: '📋', heading: 'Deep-dive into Foundations', body: 'Click any foundation card to open its full profile — focus areas, geography, grant size range, gender score, NGO size preference and contact details. This tells you exactly how to position your proposal.' },
                { n: 4, icon: '🏢', heading: 'Browse NGO Profiles', body: 'See 329 NGOs with verified grant histories. Filter by focus area. Click any NGO to see which foundations funded them, how much and when. This shows you who is already in the room.' },
                { n: 5, icon: '🗺', heading: 'Explore by Sector', body: 'Use the Sectors tab to see all foundations funding a specific cause. Useful if you know your sector but not which foundations to target.' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: S2.saffron, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{step.n}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 15 }}>{step.icon}</span>
                      <span style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 700, fontSize: 15, color: S2.ink }}>{step.heading}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: S2.muted, lineHeight: 1.7 }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 — Get Listed */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 6, color: S2.ink }}>Get Listed or Update Your Profile</h3>
          <p style={{ fontSize: 13, color: S2.muted, marginBottom: 20, lineHeight: 1.7 }}>
            We verify all submissions before publishing. Data accuracy is our highest priority — we review every entry before it goes live.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: S2.white, border: `1px solid ${S2.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: S2.teal, padding: '12px 18px' }}>
                <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, fontWeight: 700, color: S2.white }}>🏢 Add Your NGO</div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: 13, color: S2.muted, marginBottom: 14, lineHeight: 1.7 }}>If your NGO works in the Indian social impact sector and is seeking CSR funding, submit your profile for review. We verify all entries before listing.</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: S2.ink, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>We will ask for:</p>
                <div style={{ fontSize: 12, color: S2.muted, lineHeight: 2, marginBottom: 16 }}>
                  <div>· Organisation name and website</div>
                  <div>· Contact name, email and LinkedIn</div>
                  <div>· Focus areas and states of operation</div>
                  <div>· Current or past CSR partners</div>
                  <div>· Anything else you want us to know</div>
                </div>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLScdk0okeJEhiLCUuy72M1LamUBNIdKSYfPAbQGep2cd6Djzzg/viewform?usp=header" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: S2.teal, color: S2.white, textAlign: 'center', padding: '10px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Submit NGO Profile →
                </a>
              </div>
            </div>
            <div style={{ background: S2.white, border: `1px solid ${S2.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: S2.saffron, padding: '12px 18px' }}>
                <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, fontWeight: 700, color: S2.white }}>💼 Update Foundation Data</div>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: 13, color: S2.muted, marginBottom: 14, lineHeight: 1.7 }}>If you represent a CSR foundation and want to update your programme details, add new NGO partners or correct any information, submit here.</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: S2.ink, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>We will ask for:</p>
                <div style={{ fontSize: 12, color: S2.muted, lineHeight: 2, marginBottom: 16 }}>
                  <div>· Foundation name and your contact details</div>
                  <div>· What needs updating and the correction</div>
                  <div>· A source link we can verify against</div>
                  <div>· NGO partners not yet in our database</div>
                </div>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSfmgbt25kexsi5-lsgj4LQw74P7N4qyXQVYQ7aRhM2WnYkYow/viewform?usp=header" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: S2.saffron, color: S2.white, textAlign: 'center', padding: '10px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Submit Foundation Update →
                </a>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: S2.faint, textAlign: 'center', lineHeight: 1.7 }}>
            All submissions are reviewed by our team before publishing. We aim to respond within 2–3 working days.<br />
            Questions? Reach us at <a href="mailto:india.csr.navigator@gmail.com" style={{ color: S2.teal }}>india.csr.navigator@gmail.com</a>
          </p>
        </section>

        {/* Section 3 — Who is this for */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 20, color: S2.ink }}>Who is this for?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { title: 'NGO Leaders', icon: '🏢', color: S2.saffron, body: 'Find aligned CSR funders. Know who funds your sector and state. Stop cold-emailing — start warm outreach.' },
              { title: 'CSR Managers', icon: '💼', color: S2.teal, body: 'Benchmark your spend vs peers. Discover NGO implementation partners. Explore sector and geography coverage.' },
              { title: 'Indian Diaspora', icon: '🌏', color: S2.moss, body: 'Understand where India\'s social capital flows. Identify underfunded sectors. Connect with the ecosystem.' },
              { title: 'Researchers', icon: '📊', color: S2.berry, body: 'Export structured data as CSV or JSON. Access 476 verified grant records. Year-on-year CSR market analysis.' },
            ].map(card => (
              <div key={card.title} style={{ background: S2.white, border: `1px solid ${S2.border}`, borderLeft: `4px solid ${card.color}`, borderRadius: 8, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{card.icon}</span>
                  <span style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 700, fontSize: 15, color: S2.ink }}>{card.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: S2.muted, lineHeight: 1.7 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

function AboutSection() {
  const S2 = { ink: '#1A1A1A', muted: '#3D3830', faint: '#3D3830', border: '#E8E4DF', white: '#FFFFFF', cream: '#FAF7F2', creamWarm: '#FAF3EB', borderWarm: '#E8DDD0', saffron: '#E07A2F', teal: '#0D7377', moss: '#4A7C59' }
  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ borderBottom: `2px solid ${S2.ink}`, paddingBottom: 12, marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 28, fontWeight: 700, margin: '0 0 6px' }}>Methodology</h2>
        <p style={{ fontSize: 13, color: S2.muted, margin: 0 }}>How we built this tool, what the data covers, and how to use it responsibly.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 14, color: '#3d3830', lineHeight: 1.8 }}>

        {/* What is CSR in India */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: S2.ink }}>What is CSR in India?</h3>
          <p style={{ marginBottom: 12 }}>Corporate Social Responsibility (CSR) in India is not voluntary — it is a legal mandate. India was the first country in the world to make CSR spending compulsory for large companies, through Section 135 of the Companies Act, 2013, which came into force on 1 April 2014.</p>
          <p style={{ marginBottom: 12 }}>Any company that meets one or more of these thresholds in the preceding financial year is required to spend at least 2% of its average net profit (calculated over the preceding three financial years) on CSR activities:</p>
          <div style={{ background: S2.creamWarm, border: `1px solid ${S2.borderWarm}`, borderRadius: 8, padding: '16px 20px', marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Net worth', value: '₹500 crore or more' },
                { label: 'Annual turnover', value: '₹1,000 crore or more' },
                { label: 'Net profit', value: '₹5 crore or more' },
              ].map(t => (
                <div key={t.label}>
                  <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: S2.muted, fontWeight: 600, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 15, fontWeight: 700, color: S2.ink }}>{t.value}</div>
                </div>
              ))}
            </div>
          </div>
          <p>In FY2024, this mandate applied to 1,394 companies listed on the NSE, which together spent ₹17,967 crore — a 16% increase from the previous year. The total India CSR figure of ₹34,909 crore includes all companies (listed and unlisted) reporting to the MCA National CSR Portal.</p>
        </section>

        {/* What CSR funds can be spent on */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: S2.ink }}>What can CSR funds be spent on?</h3>
          <p style={{ marginBottom: 12 }}>Schedule VII of the Companies Act specifies the activities eligible for CSR spending. These include:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              'Eradicating hunger, poverty, malnutrition and promoting healthcare',
              'Promoting education and vocational skills',
              'Promoting gender equality and women empowerment',
              'Ensuring environmental sustainability and ecological balance',
              'Protection of national heritage, art and culture',
              'Rural development projects',
              'Reducing inequalities faced by socially and economically backward groups',
              'Slum area development',
              'Disaster management, relief and rehabilitation',
              'Contribution to PM\'s National Relief Fund or similar funds',
              'Technology incubators within academic institutions',
              'Promotion of sports',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: S2.muted }}>
                <span style={{ color: S2.teal, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How CSR is implemented */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: S2.ink }}>How do companies implement CSR?</h3>
          <p style={{ marginBottom: 12 }}>Companies have three routes to implement CSR activities:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {[
              { route: 'Direct implementation', desc: 'Company runs programmes itself through its own CSR team or foundation. 31% of companies choose this route.' },
              { route: 'Implementing agency (NGO)', desc: 'Company funds an NGO or trust to execute the programme. 71% of companies prefer this — the most common route. This is where most CSR grants to NGOs come from.' },
              { route: 'Both', desc: 'Some activities direct, others through partners. 38% of companies use a combination.' },
            ].map(r => (
              <div key={r.route} style={{ background: S2.white, border: `1px solid ${S2.border}`, borderRadius: 6, padding: '12px 16px' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: S2.ink, marginBottom: 4 }}>{r.route}</div>
                <div style={{ fontSize: 13, color: S2.muted }}>{r.desc}</div>
              </div>
            ))}
          </div>
          <p>Companies must form a CSR Committee of at least 3 board members (including 1 independent director) if their CSR spend exceeds ₹50 lakh. They must disclose full CSR activity details in their annual report. If funds remain unspent, they must be transferred to an Unspent CSR Account and used within 3 years, or transferred to a PM Fund.</p>
        </section>

        {/* What is a CSR Foundation */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: S2.ink }}>What is a CSR foundation?</h3>
          <p style={{ marginBottom: 12 }}>Many large companies create dedicated foundations or trusts to manage their CSR activities. These are registered as Section 8 companies (non-profit), public charitable trusts, or societies under state laws. Well-known examples include Tata Trusts, Infosys Foundation, HCL Foundation and Azim Premji Foundation.</p>
          <p>Some foundations go beyond mandatory CSR — Azim Premji Foundation, for example, is funded by Wipro founder Azim Premji's personal philanthropy at a scale far exceeding the company's mandatory CSR obligation. Gates Foundation India is the Indian arm of the Bill and Melinda Gates Foundation — not a CSR foundation at all, but a private philanthropy.</p>
          <p style={{ marginTop: 12 }}>This database includes all types — mandatory CSR foundations, voluntary philanthropic foundations, and international foundations operating in India — because NGOs need to understand the full funding landscape.</p>
        </section>

        {/* Coverage */}
        <section style={{ background: S2.creamWarm, border: `1px solid ${S2.borderWarm}`, borderRadius: 8, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 18, fontWeight: 700, marginBottom: 12, color: S2.ink }}>What this database covers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {[
              { stat: '101', label: 'Foundations tracked', sub: '50 Corporate · 10 PSU · 9 Philanthropic · 2 International' },
              { stat: '329', label: 'Unique NGOs documented', sub: 'Derived from 476 verified grant records' },
              { stat: '~56%', label: 'Of India CSR spend covered', sub: '₹19,500 Cr estimated annual spend across tracked foundations' },
              { stat: '25.5%', label: 'Of India CSR grant-documented', sub: '₹8,894 Cr in individually verified grant records' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: S2.teal }}>{s.stat}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: S2.ink }}>{s.label}</div>
                <div style={{ fontSize: 11, color: S2.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: S2.muted, lineHeight: 1.7 }}>
            <p style={{ marginBottom: 8 }}>The 101 foundations in this database account for approximately <strong style={{ color: S2.ink }}>~56% of India's total CSR spend</strong> — covering all major spenders verified from PRIME Database Group's authoritative NSE analysis (April 2025).</p>
            <p style={{ marginBottom: 8 }}>Grant records represent individually documented, source-linked grants and programme entries. Some large foundations run hundreds of programmes — the grant-level coverage reflects what has been individually verified, not the total foundation spend which is captured in foundation profiles.</p>
            <p style={{ marginBottom: 8 }}>The remaining ~50% of spend is distributed across 1,300+ smaller companies each spending under ₹150 Cr/year with limited public programme-level data. We prioritise accuracy over completeness — every record links to a primary source.</p>
            <p>Foundations are marked <strong style={{ color: S2.ink }}>Audited</strong> (manually cross-checked against the foundation website), <strong style={{ color: S2.ink }}>Verified</strong> (confirmed from public sources) or <strong style={{ color: '#8B6A00' }}>Awaiting Verification</strong> (data from public filings, not yet cross-checked). We audit the top foundations quarterly.</p>
          </div>
        </section>

        {/* Match score */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: S2.ink }}>How the match score works</h3>
          <p style={{ marginBottom: 12 }}>The Find Funders tab scores every foundation against your NGO profile. The algorithm uses four factors:</p>
          <div style={{ background: S2.white, border: `1px solid ${S2.border}`, borderRadius: 8, overflow: 'hidden' }}>
            {[
              { criteria: 'Focus area match', weight: '35%', why: 'Most critical — CSR funds must align with your thematic work area' },
              { criteria: 'NGO size compatibility', weight: '25%', why: 'Foundations have strong preferences — most reject NGOs too small or too large' },
              { criteria: 'Geographic match', weight: '20%', why: '60% of CSR concentrates in 5 states — geography matters enormously' },
              { criteria: 'Grant size fit', weight: '20%', why: 'Asking for the right quantum significantly improves success rates' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 60px 1fr', gap: 16, padding: '12px 20px', borderBottom: i < 3 ? `1px solid ${S2.border}` : 'none', fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: S2.ink }}>{row.criteria}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: S2.teal, textAlign: 'center' }}>{row.weight}</span>
                <span style={{ color: S2.muted }}>{row.why}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section>
          <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: S2.ink }}>Data sources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { source: 'MCA National CSR Portal (csr.gov.in)', use: 'Official company-level CSR spending disclosures FY2014–FY2024' },
              { source: 'PRIME Database Group — primeinfobase.com', use: 'Authoritative NSE-listed company CSR analysis, April 2025. Source for all verified spend figures.' },
              { source: 'CSRBOX India CSR Outlook Report 2024', use: 'Sector allocation, NGO perspectives and implementation trends' },
              { source: 'ICRA ESG Ratings 2025', use: 'State-wise CSR distribution and geographic analysis FY2024' },
              { source: 'CareEdge Analytics — India CSR Outlook', use: 'All-India totals and sector breakdown FY2020–FY2024' },
              { source: 'Company annual reports', use: 'Foundation profiles, programme descriptions and grant records — linked directly in grant records' },
              { source: 'Foundation websites and press releases', use: 'NGO partner names, grant amounts and programme details' },
              { source: 'Bain & Company India Philanthropy Report 2024', use: 'Philanthropic foundation data and trends' },
              { source: 'India Development Review (idronline.org)', use: 'Philanthropy and CSR analysis, foundation partner verification and sector insights' },
              { source: 'NITI Aayog Aspirational Districts Programme (niti.gov.in)', use: 'Verified CSR spend in 112 under-developed districts and CPSE funding data' },
              { source: 'NITI Aayog NGO Darpan Portal (ngodarpan.gov.in)', use: 'NGO registration verification, 4.43 lakh registered NGOs' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, padding: '10px 14px', background: i % 2 === 0 ? S2.cream : S2.white, borderRadius: 4, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: S2.ink }}>{s.source}</span>
                <span style={{ color: S2.muted }}>{s.use}</span>
              </div>
            ))}
          </div>
        </section>

        <p style={{ fontSize: 12, color: S2.muted, borderTop: `1px solid ${S2.border}`, paddingTop: 16, lineHeight: 1.7 }}>
          This is an independent research initiative. Not affiliated with the Ministry of Corporate Affairs, any CSR foundation, or any NGO. All data is sourced from publicly available documents. Grant amounts and programme details are verified where possible and clearly labelled. If you spot an error, please contact us — accuracy is our highest priority.
        </p>
      </div>
    </div>
  )
}
