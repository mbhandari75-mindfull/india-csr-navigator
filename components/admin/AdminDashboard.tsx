'use client'

import { useState, useEffect } from 'react'
import GrantForm from './GrantForm'
import OrgForm from './OrgForm'
import GrantsList from './GrantsList'
import OrgsList from './OrgsList'

interface Props { supabase: any; session: any }

type AdminTab = 'grants' | 'orgs' | 'add-grant' | 'add-org'

export default function AdminDashboard({ supabase, session }: Props) {
  const [tab, setTab] = useState<AdminTab>('grants')
  const [orgs, setOrgs] = useState<any[]>([])
  const [ngos, setNgos] = useState<any[]>([])
  const [grants, setGrants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const [{ data: orgsData }, { data: ngosData }, { data: grantsData }] = await Promise.all([
      supabase.from('organisations').select('id, name, type, spend_label').order('name'),
      supabase.from('ngos').select('id, name, slug').order('name'),
      supabase.from('grants').select('*, organisations(name)').order('fiscal_year', { ascending: false })
    ])
    setOrgs(orgsData || [])
    setNgos(ngosData || [])
    setGrants(grantsData || [])
    setLoading(false)
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleSignOut = () => supabase.auth.signOut()

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'grants', label: `Grants (${grants.length})` },
    { id: 'orgs', label: `Organisations (${orgs.length})` },
    { id: 'add-grant', label: '+ Add Grant' },
    { id: 'add-org', label: '+ Add Organisation' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6' }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a', color: '#faf9f6', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700 }}>India CSR Navigator — Admin</div>
          <div style={{ fontSize: 11, color: '#9a9a96', marginTop: 2 }}>{session.user.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/" target="_blank" style={{ fontSize: 12, color: '#9a9a96', textDecoration: 'none' }}>View site ↗</a>
          <button onClick={handleSignOut} style={{ fontSize: 12, padding: '6px 14px', border: '1px solid #444', borderRadius: 4, background: 'transparent', color: '#9a9a96', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ background: message.type === 'success' ? '#edf7f3' : '#fdf1ec', borderBottom: `1px solid ${message.type === 'success' ? '#a8dfc8' : '#f5c0a8'}`, padding: '12px 24px', fontSize: 13, color: message.type === 'success' ? '#1a7a5a' : '#d4521e' }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0ddd4', padding: '0 24px', display: 'flex', gap: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 18px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? '#1a1a1a' : '#6b6b67',
            background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #1a1a1a' : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9a9a96' }}>Loading...</div>
        ) : (
          <>
            {tab === 'grants' && <GrantsList grants={grants} supabase={supabase} onRefresh={loadData} onMessage={showMessage} />}
            {tab === 'orgs' && <OrgsList orgs={orgs} supabase={supabase} onRefresh={loadData} onMessage={showMessage} />}
            {tab === 'add-grant' && <GrantForm orgs={orgs} ngos={ngos} supabase={supabase} onSuccess={() => { loadData(); setTab('grants'); showMessage('success', 'Grant added successfully') }} onMessage={showMessage} />}
            {tab === 'add-org' && <OrgForm supabase={supabase} onSuccess={() => { loadData(); setTab('orgs'); showMessage('success', 'Organisation added successfully') }} onMessage={showMessage} />}
          </>
        )}
      </div>
    </div>
  )
}
