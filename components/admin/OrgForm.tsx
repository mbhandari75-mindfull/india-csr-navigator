'use client'

import { useState } from 'react'

const TYPES = ['Corporate','Philanthropic','PSU','International']
const FOCUS_AREAS = ['Women & Girls','Menstrual Health','Education','Health & Nutrition','Livelihoods','Skill Development','Environment','Rural Development','Water, Sanitation & Hygiene','Culture, Heritage & Crafts']
const SIZE_PREFS = ['grassroots','growing','established','large','all']
const GRANT_TIERS = ['small','medium','large']
const APP_TYPES = ['open','invite','both','rolling']

interface Props { supabase: any; onSuccess: () => void; onMessage: (type: 'success'|'error', text: string) => void }

export default function OrgForm({ supabase, onSuccess, onMessage }: Props) {
  const [form, setForm] = useState({
    name: '', parent_company: '', type: 'Corporate', founded: '',
    team_size: '', spend_label: '', spend_min_cr: '', spend_max_cr: '',
    gender_score: '5', programmes_count: '', description: '', menstrual_note: '',
    grant_size: '', geography: '', website: '', contact_name: '',
    contact_title: '', contact_email: '', verified: false,
    ngo_size_preference: 'growing', grant_tier: 'medium', application_type: 'open',
    application_window: '', recent_investments: ''
  })
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const toggleFocus = (f: string) => setFocusAreas(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const fieldStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 13, background: '#fff', color: '#1a1a1a' }
  const labelStyle = { fontSize: 11, fontWeight: 600 as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b6b67', display: 'block' as const, marginBottom: 6 }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { onMessage('error', 'Organisation name is required'); return }
    setSaving(true)

    const { data: org, error: orgErr } = await supabase.from('organisations').insert({
      ...form,
      founded: form.founded ? parseInt(form.founded) : null,
      spend_min_cr: form.spend_min_cr ? parseFloat(form.spend_min_cr) : null,
      spend_max_cr: form.spend_max_cr ? parseFloat(form.spend_max_cr) : null,
      gender_score: form.gender_score ? parseInt(form.gender_score) : 5,
      programmes_count: form.programmes_count ? parseInt(form.programmes_count) : null,
    }).select('id').single()

    if (orgErr) { onMessage('error', orgErr.message); setSaving(false); return }

    // Link focus areas
    if (focusAreas.length > 0) {
      const { data: faData } = await supabase.from('focus_areas').select('id, name').in('name', focusAreas)
      if (faData) {
        await supabase.from('org_focus_areas').insert(
          faData.map((fa: any, i: number) => ({ org_id: org.id, focus_area_id: fa.id, is_primary: i === 0 }))
        )
      }
    }

    setSaving(false)
    onSuccess()
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Add Organisation</h2>
      <p style={{ fontSize: 13, color: '#6b6b67', marginBottom: 24 }}>Add a new CSR foundation to the database.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ borderBottom: '1px solid #e0ddd4', paddingBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Basic information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={labelStyle}>Organisation Name *</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} required style={fieldStyle} /></div>
            <div><label style={labelStyle}>Parent Company</label><input type="text" value={form.parent_company} onChange={e => set('parent_company', e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Type</label><select value={form.type} onChange={e => set('type', e.target.value)} style={fieldStyle}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={labelStyle}>Founded (year)</label><input type="number" value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="e.g. 2010" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Team Size</label><input type="text" value={form.team_size} onChange={e => set('team_size', e.target.value)} placeholder="e.g. 100+" style={fieldStyle} /></div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #e0ddd4', paddingBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Spend & grants</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div><label style={labelStyle}>Spend label</label><input type="text" value={form.spend_label} onChange={e => set('spend_label', e.target.value)} placeholder="₹100–200 Cr/yr" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Spend min (₹ Cr)</label><input type="number" value={form.spend_min_cr} onChange={e => set('spend_min_cr', e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Spend max (₹ Cr)</label><input type="number" value={form.spend_max_cr} onChange={e => set('spend_max_cr', e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Programmes count</label><input type="number" value={form.programmes_count} onChange={e => set('programmes_count', e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Typical grant size</label><input type="text" value={form.grant_size} onChange={e => set('grant_size', e.target.value)} placeholder="₹25L–2 Cr" style={fieldStyle} /></div>
            <div><label style={labelStyle}>NGO size preference</label><select value={form.ngo_size_preference} onChange={e => set('ngo_size_preference', e.target.value)} style={fieldStyle}>{SIZE_PREFS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={labelStyle}>Grant tier</label><select value={form.grant_tier} onChange={e => set('grant_tier', e.target.value)} style={fieldStyle}>{GRANT_TIERS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
            <div><label style={labelStyle}>Application type</label><select value={form.application_type} onChange={e => set('application_type', e.target.value)} style={fieldStyle}>{APP_TYPES.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
            <div><label style={labelStyle}>Application window</label><input type="text" value={form.application_window} onChange={e => set('application_window', e.target.value)} placeholder="e.g. Jan–Mar annually" style={fieldStyle} /></div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #e0ddd4', paddingBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Focus areas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FOCUS_AREAS.map(f => (
              <button key={f} type="button" onClick={() => toggleFocus(f)} style={{
                padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer', border: '1px solid',
                borderColor: focusAreas.includes(f) ? '#1a1a1a' : '#e0ddd4',
                background: focusAreas.includes(f) ? '#1a1a1a' : '#fff',
                color: focusAreas.includes(f) ? '#fff' : '#6b6b67',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #e0ddd4', paddingBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Description & notes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical' as const }} /></div>
            <div><label style={labelStyle}>Menstrual health note</label><textarea value={form.menstrual_note} onChange={e => set('menstrual_note', e.target.value)} rows={2} style={{ ...fieldStyle, resize: 'vertical' as const }} /></div>
            <div><label style={labelStyle}>Recent investments</label><textarea value={form.recent_investments} onChange={e => set('recent_investments', e.target.value)} rows={2} placeholder="Latest notable grants or initiatives..." style={{ ...fieldStyle, resize: 'vertical' as const }} /></div>
            <div><label style={labelStyle}>Geography</label><input type="text" value={form.geography} onChange={e => set('geography', e.target.value)} placeholder="Pan-India, priority: Maharashtra, Gujarat..." style={fieldStyle} /></div>
            <div><label style={labelStyle}>Gender mandate score (1–10)</label><input type="number" min={1} max={10} value={form.gender_score} onChange={e => set('gender_score', e.target.value)} style={{ ...fieldStyle, width: 80 }} /></div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #e0ddd4', paddingBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Contact</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={labelStyle}>Contact name</label><input type="text" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Contact title</label><input type="text" value={form.contact_title} onChange={e => set('contact_title', e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Contact email</label><input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Website</label><input type="text" value={form.website} onChange={e => set('website', e.target.value)} placeholder="foundation.org" style={fieldStyle} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="org-verified" checked={form.verified} onChange={e => set('verified', e.target.checked)} />
          <label htmlFor="org-verified" style={{ fontSize: 13, color: '#3d3d3a', cursor: 'pointer' }}>Mark as verified from primary source</label>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #e0ddd4' }}>
          <button type="submit" disabled={saving} style={{
            padding: '11px 28px', background: saving ? '#e0ddd4' : '#1a1a1a', color: saving ? '#9a9a96' : '#fff',
            border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            {saving ? 'Saving...' : 'Save organisation'}
          </button>
        </div>
      </form>
    </div>
  )
}
