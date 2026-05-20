import { createServerClient, ActiveGrant } from '@/lib/supabase-server'
import Link from 'next/link'
import { focusStyle } from '@/lib/colours'
import GrantsListClient from './GrantsListClient'

export const revalidate = 3600 // revalidate hourly

export const metadata = {
  title: 'Open Grants — India CSR Navigator',
  description: 'Active CSR grants, fellowships and funding opportunities open for Indian NGOs and social enterprises. Updated weekly.',
}

async function fetchGrants() {
  const sb = createServerClient()
  const [{ data: open }, { data: closed }] = await Promise.all([
    sb.from('active_grants')
      .select('*, organisations(id, name)')
      .in('status', ['open', 'upcoming'])
      .order('is_year_round', { ascending: true })
      .order('application_deadline', { ascending: true, nullsFirst: false }),
    sb.from('active_grants')
      .select('*, organisations(id, name)')
      .eq('status', 'recently_closed')
      .order('application_deadline', { ascending: false }),
  ])
  return {
    open: (open || []) as ActiveGrant[],
    closed: (closed || []) as ActiveGrant[],
  }
}

export default async function GrantsPage() {
  const { open, closed } = await fetchGrants()
  const openCount = open.filter(g => g.status === 'open').length
  const upcomingCount = open.filter(g => g.status === 'upcoming').length

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', fontFamily: 'Inter, sans-serif' }}>
      {/* NAV */}
      <div style={{ background: '#1A1A1A', borderBottom: '1px solid #333' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 24, height: 52 }}>
          <Link href="/" style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#FFFFFF', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            India CSR Navigator
          </Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <span style={{ color: '#E07A2F', fontSize: 14, fontWeight: 500 }}>Open Grants</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#1A1A1A', letterSpacing: '-0.02em' }}>
            Open Grants
          </h1>
          <p style={{ fontSize: 14, color: '#5C5650', margin: '0 0 16px', lineHeight: 1.6 }}>
            Active funding opportunities for Indian NGOs and social enterprises — sourced from foundation websites, government portals and CSR notices. Updated weekly.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: '#E8F4ED', color: '#1A5C2E', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace' }}>
              {openCount} open
            </span>
            {upcomingCount > 0 && (
              <span style={{ background: '#EEF1F8', color: '#3B5998', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace' }}>
                {upcomingCount} upcoming
              </span>
            )}
            <span style={{ color: '#9A9A94', fontSize: 12 }}>· {closed.length} recently closed</span>
          </div>
        </div>

        {/* CLIENT COMPONENT handles filters + list rendering */}
        <GrantsListClient open={open} closed={closed} />
      </div>
    </div>
  )
}
