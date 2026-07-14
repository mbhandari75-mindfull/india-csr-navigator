import { createServerClient, Ngo, NgoGrant } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { focusStyle, typeStyle, sizeBandLabel } from '@/lib/colours'
import { groupByFunder, isMeaningfulGrant } from '@/lib/ngo-grants'
import TrackDetailView from '@/components/TrackDetailView'

export const revalidate = 3600

export async function generateStaticParams() {
  const sb = createServerClient()
  const { data } = await sb.from('ngos').select('slug')
  return (data || []).filter(r => r.slug).map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = createServerClient()
  const { data } = await sb.from('ngos').select('name, description').eq('slug', slug).single()
  if (!data) return { title: 'NGO — India CSR Navigator' }
  return {
    title: `${data.name} — India CSR Navigator`,
    description: data.description || `${data.name} NGO profile on India CSR Navigator`,
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatAmount(lakhs: number): string {
  return lakhs >= 100 ? `₹${(lakhs / 100).toFixed(lakhs % 100 === 0 ? 0 : 1)} Cr` : `₹${lakhs}L`
}

function toArr(val: string[] | string | null | undefined): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(Boolean)
  return String(val).split(/,\s*/).filter(Boolean)
}

// ─── small components ─────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: '#9A9A94', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
      {title}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '20px 22px' }}>
      <SectionHeading title={title} />
      {children}
    </div>
  )
}

function Chip({ label, bg, text, border }: { label: string; bg: string; text: string; border?: string }) {
  return (
    <span style={{ background: bg, color: text, border: border ? `1px solid ${border}` : undefined, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 999, display: 'inline-block' }}>
      {label}
    </span>
  )
}

function RegBadge({ label }: { label: string }) {
  return (
    <span style={{ background: '#E8F4ED', color: '#1A5C2E', border: '1px solid #B7DCC4', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: '0.03em' }}>
      {label}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, alignItems: 'baseline' }}>
      <span style={{ color: '#9A9A94', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1A1A1A', textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</span>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function NgoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = createServerClient()

  const { data: n, error } = await sb
    .from('ngos')
    .select('*, ngo_focus_areas(focus_areas(name))')
    .eq('slug', slug)
    .single()

  if (error || !n) notFound()

  const ngo = n as Ngo

  // Funding history: grants.ngo_id is the RECIPIENT link; the funder comes from
  // grants.org_id -> organisations. NGOs with no linked grants render an
  // explicit empty state rather than a zeroed-out section.
  const { data: grantData } = await sb
    .from('grants')
    .select('id, ngo_id, org_id, amount_lakhs, fiscal_year, programme, focus_area, state, source_url, verified, organisations(id, name, type)')
    .eq('ngo_id', ngo.id)
    .order('fiscal_year', { ascending: false })

  const grants = (grantData || []) as unknown as NgoGrant[]

  const focusAreas = (ngo.ngo_focus_areas || [])
    .map(f => f.focus_areas?.name)
    .filter((x): x is string => Boolean(x))
    .sort()

  const states = toArr(ngo.states)
  const founded = ngo.founded ?? ngo.year_founded
  const recognition = ngo.awards_recognition || ngo.awards
  const sizeBand = sizeBandLabel(ngo.size_band)

  // Grouped by funder, newest-first within each funder. Grants whose org_id is
  // null still appear (under "Funder not recorded") rather than being dropped.
  const funderGroups = groupByFunder(grants)
  const namedFunderCount = funderGroups.filter(g => g.attributed).length
  const shown = grants.filter(isMeaningfulGrant)

  const totalFunding = shown.reduce((s, g) => s + (g.amount_lakhs || 0), 0)
  const allYears = Array.from(
    new Set(shown.map(g => g.fiscal_year).filter((y): y is string => Boolean(y) && y !== 'N/A'))
  ).sort()

  const hasRegistrations = ngo.has_12a || ngo.has_80g || ngo.has_csr1 || ngo.fcra_registered
    || ngo.darpan_id || ngo.pan || ngo.csr_registration_number || ngo.legal_structure
  const hasContact = ngo.contact_name || ngo.contact_email || ngo.contact_linkedin
  const hasFounder = ngo.founder_name || ngo.founder_linkedin

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', fontFamily: 'Inter, sans-serif' }}>
      <TrackDetailView entityType="ngo" slug={slug} />

      {/* NAV */}
      <div style={{ background: '#1A1A1A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 52, flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#FFFFFF', textDecoration: 'none' }}>
            India CSR Navigator
          </Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <Link href="/?tab=ngos" style={{ color: '#E07A2F', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>NGOs</Link>
          <span style={{ color: '#555', fontSize: 14 }}>›</span>
          <span style={{ color: '#888', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{ngo.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* HEADER CARD */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '24px 24px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {ngo.verified && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ background: '#E8F4ED', color: '#1A5C2E', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.04em' }}>
                    ✓ VERIFIED
                  </span>
                </div>
              )}
              <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.01em', overflowWrap: 'break-word' }}>
                {ngo.name}
              </h1>
              <div style={{ fontSize: 13, color: '#9A9A94', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {states.length > 0 && <span>{states.join(' · ')}</span>}
                {founded && <span>Est. {founded}</span>}
              </div>
              {focusAreas.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 12 }}>
                  {focusAreas.map(f => {
                    const s = focusStyle(f)
                    return <Chip key={f} label={f} bg={s.bg} text={s.text} border={s.border} />
                  })}
                </div>
              )}
            </div>

            {ngo.website && (
              <div style={{ flexShrink: 0 }}>
                <a href={ngo.website} target="_blank" rel="noreferrer noopener"
                  style={{ display: 'inline-block', border: '1px solid #E8E4DF', color: '#3D3830', fontSize: 13, padding: '9px 18px', borderRadius: 6, textDecoration: 'none' }}>
                  Website →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="detail-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {ngo.description && (
              <Card title="About">
                <p style={{ fontSize: 14, color: '#3D3830', lineHeight: 1.7, margin: 0, overflowWrap: 'break-word' }}>{ngo.description}</p>
              </Card>
            )}

            {/* FUNDING HISTORY — from grants.ngo_id (recipient) x organisations (funder) */}
            <Card title="Funding history">
              {funderGroups.length > 0 ? (
                <>
                  <div style={{ fontSize: 12, color: '#5C5650', background: '#FAF9F6', borderRadius: 6, padding: '9px 12px', marginBottom: 12, lineHeight: 1.5 }}>
                    Funded by <strong style={{ color: '#1A1A1A' }}>{namedFunderCount}</strong> funder{namedFunderCount !== 1 ? 's' : ''}
                    {totalFunding > 0 && <> · <strong style={{ color: '#1A1A1A' }}>{formatAmount(totalFunding)}</strong> documented</>}
                    {allYears.length > 0 && (
                      <> · <strong style={{ color: '#1A1A1A' }}>{allYears.length} year{allYears.length !== 1 ? 's' : ''}</strong>
                        {allYears.length > 1 ? ` (${allYears[0]}–${allYears[allYears.length - 1]})` : ` (${allYears[0]})`}
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {funderGroups.map(({ name, rows, total, years, org, attributed }) => {
                      const ts = attributed && org?.type ? typeStyle(org.type) : null
                      return (
                        <div key={name} style={{ border: '1px solid #E8E4DF', borderRadius: 8, overflow: 'hidden' }}>
                          <div style={{ background: '#FAF9F6', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                              <span style={{
                                fontWeight: 700, fontSize: 13, overflowWrap: 'break-word',
                                color: attributed ? '#1A1A1A' : '#9A9A94',
                                fontStyle: attributed ? 'normal' : 'italic',
                              }}>{name}</span>
                              {ts && <Chip label={ts.label} bg={ts.bg} text={ts.text} />}
                              {attributed && years.length >= 2 && (
                                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: '#FFF3E8', color: '#E07A2F', border: '1px solid #F0C0A0', fontWeight: 600 }}>
                                  ★ multi-year partner
                                </span>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              {total > 0 && (
                                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{formatAmount(total)}</div>
                              )}
                              {years.length > 0 && (
                                <div style={{ fontSize: 9, color: '#9A9A94' }}>{years.length} year{years.length !== 1 ? 's' : ''}</div>
                              )}
                            </div>
                          </div>

                          {rows.map((g, i) => (
                            <div key={g.id} style={{ padding: '8px 12px', borderTop: '1px solid #E8E4DF', background: i % 2 === 0 ? '#FFFFFF' : '#FDFCFA', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5C5650', flexShrink: 0, minWidth: 52 }}>
                                {!g.fiscal_year || g.fiscal_year === 'N/A' ? '—' : g.fiscal_year}
                              </span>
                              <span style={{ fontSize: 12, color: '#1A1A1A', flex: 1, minWidth: 80, overflowWrap: 'break-word' }}>{g.programme || '—'}</span>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#1A1A1A', flexShrink: 0 }}>
                                {g.amount_lakhs ? formatAmount(g.amount_lakhs) : '—'}
                              </span>
                              {g.verified && <span style={{ fontSize: 9, color: '#0D7377', fontWeight: 600, flexShrink: 0 }}>✓</span>}
                              {g.source_url && (
                                <a href={g.source_url} target="_blank" rel="noreferrer noopener" style={{ fontSize: 9, color: '#3B5998', textDecoration: 'none', flexShrink: 0 }}>↗</a>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: '#9A9A94', fontStyle: 'italic', lineHeight: 1.6 }}>
                  Funding history not yet recorded.
                </div>
              )}
            </Card>

            {ngo.validity_signals && (
              <Card title="Validity signals">
                <p style={{ fontSize: 13, color: '#3D3830', lineHeight: 1.7, margin: 0, overflowWrap: 'break-word' }}>{ngo.validity_signals}</p>
              </Card>
            )}

            {recognition && (
              <Card title="Awards & recognition">
                <p style={{ fontSize: 13, color: '#3D3830', lineHeight: 1.7, margin: 0, overflowWrap: 'break-word' }}>{recognition}</p>
              </Card>
            )}

            {ngo.govt_partnerships && (
              <Card title="Government partnerships">
                <p style={{ fontSize: 13, color: '#3D3830', lineHeight: 1.7, margin: 0, overflowWrap: 'break-word' }}>{ngo.govt_partnerships}</p>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Organisation facts */}
            {(sizeBand || ngo.funding_model || ngo.annual_budget_lakhs != null || founded) && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
                <SectionHeading title="Organisation" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sizeBand && <InfoRow label="Size" value={sizeBand} />}
                  {ngo.annual_budget_lakhs != null && <InfoRow label="Annual budget" value={formatAmount(ngo.annual_budget_lakhs)} />}
                  {ngo.funding_model && <InfoRow label="Funding model" value={ngo.funding_model.replace(/_/g, ' ')} />}
                  {founded && <InfoRow label="Founded" value={founded} />}
                </div>
              </div>
            )}

            {/* Registrations & compliance */}
            {hasRegistrations && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
                <SectionHeading title="Registrations" />
                {(ngo.has_12a || ngo.has_80g || ngo.has_csr1 || ngo.fcra_registered) && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {ngo.has_12a && <RegBadge label="12A" />}
                    {ngo.has_80g && <RegBadge label="80G" />}
                    {ngo.has_csr1 && <RegBadge label="CSR-1" />}
                    {ngo.fcra_registered && <RegBadge label="FCRA" />}
                  </div>
                )}
                {(ngo.legal_structure || ngo.darpan_id || ngo.pan || ngo.csr_registration_number) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ngo.legal_structure && <InfoRow label="Legal structure" value={ngo.legal_structure} />}
                    {ngo.darpan_id && <InfoRow label="DARPAN ID" value={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{ngo.darpan_id}</span>} />}
                    {ngo.csr_registration_number && <InfoRow label="CSR reg. no." value={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{ngo.csr_registration_number}</span>} />}
                    {ngo.pan && <InfoRow label="PAN" value={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{ngo.pan}</span>} />}
                  </div>
                )}
              </div>
            )}

            {/* Leadership */}
            {hasFounder && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
                <SectionHeading title="Leadership" />
                {ngo.founder_name && (
                  <div style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.5, overflowWrap: 'break-word' }}>{ngo.founder_name}</div>
                )}
                {ngo.founder_linkedin && (
                  <a href={ngo.founder_linkedin} target="_blank" rel="noreferrer noopener" style={{ fontSize: 12, color: '#3B5998', textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>
                    LinkedIn →
                  </a>
                )}
              </div>
            )}

            {/* Contact */}
            {hasContact && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
                <SectionHeading title="Contact" />
                {ngo.contact_name && (
                  <div style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600, marginBottom: 6, overflowWrap: 'break-word' }}>{ngo.contact_name}</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ngo.contact_email && (
                    <a href={`mailto:${ngo.contact_email}`} style={{ fontSize: 12, color: '#E07A2F', textDecoration: 'none', overflowWrap: 'anywhere' }}>
                      {ngo.contact_email}
                    </a>
                  )}
                  {ngo.contact_linkedin && (
                    <a href={ngo.contact_linkedin} target="_blank" rel="noreferrer noopener" style={{ fontSize: 12, color: '#3B5998', textDecoration: 'none' }}>
                      LinkedIn →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            {(ngo.website || ngo.annual_report_url) && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: 10, padding: '16px 18px' }}>
                <SectionHeading title="Links" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ngo.website && (
                    <a href={ngo.website} target="_blank" rel="noreferrer noopener" style={{ fontSize: 13, color: '#E07A2F', fontWeight: 600, textDecoration: 'none' }}>
                      Official website →
                    </a>
                  )}
                  {ngo.annual_report_url && (
                    <a href={ngo.annual_report_url} target="_blank" rel="noreferrer noopener" style={{ fontSize: 13, color: '#4A7C59', textDecoration: 'none' }}>
                      Annual report →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Data note */}
            <div style={{ background: '#FAF9F6', border: '1px solid #E8E4DF', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#9A9A94', lineHeight: 1.6 }}>
                {ngo.data_quality ? `Data quality: ${ngo.data_quality}. ` : ''}
                Profile compiled by India CSR Navigator. Verify details with the organisation directly before funding.
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{ marginTop: 32 }}>
          <Link href="/?tab=ngos" style={{ fontSize: 13, color: '#9A9A94', textDecoration: 'none' }}>
            ← Back to all NGOs
          </Link>
        </div>
      </div>
    </div>
  )
}
