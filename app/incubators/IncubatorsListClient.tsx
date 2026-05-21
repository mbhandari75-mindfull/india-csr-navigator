'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Incubator } from '@/lib/supabase-server'

function toArr(val: string[] | string | null | undefined): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  return String(val).split(/,\s*/).filter(Boolean)
}

// ─── type/colour helpers ────────────────────────────────────────────────────

const INCUBATOR_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  social_enterprise:  { bg: '#E8F4ED', text: '#1A5C2E', label: 'Social Enterprise' },
  institutional:      { bg: '#EEF1F8', text: '#3B5998', label: 'Institutional' },
  government:         { bg: '#FAF3EB', text: '#C45A1A', label: 'Government' },
  sector_specific:    { bg: '#F3EEF9', text: '#6B4C9A', label: 'Sector-specific' },
  foundation_backed:  { bg: '#FFF3E0', text: '#E65100', label: 'Foundation-backed' },
  international:      { bg: '#E8EAF6', text: '#3949AB', label: 'International' },
}

function incubatorTypeStyle(type: string) {
  return INCUBATOR_TYPE_STYLES[type] || { bg: '#F5F3EE', text: '#6B6560', label: type }
}

function formatType(type: string) {
  return incubatorTypeStyle(type).label
}

function TypePill({ type }: { type: string }) {
  const s = incubatorTypeStyle(type)
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
      {s.label}
    </span>
  )
}

function SectorChip({ sector }: { sector: string }) {
  return (
    <span style={{ background: '#F5F3EE', color: '#6B6560', fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 10 }}>
      {sector}
    </span>
  )
}

// ─── card ───────────────────────────────────────────────────────────────────

function IncubatorCard({ inc, programmeCount }: { inc: Incubator; programmeCount: number }) {
  const location = [inc.hq_city, inc.hq_country === 'India' ? null : inc.hq_country].filter(Boolean).join(', ') || '—'
  const isIndian = !inc.hq_country || inc.hq_country === 'India'

  return (
    <Link href={`/incubators/${inc.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E4DF',
          borderRadius: 8,
          padding: '16px 18px',
          marginBottom: 8,
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8A060' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8E4DF' }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <TypePill type={inc.incubator_type} />
              {inc.verified && (
                <span style={{ fontSize: 11, color: '#1A5C2E', fontWeight: 600 }} title="Verified">✓</span>
              )}
            </div>
            <div style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>
              {inc.name}
            </div>
            <div style={{ fontSize: 12, color: '#9A9A94', marginTop: 2 }}>
              {location}{inc.year_founded ? ` · Est. ${inc.year_founded}` : ''}
            </div>
          </div>

          {/* Right side stats */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {inc.total_startups_supported != null && (
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
                {inc.total_startups_supported.toLocaleString()}
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#9A9A94', fontSize: 11 }}> supported</span>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#9A9A94', marginTop: 2 }}>
              {programmeCount} programme{programmeCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Description snippet */}
        {inc.description && (
          <p style={{ fontSize: 12, color: '#5C5650', margin: '0 0 8px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
            {inc.description}
          </p>
        )}

        {/* Sectors */}
        {toArr(inc.sectors).length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {toArr(inc.sectors).slice(0, 5).map(s => <SectorChip key={s} sector={s} />)}
            {toArr(inc.sectors).length > 5 && (
              <span style={{ fontSize: 10, color: '#9A9A94' }}>+{toArr(inc.sectors).length - 5}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── main ───────────────────────────────────────────────────────────────────

const ALL_SECTORS = [
  'Agriculture', 'Climate & Environment', 'Education', 'Energy', 'Finance & Fintech',
  'Food & Nutrition', 'Gender & Women', 'Health & Sanitation', 'Livelihoods',
  'Rural Development', 'Skill Development', 'Social Entrepreneurship', 'Technology for Good', 'Water & Sanitation',
]

const ALL_TYPES = Object.entries(INCUBATOR_TYPE_STYLES).map(([id, s]) => ({ id, label: s.label }))

export default function IncubatorsListClient({
  incubators,
  programmesPerIncubator,
}: {
  incubators: Incubator[]
  programmesPerIncubator: Record<string, number>
}) {
  const [typeFilter, setTypeFilter] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [appModelFilter, setAppModelFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'supported'>('name')

  const applicationModels = useMemo(() => {
    const models = new Set(incubators.map(i => i.application_model).filter(Boolean) as string[])
    return Array.from(models).sort()
  }, [incubators])

  const filtered = useMemo(() => {
    let list = incubators.filter(inc => {
      if (typeFilter && inc.incubator_type !== typeFilter) return false
      if (sectorFilter && !toArr(inc.sectors).some(s => s.toLowerCase().includes(sectorFilter.toLowerCase()))) return false
      if (locationFilter === 'india' && inc.hq_country && inc.hq_country !== 'India') return false
      if (locationFilter === 'international' && (!inc.hq_country || inc.hq_country === 'India')) return false
      if (appModelFilter && inc.application_model !== appModelFilter) return false
      return true
    })

    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'year') list = [...list].sort((a, b) => (a.year_founded || 9999) - (b.year_founded || 9999))
    if (sortBy === 'supported') list = [...list].sort((a, b) => (b.total_startups_supported || 0) - (a.total_startups_supported || 0))

    return list
  }, [incubators, typeFilter, sectorFilter, locationFilter, appModelFilter, sortBy])

  const hasFilters = typeFilter || sectorFilter || locationFilter || appModelFilter

  const S = {
    selectBase: {
      padding: '7px 10px', border: '1px solid #E8E4DF', borderRadius: 6,
      fontSize: 13, background: '#FFFFFF', cursor: 'pointer', color: '#3D3830',
      fontFamily: 'Inter, sans-serif',
    } as React.CSSProperties,
  }

  return (
    <>
      {/* FILTERS + SORT */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ ...S.selectBase, color: typeFilter ? '#1A1A1A' : '#9A9A94' }}
        >
          <option value="">All types</option>
          {ALL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>

        <select
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
          style={{ ...S.selectBase, color: sectorFilter ? '#1A1A1A' : '#9A9A94' }}
        >
          <option value="">All sectors</option>
          {ALL_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          style={{ ...S.selectBase, color: locationFilter ? '#1A1A1A' : '#9A9A94' }}
        >
          <option value="">Indian &amp; International</option>
          <option value="india">India-based only</option>
          <option value="international">International only</option>
        </select>

        {applicationModels.length > 0 && (
          <select
            value={appModelFilter}
            onChange={e => setAppModelFilter(e.target.value)}
            style={{ ...S.selectBase, color: appModelFilter ? '#1A1A1A' : '#9A9A94' }}
          >
            <option value="">All application models</option>
            {applicationModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          style={S.selectBase}
        >
          <option value="name">Sort: A–Z</option>
          <option value="year">Sort: Year founded</option>
          <option value="supported">Sort: Most supported</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setTypeFilter(''); setSectorFilter(''); setLocationFilter(''); setAppModelFilter('') }}
            style={{ padding: '7px 12px', border: 'none', background: '#F5F3EE', color: '#6B6560', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            ✕ Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9A9A94', fontFamily: 'JetBrains Mono, monospace' }}>
          {filtered.length} of {incubators.length}
        </span>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9A9A94', fontSize: 14 }}>
          No incubators match your filters.
        </div>
      ) : (
        <div>
          {filtered.map(inc => (
            <IncubatorCard
              key={inc.id}
              inc={inc}
              programmeCount={programmesPerIncubator[inc.id] || 0}
            />
          ))}
        </div>
      )}
    </>
  )
}
