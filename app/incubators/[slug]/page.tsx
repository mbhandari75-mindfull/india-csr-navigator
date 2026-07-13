import { createServerClient, Incubator, IncubatorProgramme, IncubatorCohort } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TrackDetailView from '@/components/TrackDetailView'

export const revalidate = 3600

// General array normaliser — splits on commas (for sectors, partners, etc.)
function toArr(val: string[] | string | null | undefined): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  return String(val).split(/,\s*/).filter(Boolean)
}

// Winners are stored as semicolon-separated text (entries contain commas internally)
function splitWinners(val: string[] | string | null | undefined): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.map(s => s.trim()).filter(Boolean)
  return String(val).split(/;\s*/).map(s => s.trim()).filter(Boolean)
}

export async function generateStaticParams() {
  const sb = createServerClient()
  const { data } = await sb.from('incubators').select('slug')
  return (data || []).map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = createServerClient()
  const { data } = await sb.from('incubators').select('name, description').eq('slug', slug).single()
  if (!data) return { title: 'Incubator — India CSR Navigator' }
  return {
    title: `${data.name} — India CSR Navigator`,
    description: data.description || `${data.name} incubator/accelerator profile on India CSR Navigator`,
  }
}

// ─── colour maps ─────────────────────────────────────────────────────────────

const PROG_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  incubator:   { bg: '#EEF1F8', text: '#3B5998', label: 'Incubator' },
  accelerator: { bg: '#E8F4ED', text: '#1A5C2E', label: 'Accelerator' },
  fellowship:  { bg: '#F3EEF9', text: '#6B4C9A', label: 'Fellowship' },
  award:       { bg: '#FAF3EB', text: '#C45A1A', label: 'Award' },
  challenge:   { bg: '#FEE8E8', text: '#8A2020', label: 'Challenge' },
  hybrid:      { bg: '#F5F3EE', text: '#6B6560', label: 'Hybrid' },
  fund:        { bg: '#E8F4F5', text: '#0D7377', label: 'Fund' },
}

const INC_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  social_enterprise: { bg: '#E8F4ED', text: '#1A5C2E', label: 'Social Enterprise' },
  institutional:     { bg: '#EEF1F8', text: '#3B5998', label: 'Institutional' },
  government:        { bg: '#FAF3EB', text: '#C45A1A', label: 'Government' },
  sector_specific:   { bg: '#F3EEF9', text: '#6B4C9A', label: 'Sector-specific' },
  foundation_backed: { bg: '#FFF3E0', text: '#E65100', label: 'Foundation-backed' },
  international:     { bg: '#E8EAF6', text: '#3949AB', label: 'International' },
}

// ─── small components ─────────────────────────────────────────────────────────

function Pill({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{ background: bg, color: text, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, display: 'inline-block', letterSpacing: '0.02em' }}>
      {label}
    </span>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: '#9A9A94', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
      {title}
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: '#FAF9F6', borderRadius: 8, padding: '14px 16px', flex: '1 1 140px', minWidth: 140 }}>
      <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9A9A94', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ─── programme card ───────────────────────────────────────────────────────────

function ProgrammeCard({ prog }: { prog: IncubatorProgramme }) {
  const ts = PROG_TYPE_STYLES[prog.programme_type] || { bg: '#F5F3EE', text: '#6B6560', label: prog.programme_type }
  const cohorts = prog.incubator_cohorts || []

  return (
    <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px', marginBottom: 16, background: '#FFFFFF', width: '100%', boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
      {/* Programme header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
            <Pill label={ts.label} bg={ts.bg} text={ts.text} />
            {prog.status === 'active' && (
              <span style={{ background: '#E8F4ED', color: '#1A5C2E', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10 }}>ACTIVE</span>
            )}
            {prog.status === 'paused' && (
              <span style={{ background: '#FAF3EB', color: '#C45A1A', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10 }}>PAUSED</span>
            )}
          </div>
          <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', overflowWrap: 'break-word' }}>
            {prog.programme_name}
          </div>
        </div>
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          {prog.funding_amount_text && (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{prog.funding_amount_text}</div>
          )}
          {prog.duration_months && (
            <div style={{ fontSize: 11, color: '#9A9A94', marginTop: 2 }}>{prog.duration_months} months</div>
          )}
        </div>
      </div>

      {prog.description && (
        <p style={{ fontSize: 13, color: '#3D3830', lineHeight: 1.6, margin: '0 0 12px', overflowWrap: 'break-word' }}>{prog.description}</p>
      )}

      {/* Programme details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 10 }}>
        {prog.applicant_stage && (
          <div>
            <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Stage</div>
            <div style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>{prog.applicant_stage}</div>
          </div>
        )}
        {prog.equity_taken && (
          <div>
            <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Equity</div>
            <div style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>{prog.equity_taken}</div>
          </div>
        )}
        {prog.cohorts_per_year && (
          <div>
            <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Cohorts/year</div>
            <div style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>{prog.cohorts_per_year}</div>
          </div>
        )}
        {prog.funding_type && (
          <div>
            <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Funding type</div>
            <div style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>{prog.funding_type}</div>
          </div>
        )}
      </div>

      {/* Perks row */}
      {(prog.mentorship_provided || prog.network_access || prog.lab_facility || prog.follow_on_funding) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {prog.mentorship_provided && <span style={{ background: '#EEF1F8', color: '#3B5998', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10 }}>Mentorship</span>}
          {prog.network_access && <span style={{ background: '#E8F4ED', color: '#1A5C2E', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10 }}>Network access</span>}
          {prog.lab_facility && <span style={{ background: '#F3EEF9', color: '#6B4C9A', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10 }}>Lab facility</span>}
          {prog.follow_on_funding && <span style={{ background: '#FFF3E0', color: '#E65100', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10 }}>Follow-on funding</span>}
        </div>
      )}

      {/* Partners */}
      {toArr(prog.partners).length > 0 && (
        <div style={{ fontSize: 11, color: '#9A9A94', marginBottom: 8 }}>
          Partners: {toArr(prog.partners).join(' · ')}
        </div>
      )}

      {/* Eligibility */}
      {prog.eligibility_criteria && (
        <div style={{ background: '#FAF9F6', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#5C5650', lineHeight: 1.5, marginBottom: 8, overflowWrap: 'break-word' }}>
          <strong style={{ color: '#3D3830' }}>Eligibility: </strong>{prog.eligibility_criteria}
        </div>
      )}

      {/* Apply link */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {prog.application_url && (
          <a href={prog.application_url} target="_blank" rel="noreferrer noopener"
            style={{ fontSize: 12, fontWeight: 600, color: '#E07A2F', textDecoration: 'none' }}>
            Apply →
          </a>
        )}
        {prog.source_url && (
          <a href={prog.source_url} target="_blank" rel="noreferrer noopener"
            style={{ fontSize: 12, color: '#9A9A94', textDecoration: 'none' }}>
            Programme details →
          </a>
        )}
        {cohorts.length > 0 && (
          <span style={{ fontSize: 11, color: '#9A9A94' }}>
            {cohorts.length} documented cohort{cohorts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── cohort entry ─────────────────────────────────────────────────────────────

function CohortEntry({ cohort, programmeName }: { cohort: IncubatorCohort; programmeName: string }) {
  const winners = splitWinners(cohort.notable_winners)
  const meta = [cohort.cohort_period, cohort.cohort_year].filter(Boolean).join(' · ')

  return (
    <div style={{ border: '1px solid #E5E5E5', borderLeft: '3px solid #6B4C9A', borderRadius: 8, padding: '20px 24px', marginBottom: 16, background: '#FFFFFF', width: '100%', boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>
            {cohort.cohort_name || `${programmeName} ${cohort.cohort_year || ''}`}
          </div>
          <div style={{ fontSize: 11, color: '#9A9A94', marginTop: 3 }}>
            {meta && <span>{meta} · </span>}{programmeName}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {cohort.number_of_winners != null && (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#6B4C9A' }}>
              {cohort.number_of_winners}
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#9A9A94', fontSize: 11 }}> winners</span>
            </div>
          )}
          {cohort.total_funding_text && (
            <div style={{ fontSize: 11, color: '#9A9A94', marginTop: 2 }}>{cohort.total_funding_text}</div>
          )}
        </div>
      </div>

      {cohort.description && (
        <p style={{ fontSize: 13, color: '#5C5650', lineHeight: 1.6, margin: '0 0 12px' }}>{cohort.description}</p>
      )}

      {/* Winners list — each on its own line */}
      <div>
        <div style={{ fontSize: 10, color: '#6B4C9A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Winners
        </div>
        {winners.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {winners.map((w, i) => (
              <div key={i} style={{ background: '#F3EEF9', color: '#4A3570', fontSize: 12, fontWeight: 500, padding: '7px 12px', borderRadius: 6, lineHeight: 1.45 }}>
                {w}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#B0A8C8', fontStyle: 'italic' }}>Winners not yet documented</div>
        )}
      </div>

      {cohort.source_url && (
        <div style={{ marginTop: 10 }}>
          <a href={cohort.source_url} target="_blank" rel="noreferrer noopener"
            style={{ fontSize: 11, color: '#9A9A94', textDecoration: 'none' }}>
            Source →
          </a>
        </div>
      )}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function IncubatorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = createServerClient()

  const { data: inc, error } = await sb
    .from('incubators')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !inc) notFound()

  const incubator = inc as Incubator

  const { data: programmeData } = await sb
    .from('incubator_programmes')
    .select('*, incubator_cohorts(*)')
    .eq('incubator_id', incubator.id)
    .order('programme_name')

  const programmes = (programmeData || []) as IncubatorProgramme[]
  const allCohorts = programmes.flatMap(p =>
    (p.incubator_cohorts || []).map(c => ({ ...c, _programmeName: p.programme_name }))
  ).sort((a, b) => (b.cohort_year || 0) - (a.cohort_year || 0))

  const location = [incubator.hq_city, incubator.hq_country].filter(Boolean).join(', ')
  const ts = INC_TYPE_STYLES[incubator.incubator_type] || { bg: '#F5F3EE', text: '#6B6560', label: incubator.incubator_type }

  const hasMetrics = incubator.total_startups_supported != null || incubator.total_funding_deployed || incubator.lives_impacted || incubator.jobs_created

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', fontFamily: 'Inter, sans-serif' }}>
      <TrackDetailView entityType="incubator" slug={slug} />
      {/* NAV */}
      <div style={{ background: '#1A1A1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 52, flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#FFFFFF', textDecoration: 'none' }}>
            India CSR Navigator
          </Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <Link href="/incubators" style={{ color: '#E07A2F', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Incubators</Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <span style={{ color: '#888', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{incubator.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* HEADER CARD */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '24px 24px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                <Pill label={ts.label} bg={ts.bg} text={ts.text} />
                {incubator.verified && (
                  <span style={{ background: '#E8F4ED', color: '#1A5C2E', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.04em' }}>
                    ✓ VERIFIED
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {incubator.name}
              </h1>
              <div style={{ fontSize: 13, color: '#9A9A94', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {location && <span>{location}</span>}
                {incubator.year_founded && <span>Est. {incubator.year_founded}</span>}
                {incubator.founder_or_ceo && <span>Founded by {incubator.founder_or_ceo}</span>}
              </div>
            </div>

            {/* Right: Application info */}
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              {incubator.application_model && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: '#9A9A94', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Application model</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{incubator.application_model}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 8 }}>
                {incubator.application_url && (
                  <a href={incubator.application_url} target="_blank" rel="noreferrer noopener"
                    style={{ display: 'inline-block', background: '#1A1A1A', color: '#FFFFFF', fontWeight: 600, fontSize: 13, padding: '9px 18px', borderRadius: 6, textDecoration: 'none' }}>
                    Apply →
                  </a>
                )}
                {incubator.website && (
                  <a href={incubator.website} target="_blank" rel="noreferrer noopener"
                    style={{ display: 'inline-block', border: '1px solid #E8E4DF', color: '#3D3830', fontSize: 13, padding: '9px 18px', borderRadius: 6, textDecoration: 'none' }}>
                    Website →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* About */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '20px 22px' }}>
              <SectionHeading title="About" />
              {incubator.description && (
                <p style={{ fontSize: 14, color: '#3D3830', lineHeight: 1.7, margin: '0 0 14px' }}>{incubator.description}</p>
              )}
              {toArr(incubator.sectors).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#9A9A94', marginBottom: 6 }}>Sectors</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {toArr(incubator.sectors).map(s => (
                      <span key={s} style={{ background: '#F5F3EE', color: '#6B6560', fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 10 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {incubator.geographic_focus && (
                <div style={{ fontSize: 13, color: '#5C5650' }}>
                  <span style={{ color: '#9A9A94' }}>Geographic focus: </span>{incubator.geographic_focus}
                </div>
              )}
            </div>

            {/* Impact metrics */}
            {hasMetrics && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '20px 22px' }}>
                <SectionHeading title="Impact" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {incubator.total_startups_supported != null && (
                    <MetricCard label="Startups supported" value={incubator.total_startups_supported.toLocaleString()} />
                  )}
                  {incubator.total_funding_deployed && (
                    <MetricCard label="Funding deployed" value={incubator.total_funding_deployed} />
                  )}
                  {incubator.lives_impacted && (
                    <MetricCard label="Lives impacted" value={incubator.lives_impacted} />
                  )}
                  {incubator.jobs_created && (
                    <MetricCard label="Jobs created" value={incubator.jobs_created} />
                  )}
                </div>
              </div>
            )}

            {/* Programmes */}
            {programmes.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '20px 22px' }}>
                <SectionHeading title={`Programmes (${programmes.length})`} />
                {programmes.map(p => <ProgrammeCard key={p.id} prog={p} />)}
              </div>
            )}

            {/* Past cohorts & winners */}
            {allCohorts.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '20px 22px' }}>
                <SectionHeading title={`Past Cohorts & Winners (${allCohorts.length})`} />
                {allCohorts.map(c => (
                  <CohortEntry
                    key={c.id}
                    cohort={c}
                    programmeName={(c as any)._programmeName}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Quick stats */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
              <SectionHeading title="At a glance" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9A9A94' }}>Programmes</span>
                  <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{programmes.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9A9A94' }}>Documented cohorts</span>
                  <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{allCohorts.length}</span>
                </div>
                {incubator.total_startups_supported != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#9A9A94' }}>Total supported</span>
                    <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{incubator.total_startups_supported.toLocaleString()}</span>
                  </div>
                )}
                {incubator.year_founded && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#9A9A94' }}>Founded</span>
                    <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{incubator.year_founded}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recognition */}
            {incubator.recognition && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
                <SectionHeading title="Recognition" />
                <p style={{ fontSize: 13, color: '#3D3830', lineHeight: 1.6, margin: 0 }}>{incubator.recognition}</p>
              </div>
            )}

            {/* Useful links */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
              <SectionHeading title="Links" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {incubator.website && (
                  <a href={incubator.website} target="_blank" rel="noreferrer noopener" style={{ fontSize: 13, color: '#E07A2F', fontWeight: 600, textDecoration: 'none' }}>
                    Official website →
                  </a>
                )}
                {incubator.application_url && (
                  <a href={incubator.application_url} target="_blank" rel="noreferrer noopener" style={{ fontSize: 13, color: '#3B5998', textDecoration: 'none' }}>
                    Application portal →
                  </a>
                )}
                {incubator.source_url && (
                  <a href={incubator.source_url} target="_blank" rel="noreferrer noopener" style={{ fontSize: 13, color: '#4A7C59', textDecoration: 'none' }}>
                    Source →
                  </a>
                )}
              </div>
            </div>

            {/* Data note */}
            <div style={{ background: '#FAF9F6', border: '1px solid #E8E4DF', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#9A9A94', lineHeight: 1.6 }}>
                {incubator.data_quality ? `Data quality: ${incubator.data_quality}. ` : ''}
                Data compiled by India CSR Navigator. Verify details on the incubator's official website before applying.
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{ marginTop: 32 }}>
          <Link href="/incubators" style={{ fontSize: 13, color: '#9A9A94', textDecoration: 'none' }}>
            ← Back to all incubators
          </Link>
        </div>
      </div>
    </div>
  )
}
