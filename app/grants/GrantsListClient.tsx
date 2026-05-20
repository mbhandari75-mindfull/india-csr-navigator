'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { focusStyle } from '@/lib/colours'
import { ActiveGrant } from '@/lib/supabase-server'

// ─── helpers ───────────────────────────────────────────────────────────────

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

function formatDeadline(g: ActiveGrant): string {
  if (g.is_year_round) return 'Year-round'
  if (!g.application_deadline) return 'See programme'
  const d = new Date(g.application_deadline)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function deadlineUrgency(g: ActiveGrant): 'this_week' | 'this_month' | 'year_round' | 'later' {
  if (g.is_year_round || !g.application_deadline) return 'year_round'
  const days = daysUntil(g.application_deadline)
  if (days === null) return 'later'
  if (days <= 7) return 'this_week'
  if (days <= 31) return 'this_month'
  return 'later'
}

function UrgencyBadge({ g }: { g: ActiveGrant }) {
  const u = deadlineUrgency(g)
  if (u === 'this_week') return (
    <span style={{ background: '#FDF0E6', color: '#C45A1A', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, border: '1px solid #F0C0A0', letterSpacing: '0.03em' }}>
      THIS WEEK
    </span>
  )
  if (u === 'this_month') return (
    <span style={{ background: '#FFF8F0', color: '#E07A2F', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, border: '1px solid #F5D5B0', letterSpacing: '0.03em' }}>
      THIS MONTH
    </span>
  )
  return null
}

function EntityChip({ type }: { type: string }) {
  const style: Record<string, { bg: string; text: string }> = {
    'NGO':             { bg: '#E8F4ED', text: '#1A5C2E' },
    'Social Enterprise':{ bg: '#FAF3EB', text: '#C45A1A' },
    'Institution':     { bg: '#EEF1F8', text: '#3B5998' },
    'Individual':      { bg: '#F9EEF2', text: '#B44D6E' },
    'Either':          { bg: '#F5F3EE', text: '#6B6560' },
  }
  const s = style[type] || { bg: '#F5F3EE', text: '#6B6560' }
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.02em' }}>
      {type}
    </span>
  )
}

// ─── grant card ────────────────────────────────────────────────────────────

function GrantCard({ g, dim = false }: { g: ActiveGrant; dim?: boolean }) {
  const deadline = formatDeadline(g)
  const orgName = g.organisations?.name || '—'
  const isFeatured = g.is_featured && !dim

  return (
    <Link
      href={`/grants/${g.programme_slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        background: dim ? '#F5F3EE' : isFeatured ? '#FFFDF8' : '#FFFFFF',
        border: `1px solid ${dim ? '#E0DDD4' : isFeatured ? '#F0D5A0' : '#E8E4DF'}`,
        borderRadius: 8,
        padding: '14px 16px',
        marginBottom: 8,
        opacity: dim ? 0.75 : 1,
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { if (!dim) (e.currentTarget as HTMLElement).style.borderColor = '#C8A060' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = dim ? '#E0DDD4' : isFeatured ? '#F0D5A0' : '#E8E4DF' }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
              {g.status === 'upcoming' && (
                <span style={{ background: '#EEF1F8', color: '#3B5998', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, border: '1px solid #C5CEEA', letterSpacing: '0.03em' }}>UPCOMING</span>
              )}
              {dim && (
                <span style={{ background: '#E8E4DF', color: '#7A7068', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, letterSpacing: '0.02em' }}>
                  Closed {g.application_deadline ? new Date(g.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </span>
              )}
              {!dim && <UrgencyBadge g={g} />}
            </div>
            <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 15, fontWeight: 700, color: dim ? '#5C5650' : '#1A1A1A', lineHeight: 1.3 }}>
              {g.programme_name}
            </div>
            <div style={{ fontSize: 12, color: '#9A9A94', marginTop: 2 }}>{orgName}</div>
          </div>
          {/* Deadline */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: dim ? '#9A9A94' : '#1A1A1A' }}>{deadline}</div>
            {g.grant_size_text && (
              <div style={{ fontSize: 11, color: '#9A9A94', marginTop: 1, maxWidth: 180, textAlign: 'right' }}>{g.grant_size_text}</div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <EntityChip type={g.entity_type} />
          {g.focus_areas?.slice(0, 4).map(fa => {
            const s = focusStyle(fa)
            return (
              <span key={fa} style={{ background: s.bg, color: s.text, fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 10 }}>
                {fa}
              </span>
            )
          })}
          {(g.focus_areas?.length || 0) > 4 && (
            <span style={{ fontSize: 10, color: '#9A9A94' }}>+{g.focus_areas!.length - 4}</span>
          )}
          {dim && g.organisations && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9A9A94' }}>
              Next cycle → foundation profile
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── main client component ─────────────────────────────────────────────────

const ALL_ENTITY_TYPES = ['NGO', 'Social Enterprise', 'Institution', 'Individual', 'Either']
const ALL_FOCUS_AREAS = [
  'Education', 'Health & Nutrition', 'Environment', 'Women & Girls', 'Livelihoods',
  'Skill Development', 'Rural Development', 'Water, Sanitation & Hygiene',
  'Menstrual Health', 'Disability & Special Needs', 'WASH',
]

export default function GrantsListClient({ open, closed }: { open: ActiveGrant[]; closed: ActiveGrant[] }) {
  const [entityFilter, setEntityFilter] = useState('')
  const [focusFilter, setFocusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')

  const filtered = useMemo(() => {
    return open.filter(g => {
      if (entityFilter && g.entity_type !== entityFilter) return false
      if (focusFilter && !(g.focus_areas || []).includes(focusFilter)) return false
      if (urgencyFilter) {
        const u = deadlineUrgency(g)
        if (urgencyFilter === 'year_round' && u !== 'year_round') return false
        if (urgencyFilter === 'this_month' && u !== 'this_month' && u !== 'this_week') return false
        if (urgencyFilter === 'this_week' && u !== 'this_week') return false
      }
      return true
    })
  }, [open, entityFilter, focusFilter, urgencyFilter])

  const hasFilters = entityFilter || focusFilter || urgencyFilter

  const S = {
    selectBase: {
      padding: '7px 10px', border: '1px solid #E8E4DF', borderRadius: 6,
      fontSize: 13, background: '#FFFFFF', cursor: 'pointer', color: '#3D3830',
      fontFamily: 'Inter, sans-serif',
    } as React.CSSProperties,
  }

  return (
    <>
      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          style={{ ...S.selectBase, color: entityFilter ? '#1A1A1A' : '#9A9A94' }}
        >
          <option value="">All entity types</option>
          {ALL_ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={focusFilter}
          onChange={e => setFocusFilter(e.target.value)}
          style={{ ...S.selectBase, color: focusFilter ? '#1A1A1A' : '#9A9A94' }}
        >
          <option value="">All focus areas</option>
          {ALL_FOCUS_AREAS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <select
          value={urgencyFilter}
          onChange={e => setUrgencyFilter(e.target.value)}
          style={{ ...S.selectBase, color: urgencyFilter ? '#1A1A1A' : '#9A9A94' }}
        >
          <option value="">All deadlines</option>
          <option value="this_week">Closing this week</option>
          <option value="this_month">Closing this month</option>
          <option value="year_round">Year-round only</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setEntityFilter(''); setFocusFilter(''); setUrgencyFilter('') }}
            style={{ padding: '7px 12px', border: 'none', background: '#F5F3EE', color: '#6B6560', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            ✕ Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9A9A94', fontFamily: 'JetBrains Mono, monospace' }}>
          {filtered.length} of {open.length} grants
        </span>
      </div>

      {/* OPEN GRANTS LIST */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9A9A94', fontSize: 14 }}>
          No grants match your filters.
        </div>
      ) : (
        <div style={{ marginBottom: 40 }}>
          {filtered.map(g => <GrantCard key={g.id} g={g} />)}
        </div>
      )}

      {/* RECENTLY CLOSED */}
      {closed.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 18, fontWeight: 700, margin: 0, color: '#3D3830' }}>
              Recently Closed
            </h2>
            <span style={{ fontSize: 12, color: '#9A9A94' }}>{closed.length} programmes — check foundation profiles for next cycle</span>
          </div>
          <div>
            {closed.map(g => <GrantCard key={g.id} g={g} dim />)}
          </div>
        </div>
      )}
    </>
  )
}
