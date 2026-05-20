import { focusStyle, typeStyle, scoreLabel, scoreColor } from '@/lib/colours'

interface Org {
  id: string
  name: string
  parent_company?: string
  type?: string
  spend_label?: string
  focus_areas?: string[]
  geography?: string
  grant_size?: string
  gender_score?: number
  verified?: boolean
  description?: string
  ngo_size_preference?: string
  last_verified_date?: string
  data_quality?: string
}

export default function OrgCard({ org, score, onClick, onSelect }: { org: Org; score?: number; onClick?: () => void; onSelect?: (org: Org) => void }) {
  const ts = typeStyle(org.type || '')
  return (
    <div
      onClick={onClick || (onSelect ? () => onSelect(org) : undefined)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DF',
        borderRadius: 10,
        padding: '18px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 2, lineHeight: 1.3 }}>{org.name}</div>
          {org.parent_company && <div style={{ fontSize: 11, color: '#5C5650' }}>{org.parent_company}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12, flexShrink: 0 }}>
          {org.type && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: ts.bg, color: ts.text, fontWeight: 600 }}>{ts.label}</span>
          )}
          {score !== undefined && (
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: scoreColor(score) }}>{score}% — {scoreLabel(score)}</span>
          )}
        </div>
      </div>

      {/* Spend + Geography */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 12, color: '#3D3830' }}>
        {org.spend_label && <span>💰 {org.spend_label}</span>}
        {org.geography && <span style={{ color: '#5C5650' }}>📍 {org.geography.split(',')[0]}{org.geography.split(',').length > 1 ? ` +${org.geography.split(',').length - 1}` : ''}</span>}
      </div>

      {/* Focus areas */}
      {org.focus_areas && org.focus_areas.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {org.focus_areas.slice(0, 4).map(f => {
            const fs = focusStyle(f)
            return (
              <span key={f} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: fs.bg, color: fs.text, border: `1px solid ${fs.border}`, fontWeight: 500 }}>{f}</span>
            )
          })}
          {org.focus_areas.length > 4 && <span style={{ fontSize: 10, color: '#5C5650' }}>+{org.focus_areas.length - 4} more</span>}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5C5650', borderTop: '1px solid #F0EDE8', paddingTop: 8, marginTop: 4 }}>
        <span>{org.grant_size || '—'}</span>
        <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {org.gender_score !== undefined && <span>Gender {org.gender_score}/10</span>}
          {org.data_quality === 'audited' && org.last_verified_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#1a7a5a' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a7a5a', display: 'inline-block' }} />
              Audited {new Date(org.last_verified_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          )}
          {org.data_quality === 'verified' && org.last_verified_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#5C5650' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9E9A94', display: 'inline-block' }} />
              Verified {new Date(org.last_verified_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
