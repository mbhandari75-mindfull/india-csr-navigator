'use client'

import { useEffect, useRef, useState } from 'react'

const YEARS_DATA = [
  { year: 'FY2020', total: 24966, education: 8085, health: 7490, environment: 1982, rural: 2434, livelihoods: 1248, women: 298, other: 3429 },
  { year: 'FY2021', total: 26210, education: 8450, health: 7816, environment: 2100, rural: 2200, livelihoods: 1340, women: 320, other: 3984 },
  { year: 'FY2022', total: 26580, education: 8620, health: 7731, environment: 2392, rural: 2100, livelihoods: 1450, women: 360, other: 3927 },
  { year: 'FY2023', total: 29987, education: 10085, health: 8739, environment: 2921, rural: 2005, livelihoods: 1654, women: 396, other: 4187 },
  { year: 'FY2024', total: 34909, education: 12216, health: 9815, environment: 3840, rural: 2443, livelihoods: 1920, women: 480, other: 4195 },
]

const STATES_DATA = [
  { state: 'Maharashtra', fy24: 6066, fy22: 5290, region: 'West' },
  { state: 'Gujarat', fy24: 2708, fy22: 1585, region: 'West' },
  { state: 'Karnataka', fy24: 2200, fy22: 1812, region: 'South' },
  { state: 'Tamil Nadu', fy24: 2100, fy22: 1407, region: 'South' },
  { state: 'Delhi NCR', fy24: 1980, fy22: 1680, region: 'North' },
  { state: 'Uttar Pradesh', fy24: 1820, fy22: 1331, region: 'North' },
  { state: 'Rajasthan', fy24: 1650, fy22: 1100, region: 'North' },
  { state: 'Andhra Pradesh', fy24: 1540, fy22: 980, region: 'South' },
  { state: 'Odisha', fy24: 1420, fy22: 760, region: 'East' },
  { state: 'Madhya Pradesh', fy24: 1380, fy22: 950, region: 'Central' },
  { state: 'Jharkhand', fy24: 980, fy22: 680, region: 'East' },
  { state: 'West Bengal', fy24: 920, fy22: 650, region: 'East' },
  { state: 'Bihar', fy24: 880, fy22: 580, region: 'East' },
  { state: 'Telangana', fy24: 860, fy22: 620, region: 'South' },
  { state: 'Haryana', fy24: 820, fy22: 560, region: 'North' },
  { state: 'Chhattisgarh', fy24: 780, fy22: 520, region: 'Central' },
  { state: 'Punjab', fy24: 480, fy22: 320, region: 'North' },
  { state: 'Kerala', fy24: 440, fy22: 290, region: 'South' },
  { state: 'Uttarakhand', fy24: 380, fy22: 250, region: 'North' },
  { state: 'Assam', fy24: 320, fy22: 200, region: 'North East' },
  { state: 'Himachal Pradesh', fy24: 220, fy22: 140, region: 'North' },
  { state: 'North East (other)', fy24: 180, fy22: 110, region: 'North East' },
]

const SECTORS = [
  { name: 'Education', pct: 35, amount: 12216, color: '#3d3796' },
  { name: 'Health & Sanitation', pct: 28, amount: 9815, color: '#1a7a5a' },
  { name: 'Environment', pct: 11, amount: 3840, color: '#2d6a1e' },
  { name: 'Rural Development', pct: 7, amount: 2443, color: '#5a5248' },
  { name: 'Livelihoods', pct: 6, amount: 1920, color: '#a06010' },
  { name: 'Women Empowerment', pct: 1.4, amount: 480, color: '#b03060' },
  { name: 'Other', pct: 11.6, amount: 4195, color: '#d0cdc4' },
]

const REGIONS = ['All India', 'North', 'South', 'West', 'East', 'Central', 'North East']

interface Props { orgs: any[]; onTabChange?: (tab: any) => void }

export default function OverviewTab({ orgs, onTabChange }: Props) {
  const [selectedRegion, setSelectedRegion] = useState('All India')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)
  const [chartReady, setChartReady] = useState(false)

  const filteredStates = selectedRegion === 'All India'
    ? STATES_DATA
    : STATES_DATA.filter(s => s.region === selectedRegion)

  const stateOrgs = selectedState
    ? orgs.filter(o =>
        o.geography?.toLowerCase().includes(selectedState.toLowerCase()) ||
        o.geography?.toLowerCase().includes('pan-india')
      )
    : []

  const largeFunds = orgs.filter(o => o.spend_max_cr >= 100).length
  const mediumFunds = orgs.filter(o => o.spend_max_cr >= 25 && o.spend_max_cr < 100).length
  const smallFunds = orgs.filter(o => o.spend_max_cr < 25).length
  const maxState = Math.max(...filteredStates.map(s => s.fy24))

  useEffect(() => {
    // Load Chart.js from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => setChartReady(true)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  useEffect(() => {
    if (!chartReady || !chartRef.current) return
    const Chart = (window as any).Chart
    if (!Chart) return

    if (chartInstance.current) chartInstance.current.destroy()

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: YEARS_DATA.map(y => y.year),
        datasets: [
          { label: 'Education', data: YEARS_DATA.map(y => y.education), backgroundColor: '#3d3796', stack: 'a' },
          { label: 'Health', data: YEARS_DATA.map(y => y.health), backgroundColor: '#1a7a5a', stack: 'a' },
          { label: 'Environment', data: YEARS_DATA.map(y => y.environment), backgroundColor: '#2d6a1e', stack: 'a' },
          { label: 'Rural Dev', data: YEARS_DATA.map(y => y.rural), backgroundColor: '#5a5248', stack: 'a' },
          { label: 'Livelihoods', data: YEARS_DATA.map(y => y.livelihoods), backgroundColor: '#a06010', stack: 'a' },
          { label: 'Women', data: YEARS_DATA.map(y => y.women), backgroundColor: '#b03060', stack: 'a' },
          { label: 'Other', data: YEARS_DATA.map(y => y.other), backgroundColor: '#d0cdc4', stack: 'a' },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (i: any) => ` ${i.dataset.label}: ₹${Number(i.raw).toLocaleString('en-IN')} Cr`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#2e2e2a' } },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { size: 11 }, color: '#2e2e2a',
              callback: (v: any) => `₹${(v / 1000).toFixed(0)}K Cr`
            }
          }
        }
      }
    })

    return () => { if (chartInstance.current) chartInstance.current.destroy() }
  }, [chartReady])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Hero stat — cinematic single card */}
      <div style={{ background: "#1A1A1A", color: "#FFFFFF", borderRadius: 16, padding: '28px 32px', marginBottom: 4 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F5F0E8', marginBottom: 8, fontWeight: 600 }}>Total India CSR FY2024</div>
        <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, color: '#FAF7F2', letterSpacing: '-0.03em', lineHeight: 1 }}>
          ₹34,909 <span style={{ fontSize: '0.5em', color: '#CCCCCC', fontWeight: 400 }}>Crore</span>
        </div>
        <div style={{ fontSize: 12, color: '#AAAAAA', marginTop: 10 }}>Source: MCA National CSR Portal · 8.74% CAGR since FY2020 · India's 10th year of mandatory CSR</div>
      </div>

      {/* Supporting stats — 4 cards with colored left borders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { val: '8.74%', label: 'CAGR FY2020–FY2024', sub: 'Consistent 5-year growth', color: '#0D7377' },
          { val: '59,633', label: 'Projects funded FY2024', sub: 'Across 36 states & UTs', color: '#E07A2F' },
          { val: '4.43 lakh', label: 'NGOs on Darpan portal', sub: 'Most seek CSR funding', color: '#4A7C59' },
          { val: '84%', label: 'Private sector share', sub: 'PSUs contribute 16%', color: '#6B4C9A' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', borderLeft: `4px solid ${s.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 24, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#3D3830', marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: '#5C5650', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Highlights strip — cross-tab teasers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {[
          { label: 'Top funder by spend', value: 'Azim Premji Foundation', sub: '₹1,000–2,000 Cr/yr across education, health & community development', color: '#E07A2F', tab: 'navigator', cta: 'See all 35 foundations →' },
          { label: 'Most funded sector', value: 'Education — ₹12,216 Cr', sub: '30+ of 35 foundations fund education. Health & livelihoods follow closely.', color: '#0D7377', tab: 'focus', cta: 'Explore all focus areas →' },
          { label: 'NGOs in database', value: '60+ NGOs tracked', sub: 'Derived from verified grant records. Click to see who funded what.', color: '#4A7C59', tab: 'ngos', cta: 'Browse all NGOs →' },
        ].map(t => (
          <div key={t.label} onClick={() => onTabChange?.(t.tab)} style={{
            background: '#fff', border: '1px solid #E8E4DF', borderRadius: 10, padding: '18px 20px',
            cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = t.color; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8E4DF'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5C5650', marginBottom: 8, fontWeight: 600 }}>{t.label}</div>
            <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.2 }}>{t.value}</div>
            <div style={{ fontSize: 12, color: '#3D3830', lineHeight: 1.6, marginBottom: 12 }}>{t.sub}</div>
            <div style={{ fontSize: 11, color: t.color, fontWeight: 600 }}>{t.cta}</div>
          </div>
        ))}
      </div>

      {/* Quick matcher */}
      <div style={{ background: 'linear-gradient(135deg, #FAF3EB 0%, #FAF7F2 100%)', borderRadius: 10, padding: '20px 24px', border: '1px solid #E8DDD0' }}>
        <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Quick match: find foundations for your sector</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Education', 'Health & Nutrition', 'Environment', 'Rural Development', 'Livelihoods', 'Skill Development', 'Women & Girls', 'Water, Sanitation & Hygiene', 'Menstrual Health', 'Disability & Special Needs', 'Culture, Heritage & Crafts'].map(sector => {
            const colors: Record<string, string> = { 'Education': '#3B5998', 'Health & Nutrition': '#0D7377', 'Environment': '#4A7C59', 'Rural Development': '#8B6F47', 'Livelihoods': '#E07A2F', 'Skill Development': '#E65100', 'Women & Girls': '#B44D6E', 'Water, Sanitation & Hygiene': '#6B4C9A', 'Menstrual Health': '#C45A1A', 'Disability & Special Needs': '#5B6EAE', 'Culture, Heritage & Crafts': '#8B4513' }
            return (
              <button key={sector} onClick={() => onTabChange?.('focus')} style={{
                fontSize: 12, padding: '7px 16px', borderRadius: 999, border: '1px solid #E8E4DF',
                background: '#fff', color: '#3D3830', cursor: 'pointer', transition: 'all 0.12s',
                fontWeight: 400,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = colors[sector] || '#E07A2F'; (e.currentTarget as HTMLElement).style.color = colors[sector] || '#E07A2F' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8E4DF'; (e.currentTarget as HTMLElement).style.color = '#3D3830' }}
              >
                {sector}
              </button>
            )
          })}
        </div>
      </div>

      {/* Trend chart */}
      <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, margin: 0 }}>India CSR spend by sector — FY2020 to FY2024</h3>
            <p style={{ fontSize: 12, color: '#2e2e2a', margin: '4px 0 0' }}>₹ Crore · Source: MCA National CSR Portal, CareEdge Analytics</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Education', color: '#3d3796' },
              { label: 'Health', color: '#1a7a5a' },
              { label: 'Environment', color: '#2d6a1e' },
              { label: 'Rural Dev', color: '#5a5248' },
              { label: 'Livelihoods', color: '#a06010' },
              { label: 'Women', color: '#b03060' },
              { label: 'Other', color: '#d0cdc4' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#2e2e2a' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 320 }}>
          <canvas ref={chartRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
        {!chartReady && (
          <div style={{ position: 'absolute', textAlign: 'center', fontSize: 12, color: '#2e2e2a', padding: 20 }}>Loading chart...</div>
        )}
      </div>

      {/* Sector breakdown + Foundation tiers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 8, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Sector allocation FY2024</h3>
          <p style={{ fontSize: 12, color: '#2e2e2a', margin: '0 0 16px' }}>Share of ₹34,909 Cr total spend</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SECTORS.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#3d3d3a' }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: '#2e2e2a' }}>₹{s.amount.toLocaleString('en-IN')} Cr · {s.pct}%</span>
                </div>
                <div style={{ height: 7, background: '#f0ede6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(s.pct * 2.5, 100)}%`, background: s.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 8, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Foundation size tiers</h3>
          <p style={{ fontSize: 12, color: '#2e2e2a', margin: '0 0 16px' }}>Among {orgs.length} foundations in this database</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Large', sub: '₹100 Cr+ annual spend', count: largeFunds, color: '#1a1a1a', bg: '#f5f3ee', desc: 'Tata, Reliance, HDFC, Azim Premji, Gates' },
              { label: 'Medium', sub: '₹25–100 Cr annual spend', count: mediumFunds, color: '#a06010', bg: '#fdf5e6', desc: 'EdelGive, HCL, Cipla, Dasra, Mahindra' },
              { label: 'Small', sub: 'Under ₹25 Cr annual spend', count: smallFunds, color: '#1a7a5a', bg: '#edf7f3', desc: 'Arghyam, Mariwala, Kotak Education' },
            ].map(t => (
              <div key={t.label} style={{ background: t.bg, borderRadius: 6, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 700, color: t.color, minWidth: 36 }}>{t.count}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{t.label} — {t.sub}</div>
                  <div style={{ fontSize: 11, color: '#2e2e2a', marginTop: 2 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: '#2e2e2a', borderTop: '1px solid #e0ddd4', paddingTop: 10 }}>
            84% of India's CSR comes from private companies. PSUs are mandated but give less strategically.
          </div>
        </div>
      </div>

      {/* State breakdown */}
      <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, margin: 0 }}>CSR investment by state — FY2024</h3>
            <p style={{ fontSize: 12, color: '#2e2e2a', margin: '4px 0 0' }}>Click a state to see active foundations · Source: ICRA ESG Ratings, MCA</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {REGIONS.map(r => (
              <button key={r} onClick={() => { setSelectedRegion(r); setSelectedState(null) }} style={{
                padding: '5px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', border: '1px solid',
                borderColor: selectedRegion === r ? '#1a1a1a' : '#e0ddd4',
                background: selectedRegion === r ? "#1a1a1a" : "#fff",
                color: selectedRegion === r ? '#fff' : '#6b6b67',
                fontWeight: selectedRegion === r ? 600 : 400
              }}>{r}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedState ? '1fr 280px' : '1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredStates.map(s => {
              const pct = Math.round((s.fy24 / maxState) * 100)
              const growth = Math.round(((s.fy24 - s.fy22) / s.fy22) * 100)
              const isSelected = selectedState === s.state
              return (
                <button key={s.state} onClick={() => setSelectedState(isSelected ? null : s.state)} style={{
                  display: 'grid', gridTemplateColumns: '150px 1fr 90px 55px',
                  gap: 12, alignItems: 'center', padding: '9px 12px',
                  background: isSelected ? '#f5f3ee' : 'transparent',
                  border: `1px solid ${isSelected ? '#c8c5bc' : 'transparent'}`,
                  borderRadius: 6, cursor: 'pointer', textAlign: 'left'
                }}>
                  <div style={{ fontSize: 12, fontWeight: isSelected ? 600 : 500, color: '#1a1a1a' }}>{s.state}</div>
                  <div style={{ height: 7, background: '#f0ede6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isSelected ? '#1a1a1a' : '#4a4a46', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'right' }}>₹{s.fy24.toLocaleString('en-IN')} Cr</div>
                  <div style={{ fontSize: 11, color: '#1a7a5a', textAlign: 'right' }}>+{growth}%</div>
                </button>
              )
            })}
            <div style={{ fontSize: 10, color: '#2e2e2a', marginTop: 4, paddingLeft: 12 }}>% growth = FY2022 to FY2024</div>
          </div>

          {selectedState && (
            <div style={{ background: '#f5f3ee', borderRadius: 6, padding: '16px', border: '1px solid #e0ddd4', alignSelf: 'start' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{selectedState}</div>
              <div style={{ fontSize: 12, color: '#2e2e2a', marginBottom: 10 }}>{stateOrgs.length} foundations active here</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stateOrgs.slice(0, 8).map(o => (
                  <div key={o.id} style={{ background: '#fff', borderRadius: 4, padding: '8px 10px', border: '1px solid #e0ddd4' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{o.name}</div>
                    <div style={{ fontSize: 11, color: '#2e2e2a', marginTop: 1 }}>{o.spend_label}</div>
                  </div>
                ))}
                {stateOrgs.length > 8 && <div style={{ fontSize: 11, color: '#2e2e2a' }}>+{stateOrgs.length - 8} more</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geographic insight — warm cream style */}
      <div style={{ background: '#FAF3EB', borderRadius: 16, padding: '24px 28px', border: '1px solid #E8DDD0' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B08D57', marginBottom: 16, fontWeight: 600 }}>Key Insight — Geographic Concentration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { stat: '60%', text: 'of all CSR spend goes to 6 states — Maharashtra, TN, Karnataka, AP, Delhi, Gujarat' },
            { stat: '18%', text: 'Maharashtra alone receives — ₹6,066 Cr in FY2024, more than the next 3 states combined' },
            { stat: '115%', text: 'increase in CSR to aspirational districts FY2021–FY2023, but still under 5% of total' },
            { stat: '<1%', text: 'most North East states receive — Mizoram grew from ₹0.11 Cr (FY19) to ₹11 Cr (FY23)' },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>{item.stat}</div>
              <div style={{ fontSize: 12, color: '#3D3830', lineHeight: 1.7 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
