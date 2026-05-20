'use client'

import { useState } from 'react'

interface Props { supabase: any }

export default function AdminLogin({ supabase }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f6' }}>
      <div style={{ background: '#fff', border: '1px solid #e0ddd4', borderRadius: 8, padding: '40px 48px', width: '100%', maxWidth: 400 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>India CSR Navigator</div>
        <div style={{ fontSize: 13, color: '#6b6b67', marginBottom: 28 }}>Admin Panel — sign in to continue</div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b6b67', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 14, background: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b6b67', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0ddd4', borderRadius: 4, fontSize: 14, background: '#fff' }}
            />
          </div>
          {error && <div style={{ fontSize: 12, color: '#d4521e', background: '#fdf1ec', padding: '8px 12px', borderRadius: 4 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            padding: '11px', background: loading ? '#e0ddd4' : '#1a1a1a', color: loading ? '#9a9a96' : '#fff',
            border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6
          }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop: 20, fontSize: 12, color: '#9a9a96', textAlign: 'center' }}>
          <a href="/" style={{ color: '#6b6b67' }}>← Back to navigator</a>
        </div>
      </div>
    </div>
  )
}
