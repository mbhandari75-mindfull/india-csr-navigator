import { createServerClient, Incubator } from '@/lib/supabase-server'
import Link from 'next/link'
import IncubatorsListClient from './IncubatorsListClient'

export const revalidate = 3600

export const metadata = {
  title: 'Incubators & Accelerators — India CSR Navigator',
  description: 'Social impact incubators, accelerators and fellowship programmes in India. 16 organisations, 29 programmes, 31 documented cohorts with named winners.',
}

async function fetchIncubators() {
  const sb = createServerClient()
  const [{ data: incubators }, { data: programmes }, { data: cohorts }] = await Promise.all([
    sb.from('incubators').select('*').order('name'),
    sb.from('incubator_programmes').select('id, incubator_id'),
    sb.from('incubator_cohorts').select('id, programme_id'),
  ])
  return {
    incubators: (incubators || []) as Incubator[],
    programmeCount: (programmes || []).length,
    cohortCount: (cohorts || []).length,
    programmesPerIncubator: Object.fromEntries(
      (incubators || []).map(inc => [
        inc.id,
        (programmes || []).filter((p: any) => p.incubator_id === inc.id).length,
      ])
    ),
  }
}

export default async function IncubatorsPage() {
  const { incubators, programmeCount, cohortCount, programmesPerIncubator } = await fetchIncubators()

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', fontFamily: 'Inter, sans-serif' }}>
      {/* NAV */}
      <div style={{ background: '#1A1A1A', borderBottom: '1px solid #333' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 24, height: 52 }}>
          <Link href="/" style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#FFFFFF', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            India CSR Navigator
          </Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <span style={{ color: '#E07A2F', fontSize: 14, fontWeight: 500 }}>Incubators & Accelerators</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#1A1A1A', letterSpacing: '-0.02em' }}>
            Incubators &amp; Accelerators
          </h1>
          <p style={{ fontSize: 14, color: '#5C5650', margin: '0 0 16px', lineHeight: 1.6 }}>
            Social impact incubators, accelerators and fellowship programmes supporting NGOs, startups and social enterprises in India. Includes documented cohorts with named winners.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: '#E8F4ED', color: '#1A5C2E', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace' }}>
              {incubators.length} organisations
            </span>
            <span style={{ background: '#EEF1F8', color: '#3B5998', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace' }}>
              {programmeCount} programmes
            </span>
            <span style={{ background: '#F3EEF9', color: '#6B4C9A', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace' }}>
              {cohortCount} cohorts with named winners
            </span>
          </div>
        </div>

        <IncubatorsListClient
          incubators={incubators}
          programmesPerIncubator={programmesPerIncubator}
        />
      </div>
    </div>
  )
}
