import { createServerClient, ActiveGrant } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { focusStyle } from '@/lib/colours'
import TrackDetailView from '@/components/TrackDetailView'

export const revalidate = 3600

export async function generateStaticParams() {
  const sb = createServerClient()
  const { data } = await sb.from('active_grants').select('programme_slug')
  return (data || []).map(r => ({ slug: r.programme_slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = createServerClient()
  const { data } = await sb.from('active_grants')
    .select('programme_name, programme_description, organisations(name)')
    .eq('programme_slug', slug)
    .single()
  if (!data) return { title: 'Grant — India CSR Navigator' }
  const org = (data.organisations as any)?.name || ''
  return {
    title: `${data.programme_name} — India CSR Navigator`,
    description: data.programme_description || `${org} grant programme on India CSR Navigator`,
  }
}

function Chip({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{ background: bg, color: text, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 12, display: 'inline-block' }}>
      {label}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9A9A94', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: 13, lineHeight: 1.5 }}>
      <span style={{ color: '#9A9A94', minWidth: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function BurdenBadge({ burden }: { burden: string | null }) {
  if (!burden) return <span style={{ color: '#9A9A94' }}>—</span>
  const map: Record<string, { color: string; label: string }> = {
    light:  { color: '#1A5C2E', label: 'Light' },
    medium: { color: '#C45A1A', label: 'Medium' },
    heavy:  { color: '#8A2020', label: 'Heavy' },
  }
  const s = map[burden] || { color: '#6B6560', label: burden }
  return <span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>
}

export default async function GrantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = createServerClient()
  const { data: g, error } = await sb
    .from('active_grants')
    .select('*, organisations(id, name)')
    .eq('programme_slug', slug)
    .single()

  if (error || !g) notFound()

  const grant = g as ActiveGrant
  const orgName = (grant.organisations as any)?.name || '—'
  const orgId = grant.org_id
  const deadline = grant.is_year_round
    ? 'Year-round'
    : grant.application_deadline
      ? new Date(grant.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'See programme page'
  const isClosed = grant.status === 'recently_closed'
  const isUpcoming = grant.status === 'upcoming'
  const daysLeft = grant.application_deadline && !grant.is_year_round
    ? Math.ceil((new Date(grant.application_deadline).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', fontFamily: 'Inter, sans-serif' }}>
      <TrackDetailView entityType="grant" slug={slug} />
      {/* NAV */}
      <div style={{ background: '#1A1A1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 52, flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#FFFFFF', textDecoration: 'none' }}>
            India CSR Navigator
          </Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <Link href="/grants" style={{ color: '#E07A2F', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Open Grants</Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <span style={{ color: '#888', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{grant.programme_name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* HEADER CARD */}
        <div style={{
          background: isClosed ? '#F5F3EE' : '#FFFFFF',
          border: `1px solid ${isClosed ? '#E0DDD4' : '#E8E4DF'}`,
          borderRadius: 10,
          padding: '24px 24px 20px',
          marginBottom: 20,
        }}>
          {/* Status flags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {isClosed && (
              <span style={{ background: '#E8E4DF', color: '#7A7068', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, letterSpacing: '0.04em' }}>
                CLOSED — {grant.application_deadline ? new Date(grant.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
              </span>
            )}
            {isUpcoming && (
              <span style={{ background: '#EEF1F8', color: '#3B5998', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, letterSpacing: '0.04em' }}>
                UPCOMING
              </span>
            )}
            {!isClosed && !isUpcoming && daysLeft !== null && daysLeft <= 7 && (
              <span style={{ background: '#FDF0E6', color: '#C45A1A', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, border: '1px solid #F0C0A0', letterSpacing: '0.04em' }}>
                CLOSES IN {daysLeft} DAY{daysLeft !== 1 ? 'S' : ''}
              </span>
            )}
            {!isClosed && !isUpcoming && daysLeft !== null && daysLeft > 7 && daysLeft <= 31 && (
              <span style={{ background: '#FFF8F0', color: '#E07A2F', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, border: '1px solid #F5D5B0', letterSpacing: '0.03em' }}>
                {daysLeft} DAYS LEFT
              </span>
            )}
            {grant.is_year_round && !isClosed && (
              <span style={{ background: '#E8F4ED', color: '#1A5C2E', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12 }}>YEAR-ROUND</span>
            )}
          </div>

          <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: isClosed ? '#5C5650' : '#1A1A1A', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
            {grant.programme_name}
          </h1>
          <div style={{ fontSize: 14, color: '#9A9A94', marginBottom: 16 }}>
            by{' '}
            <Link href={`/?org=${orgId}`} style={{ color: '#E07A2F', fontWeight: 500, textDecoration: 'none' }}>
              {orgName}
            </Link>
            {' '}· {grant.entity_type}
          </div>

          {/* Focus area chips */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 20 }}>
            {grant.focus_areas?.map(fa => {
              const s = focusStyle(fa)
              return <Chip key={fa} label={fa} bg={s.bg} text={s.text} />
            })}
          </div>

          {/* Programme description */}
          {grant.programme_description && (
            <p style={{ fontSize: 14, color: '#3D3830', lineHeight: 1.7, margin: '0 0 20px' }}>
              {grant.programme_description}
            </p>
          )}

          {/* Key facts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, background: '#FAF9F6', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Deadline</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{deadline}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Grant size</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{grant.grant_size_text || '—'}</div>
            </div>
            {grant.duration_text && (
              <div>
                <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Duration</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{grant.duration_text}</div>
              </div>
            )}
            {grant.geography && grant.geography.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Geography</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{grant.geography.join(', ')}</div>
              </div>
            )}
          </div>

          {/* Routing notice */}
          {grant.routing_type && grant.routing_type !== 'direct' && grant.routing_notes && (
            <div style={{ background: '#FFF8F0', border: '1px solid #F5D5B0', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#C45A1A', marginBottom: 4, letterSpacing: '0.04em' }}>INDIRECT APPLICATION</div>
              <div style={{ fontSize: 13, color: '#3D3830', lineHeight: 1.6 }}>{grant.routing_notes}</div>
            </div>
          )}

          {/* Apply button */}
          {!isClosed && grant.application_url && (
            <a
              href={grant.application_url}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: 'inline-block',
                background: '#1A1A1A',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                padding: '11px 24px',
                borderRadius: 7,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              Apply →
            </a>
          )}
          {isClosed && (
            <div style={{ fontSize: 13, color: '#9A9A94', fontStyle: 'italic' }}>
              This grant cycle has closed. Visit the{' '}
              <Link href={`/?org=${orgId}`} style={{ color: '#E07A2F', textDecoration: 'none' }}>
                {orgName} foundation profile
              </Link>
              {' '}for information on the next cycle.
            </div>
          )}
        </div>

        {/* DETAIL COLUMNS */}
        <div className="detail-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>

          {/* LEFT: Eligibility + grant details */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '20px 22px' }}>

            {grant.eligibility_summary && (
              <Section title="Who can apply">
                <p style={{ fontSize: 13, color: '#3D3830', lineHeight: 1.7, margin: 0 }}>{grant.eligibility_summary}</p>
                {grant.eligibility_details && (
                  <p style={{ fontSize: 13, color: '#5C5650', lineHeight: 1.7, margin: '8px 0 0', borderTop: '1px solid #F5F3EE', paddingTop: 8 }}>{grant.eligibility_details}</p>
                )}
              </Section>
            )}

            <Section title="Eligibility requirements">
              <InfoRow label="Min. NGO age" value={grant.min_ngo_age_years ? `${grant.min_ngo_age_years} years` : 'Not specified'} />
              <InfoRow label="FCRA required" value={
                grant.fcra_required === true ? <span style={{ color: '#8A2020', fontWeight: 600 }}>Yes</span> :
                grant.fcra_required === false ? <span style={{ color: '#1A5C2E', fontWeight: 600 }}>No</span> :
                <span style={{ color: '#9A9A94' }}>Not specified</span>
              } />
              <InfoRow label="Min. annual budget" value={grant.min_annual_budget_lakhs ? `₹${grant.min_annual_budget_lakhs} lakh/yr` : 'Not specified'} />
              {grant.languages_supported && grant.languages_supported.length > 0 && (
                <InfoRow label="Languages supported" value={grant.languages_supported.join(', ')} />
              )}
              {grant.rural_urban && (
                <InfoRow label="Rural / Urban" value={grant.rural_urban} />
              )}
            </Section>

            {(grant.grant_purpose || grant.co_funding_policy || grant.reporting_burden) && (
              <Section title="Grant terms">
                {grant.grant_purpose && grant.grant_purpose.length > 0 && (
                  <InfoRow label="Purpose" value={grant.grant_purpose.join(', ')} />
                )}
                {grant.co_funding_policy && (
                  <InfoRow label="Co-funding" value={
                    grant.co_funding_policy === 'allowed' ? 'Allowed' :
                    grant.co_funding_policy === 'required' ? <span style={{ color: '#C45A1A', fontWeight: 600 }}>Required</span> :
                    grant.co_funding_policy === 'not_allowed' ? 'Not allowed' :
                    grant.co_funding_policy
                  } />
                )}
                <InfoRow label="Reporting burden" value={<BurdenBadge burden={grant.reporting_burden} />} />
              </Section>
            )}

            {/* Notes (internal guidance) */}
            {grant.notes && (
              <div style={{ background: '#FAF9F6', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#5C5650', lineHeight: 1.6, borderLeft: '3px solid #E8E4DF' }}>
                <strong style={{ color: '#3D3830', display: 'block', marginBottom: 3 }}>Navigator note</strong>
                {grant.notes}
              </div>
            )}
          </div>

          {/* RIGHT: Links + application info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Application window */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9A9A94', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Application Window</div>
              {grant.application_start && (
                <InfoRow label="Opens" value={new Date(grant.application_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              )}
              <InfoRow label="Deadline" value={deadline} />
              {grant.status_notes && (
                <p style={{ fontSize: 12, color: '#5C5650', margin: '8px 0 0', lineHeight: 1.6 }}>{grant.status_notes}</p>
              )}
            </div>

            {/* Useful links */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9A9A94', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Useful Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {grant.application_url && !isClosed && (
                  <a href={grant.application_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#E07A2F', fontWeight: 600, textDecoration: 'none' }}>
                    Application portal →
                  </a>
                )}
                {grant.source_url && (
                  <a href={grant.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#3B5998', textDecoration: 'none' }}>
                    Source / programme page →
                  </a>
                )}
                {grant.previous_grantees_url && (
                  <a href={grant.previous_grantees_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#4A7C59', textDecoration: 'none' }}>
                    Previous grantees →
                  </a>
                )}
                <Link href={`/?org=${orgId}`} style={{ fontSize: 13, color: '#6B6560', textDecoration: 'none' }}>
                  {orgName} foundation profile →
                </Link>
              </div>
            </div>

            {/* Data quality */}
            <div style={{ background: '#FAF9F6', border: '1px solid #E8E4DF', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#9A9A94', lineHeight: 1.6 }}>
                Data verified by India CSR Navigator team.
                {grant.last_verified_at && (
                  <> Last checked {new Date(grant.last_verified_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}.</>
                )}
                {' '}Always confirm details on the foundation's website before applying.
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 32 }}>
          <Link href="/grants" style={{ fontSize: 13, color: '#9A9A94', textDecoration: 'none' }}>
            ← Back to all open grants
          </Link>
        </div>
      </div>
    </div>
  )
}
