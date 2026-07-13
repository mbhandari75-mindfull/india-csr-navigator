'use client'
import { useState } from 'react'
import { focusStyle, typeStyle } from '@/lib/colours'

const FA_ORDER = ['Women & Girls','Menstrual Health','Health & Nutrition','Education','Livelihoods','Skill Development','Rural Development','Water, Sanitation & Hygiene','Environment','Disability & Special Needs','Culture, Heritage & Crafts']
const FA_ICONS: Record<string,string> = {
  'Women & Girls':'♀','Menstrual Health':'◉','Education':'◈',
  'Health & Nutrition':'✦','Livelihoods':'⬡','Environment':'◯',
  'Rural Development':'▣','Water, Sanitation & Hygiene':'◇','Skill Development':'◆','Disability & Special Needs':'◎','Culture, Heritage & Crafts':'❋'
}

interface Props { focusAreas: any[]; orgs: any[]; onSelect: (o:any)=>void }

export default function FocusLandscape({ focusAreas, orgs, onSelect }: Props) {
  const [active, setActive] = useState<string|null>(null)
  const sorted = [...focusAreas].sort((a,b)=>FA_ORDER.indexOf(a.name)-FA_ORDER.indexOf(b.name))
  const activeOrgs = active ? orgs.filter(o=>o.focus_areas?.includes(active)) : []
  const totalBySector = sorted.map(fa => ({
    ...fa,
    count: orgs.filter(o=>o.focus_areas?.includes(fa.name)).length,
    totalSpend: orgs.filter(o=>o.focus_areas?.includes(fa.name))
      .reduce((s:number,o:any)=>s+((o.spend_min_cr+o.spend_max_cr)/2),0)
  }))
  const maxSpend = Math.max(...totalBySector.map(f=>f.totalSpend))

  return (
    <div>
      <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: 12, marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 24, fontWeight: 700, margin: 0 }}>Focus Area Landscape</h2>
        <p style={{ fontSize: 13, color: '#6b6b67', margin: '6px 0 0' }}>Click any focus area to see all foundations active in it</p>
      </div>

      <div className="focus-split" style={{ display: 'grid', gridTemplateColumns: active ? '340px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Focus area list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid #e0ddd4', borderRadius: 6, overflow: 'hidden', background: '#e0ddd4' }}>
          {totalBySector.map(fa => {
            const s = focusStyle(fa.name)
            const isActive = active === fa.name
            const barWidth = Math.round((fa.totalSpend / maxSpend) * 100)
            return (
              <button key={fa.id} onClick={() => setActive(isActive ? null : fa.name)} style={{
                background: isActive ? s.bg : '#fff', border: 'none', padding: '14px 16px',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                borderLeft: isActive ? `4px solid ${s.text}` : '4px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, color: s.text }}>{FA_ICONS[fa.name] || '◆'}</span>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? s.text : '#1a1a1a' }}>{fa.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#4a4a46' }}>{fa.count} foundations</span>
                </div>
                {/* Bar */}
                <div style={{ height: 3, background: '#f0ede6', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${barWidth}%`, background: s.text, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: '#4a4a46', marginTop: 4 }}>
                  Combined spend: ₹{Math.round(fa.totalSpend).toLocaleString('en-IN')} Cr/yr (est.)
                </div>
              </button>
            )
          })}
        </div>

        {/* Active focus area detail */}
        {active && (
          <div>
            <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0ddd4', background: focusStyle(active).bg }}>
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 18, fontWeight: 700, margin: 0, color: focusStyle(active).text }}>
                  {FA_ICONS[active]} {active}
                </h3>
                <p style={{ fontSize: 13, color: '#6b6b67', margin: '4px 0 0' }}>
                  {activeOrgs.length} foundations funding this area
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeOrgs
                  .sort((a:any,b:any)=>b.spend_max_cr-a.spend_max_cr)
                  .map((org:any, i:number) => {
                    const ts = typeStyle(org.type)
                    return (
                      <button key={org.id} onClick={() => onSelect(org)} style={{
                        display: 'grid', gridTemplateColumns: '1fr 90px 120px', gap: 12,
                        alignItems: 'center', padding: '12px 20px', background: i%2===0?'#fff':'#faf9f6',
                        border: 'none', borderBottom: '1px solid #f0ede6', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e=>(e.currentTarget.style.background='#f5f3ee')}
                      onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'#fff':'#faf9f6')}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{org.name}</div>
                          <div style={{ fontSize: 11, color: '#4a4a46', marginTop: 1 }}>{org.parent_company}</div>
                        </div>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: ts.bg, color: ts.text, fontWeight: 500, whiteSpace: 'nowrap' }}>{ts.label}</span>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'right' }}>{org.spend_label}</div>
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
