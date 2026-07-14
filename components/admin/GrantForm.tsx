'use client'

import { useState, useMemo } from 'react'

const FOCUS_AREAS = ['Women & Girls','Menstrual Health','Education','Health & Nutrition','Livelihoods','Skill Development','Environment','Rural Development','Water, Sanitation & Hygiene','Culture, Heritage & Crafts']
const STATES = ['Pan-India','Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Gujarat','Haryana','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','North East India','Ladakh','Goa']
const FISCAL_YEARS = ['FY2026','FY2025','FY2024','FY2023','FY2022','FY2021','FY2020','FY2019']

const EMPTY_FORM = {
  org_id: '', ngo_id: '', ngo_name: '', amount_lakhs: '', fiscal_year: 'FY2024',
  state: 'Pan-India', focus_area: 'Education', programme: '',
  description: '', source_url: '', verified: false
}

interface Props { orgs: any[]; ngos: any[]; supabase: any; onSuccess: () => void; onMessage: (type: 'success'|'error', text: string) => void }

export default function GrantForm({ orgs, ngos, supabase, onSuccess, onMessage }: Props) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [ngoSearch, setNgoSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const matchingNgos = useMemo(() => {
    const q = ngoSearch.trim().toLowerCase()
    if (!q) return ngos
    return ngos.filter(n => n.name.toLowerCase().includes(q))
  }, [ngos, ngoSearch])

  const selectedNgo = ngos.find(n => n.id === form.ngo_id) || null

  // Selecting an NGO takes its curated name as the display name too, so
  // ngo_name can never drift from the entity the grant is actually linked to.
  const selectNgo = (id: string) => {
    const ngo = ngos.find(n => n.id === id)
    setForm(f => ({ ...f, ngo_id: id, ngo_name: ngo ? ngo.name : f.ngo_name }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.org_id) { onMessage('error', 'CSR foundation is required'); return }
    if (!form.ngo_id && !form.ngo_name.trim()) {
      onMessage('error', 'Select an NGO, or enter a recipient name to save it unlinked')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('grants').insert({
      ...form,
      // The FK is what attaches this grant to an NGO profile. Empty string is
      // not a valid uuid — an unlinked grant must write NULL.
      ngo_id: form.ngo_id || null,
      ngo_name: form.ngo_name.trim(),
      amount_lakhs: form.amount_lakhs ? parseFloat(form.amount_lakhs) : null,
    })
    setSaving(false)
    if (error) { onMessage('error', error.message); return }
    setForm(EMPTY_FORM)
    setNgoSearch('')
    onSuccess()
  }

  const fieldStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 13, background: '#fff', color: '#1a1a1a' }
  const labelStyle = { fontSize: 11, fontWeight: 600 as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b6b67', display: 'block' as const, marginBottom: 6 }

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Add Grant</h2>
      <p style={{ fontSize: 13, color: '#6b6b67', marginBottom: 24 }}>Record a verified grant from a CSR foundation to an NGO. Always add the source URL.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>CSR Foundation *</label>
          <select value={form.org_id} onChange={e => set('org_id', e.target.value)} required style={fieldStyle}>
            <option value="">Select foundation...</option>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        {/* NGO picker — writes ngo_id, the FK that attaches this grant to an
            NGO profile. Free-text alone leaves the grant orphaned. */}
        <div style={{ border: '1px solid #e0ddd4', borderRadius: 6, padding: 16, background: '#fdfcfa' }}>
          <label style={labelStyle}>Recipient NGO</label>

          <input
            type="text"
            value={ngoSearch}
            onChange={e => setNgoSearch(e.target.value)}
            placeholder={`Search ${ngos.length} curated NGOs…`}
            style={{ ...fieldStyle, marginBottom: 8 }}
          />

          <select
            value={form.ngo_id}
            onChange={e => selectNgo(e.target.value)}
            size={6}
            style={{ ...fieldStyle, height: 'auto', padding: 0 }}
          >
            <option value="">— No NGO / leave unlinked —</option>
            {matchingNgos.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>

          {ngoSearch.trim() && matchingNgos.length === 0 && (
            <div style={{ fontSize: 12, color: '#6b6b67', marginTop: 8 }}>
              No curated NGO matches “{ngoSearch.trim()}”.
            </div>
          )}

          {selectedNgo ? (
            <div style={{ marginTop: 10, fontSize: 12, color: '#1a7a5a', background: '#edf7f3', border: '1px solid #a8dfc8', borderRadius: 4, padding: '8px 10px' }}>
              ✓ Linked to <strong>{selectedNgo.name}</strong> — this grant will appear in that NGO&apos;s funding history.
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: '#8a5a00', background: '#fdf6e8', border: '1px solid #e8d5a0', borderRadius: 4, padding: '8px 10px', lineHeight: 1.5 }}>
                ⚠ <strong>Unlinked.</strong> This grant will be saved without an NGO link and will <strong>not</strong> appear
                in any NGO profile. NGOs are a curated set — this form will not create one. If the recipient
                belongs in the database, add it to <code>ngos</code> first, then link this grant.
              </div>
              <label style={{ ...labelStyle, marginTop: 12 }}>Recipient name (free text) *</label>
              <input
                type="text"
                value={form.ngo_name}
                onChange={e => set('ngo_name', e.target.value)}
                placeholder="e.g. Sangath, Pratham, CORD"
                style={fieldStyle}
              />
              <div style={{ fontSize: 11, color: '#9a9a96', marginTop: 4 }}>
                Recorded on the grant so the recipient isn&apos;t lost, but it does not link to an NGO profile.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Amount (₹ Lakhs)</label>
            <input type="number" value={form.amount_lakhs} onChange={e => set('amount_lakhs', e.target.value)} placeholder="e.g. 500 = ₹5 Cr" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fiscal Year</label>
            <select value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} style={fieldStyle}>
              {FISCAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>State / Geography</label>
            <select value={form.state} onChange={e => set('state', e.target.value)} style={fieldStyle}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Focus Area</label>
            <select value={form.focus_area} onChange={e => set('focus_area', e.target.value)} style={fieldStyle}>
              {FOCUS_AREAS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Programme Name</label>
            <input type="text" value={form.programme} onChange={e => set('programme', e.target.value)} placeholder="e.g. HCLTech Grant Edition IX" style={fieldStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief description of what this grant funded, impact, geography..." style={{ ...fieldStyle, resize: 'vertical' as const }} />
        </div>

        <div>
          <label style={labelStyle}>Source URL *</label>
          <input type="url" value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://... (annual report, press release, MCA filing)" style={fieldStyle} />
          <div style={{ fontSize: 11, color: '#9a9a96', marginTop: 4 }}>Link directly to the primary source — annual report PDF, press release, or MCA filing. This makes every data point verifiable.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="verified" checked={form.verified} onChange={e => set('verified', e.target.checked)} />
          <label htmlFor="verified" style={{ fontSize: 13, color: '#3d3d3a', cursor: 'pointer' }}>Mark as verified — I have confirmed this from the primary source</label>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #e0ddd4' }}>
          <button type="submit" disabled={saving} style={{
            padding: '11px 28px', background: saving ? '#e0ddd4' : '#1a1a1a', color: saving ? '#9a9a96' : '#fff',
            border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            {saving ? 'Saving...' : 'Save grant'}
          </button>
          <button type="button" onClick={() => { setForm(EMPTY_FORM); setNgoSearch('') }} style={{ padding: '11px 20px', background: 'none', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 13, color: '#6b6b67', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}
