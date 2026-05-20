'use client'

interface Props { orgs: any[]; supabase: any; onRefresh: () => void; onMessage: (type: 'success'|'error', text: string) => void }

export default function OrgsList({ orgs, supabase, onRefresh, onMessage }: Props) {
  const handleToggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.from('organisations').update({ verified: !current }).eq('id', id)
    if (error) { onMessage('error', error.message); return }
    onMessage('success', `Marked as ${!current ? 'verified' : 'unverified'}`)
    onRefresh()
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, margin: 0 }}>Organisations</h2>
        <div style={{ fontSize: 12, color: '#6b6b67', marginTop: 2 }}>{orgs.length} foundations in database</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px', gap: 12, padding: '10px 16px', background: '#faf9f6', borderBottom: '1px solid #e0ddd4', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b6b67' }}>
          <span>Organisation</span>
          <span>Type</span>
          <span>Annual spend</span>
          <span>Verified</span>
          <span>Actions</span>
        </div>
        {orgs.map((o, i) => (
          <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f0ede6', background: i % 2 === 0 ? '#fff' : '#faf9f6', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, color: '#1a1a1a' }}>{o.name}</div>
            </div>
            <div style={{ fontSize: 12, color: '#6b6b67' }}>{o.type}</div>
            <div style={{ fontSize: 12, color: '#3d3d3a' }}>{o.spend_label}</div>
            <div style={{ fontSize: 11, color: o.verified ? '#1a7a5a' : '#9a9a96', fontWeight: o.verified ? 500 : 400 }}>
              {o.verified ? '✓ Verified' : 'Unverified'}
            </div>
            <button onClick={() => handleToggleVerified(o.id, o.verified)} style={{ fontSize: 11, color: '#3d3796', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' as const }}>
              {o.verified ? 'Unverify' : 'Verify'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
