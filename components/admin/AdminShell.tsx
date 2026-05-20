'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminShell() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f6' }}>
      <div style={{ fontSize: 14, color: '#6b6b67' }}>Loading...</div>
    </div>
  )

  if (!session) return <AdminLogin supabase={supabase} />
  return <AdminDashboard supabase={supabase} session={session} />
}
