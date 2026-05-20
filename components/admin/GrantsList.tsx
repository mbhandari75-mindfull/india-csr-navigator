'use client'

import { useState } from 'react'

interface Props { grants: any[]; supabase: any; onRefresh: () => void; onMessage: (type: 'success'|'error', text: string) => void }

export default function GrantsList({ grants, supabase, onRefresh, onMessage }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterYear, setFilterYear] = useState('all')
  const [filterOrg, setFilterOrg] = useState('all')

  const orgs = Array.from(new Set(grants.map(g => g.organisations?.name).filter(Boolean))).sort()
  const years = Array.from(new Set(grants.map(g => g.fiscal_year).filter(Boolean))).sort().reverse()

  const filtered = grants.filter(g => {
    const matchSearch = !search || g.ngo_name?.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase())
    const matchYear = filterYear === 'all' || g.fiscal_year === filterYear
    const matchOrg = filterOrg === 'all' || g.organisations?.name === filterOrg
    return matchSearch && matchYear && matchOrg
  })

  const totalAmount = filtered.reduce((s, g) => s + (g.amount_lakhs || 0), 0)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this grant record?')) return
    setDeleting(id)
    const { error } = await supabase.from('grants').delete().eq('id', id)
    setDeleting(null)
    if (error) { onMessage('error', error.message); return }
    onMessage('success', 'Grant deleted')
    onRefresh()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, margin: 0 }}>Grant Records</h2>
          <div style={{ fontSize: 12, color: '#6b6b67', marginTop: 2 }}>{filtered.length} records · ₹{Math.round(totalAmount).toLocaleString('en-IN')}L total shown</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search NGO or description..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 12, width: 220 }} />
          <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 12 }}>
            <option value="all">All foundations</option>
            {orgs.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 12 }}>
            <option value="all">All years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 100px 100px 60px 80px', gap: 12, padding: '10px 16px', background: '#faf9f6', borderBottom: '1px solid #e0ddd4', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b6b67' }}>
          <span>NGO / Recipient</span>
          <span>Foundation</span>
          <span>Year</span>
          <span>Amount</span>
          <span>State</span>
          <span>Verified</span>
          <span>Actions</span>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: '#9a9a96', fontSize: 13 }}>No grants match your filters</div>
        )}
        {filtered.map((g, i) => (
          <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 100px 100px 60px 80px', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f0ede6', background: i % 2 === 0 ? '#fff' : '#faf9f6', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, color: '#1a1a1a' }}>{g.ngo_name}</div>
              {g.programme && <div style={{ fontSize: 11, color: '#9a9a96', marginTop: 1 }}>{g.programme}</div>}
              {g.description && <div style={{ fontSize: 11, color: '#6b6b67', marginTop: 2, lineHeight: 1.4 }}>{g.description.substring(0, 80)}{g.description.length > 80 ? '…' : ''}</div>}
            </div>
            <div style={{ fontSize: 12, color: '#3d3d3a' }}>{g.organisations?.name}</div>
            <div style={{ fontSize: 12, color: '#6b6b67' }}>{g.fiscal_year}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
              {g.amount_lakhs ? `₹${g.amount_lakhs >= 100 ? `${g.amount_lakhs / 100} Cr` : `${g.amount_lakhs}L`}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#6b6b67' }}>{g.state}</div>
            <div style={{ fontSize: 11, color: g.verified ? '#1a7a5a' : '#9a9a96', fontWeight: g.verified ? 500 : 400 }}>
              {g.verified ? '✓ Yes' : 'No'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {g.source_url && (
                <a href={g.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#3d3796', textDecoration: 'none' }}>Source ↗</a>
              )}
              <button onClick={() => handleDelete(g.id)} disabled={deleting === g.id} style={{ fontSize: 11, color: '#d4521e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {deleting === g.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
