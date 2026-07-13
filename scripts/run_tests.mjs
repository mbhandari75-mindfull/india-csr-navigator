import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const today = new Date().toISOString().slice(0, 10)

function header(test) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(test)
  console.log('─'.repeat(60))
}

function pass(msg) { console.log(`  ✓ PASS — ${msg}`) }
function issue(msg) { console.log(`  ✗ ISSUE — ${msg}`) }
function row(r) { console.log('  ', JSON.stringify(r)) }

// ── GRANTS ────────────────────────────────────────────────────

header('G1: Open grants with missing or past deadlines')
{
  const { data } = await sb.from('active_grants')
    .select('id, programme_name, status, application_deadline, is_year_round')
    .eq('status', 'open').eq('is_year_round', false)
  const issues = (data || []).filter(g =>
    !g.application_deadline || g.application_deadline < today
  )
  if (issues.length === 0) pass('All open grants have future deadlines')
  else issues.forEach(g => issue(`${g.programme_name} — deadline: ${g.application_deadline ?? 'NULL'}`))
}

header('G2: Recently-closed grants with future deadlines')
{
  const { data } = await sb.from('active_grants')
    .select('id, programme_name, status, application_deadline')
    .eq('status', 'recently_closed')
  const issues = (data || []).filter(g => g.application_deadline && g.application_deadline > today)
  if (issues.length === 0) pass('No recently-closed grants have future deadlines')
  else issues.forEach(g => issue(`${g.programme_name} — deadline: ${g.application_deadline}`))
}

header('G3: Orphan grants (no org_id)')
{
  const { data } = await sb.from('active_grants')
    .select('id, programme_name, status')
    .is('org_id', null)
  if (!data || data.length === 0) pass('All grants have an org_id')
  else data.forEach(g => issue(`${g.programme_name} (${g.id})`))
}

header('G4: Grants missing programme_name or thin description')
{
  const { data } = await sb.from('active_grants')
    .select('id, programme_name, status, programme_description')
  const issues = (data || []).filter(g =>
    !g.programme_name || (g.programme_description || '').length < 30
  )
  if (issues.length === 0) pass('All grants have names and descriptions ≥ 30 chars')
  else issues.forEach(g => issue(`${g.programme_name || '(unnamed)'} — desc length: ${(g.programme_description || '').length}`))
}

header('G5: Status distribution')
{
  const { data } = await sb.from('active_grants').select('status')
  const counts = {}
  ;(data || []).forEach(g => { counts[g.status] = (counts[g.status] || 0) + 1 })
  Object.entries(counts).sort().forEach(([s, c]) => console.log(`  ${s}: ${c}`))
}

header('G6: Organisations with no active grants linked')
{
  const { data: orgs } = await sb.from('organisations').select('id, name, type')
  const { data: grants } = await sb.from('active_grants').select('org_id')
  const linkedOrgIds = new Set((grants || []).map(g => g.org_id))
  const unlinked = (orgs || []).filter(o => !linkedOrgIds.has(o.id))
  console.log(`  ${unlinked.length} of ${(orgs || []).length} organisations have no active grants`)
  unlinked.slice(0, 10).forEach(o => console.log(`  · ${o.name} (${o.type})`))
  if (unlinked.length > 10) console.log(`  … and ${unlinked.length - 10} more`)
}

header('G7: Possible duplicate active grants')
{
  const { data } = await sb.from('active_grants').select('org_id, programme_name')
  const seen = {}
  ;(data || []).forEach(g => {
    const key = `${g.org_id}||${g.programme_name}`
    seen[key] = (seen[key] || 0) + 1
  })
  const dups = Object.entries(seen).filter(([, c]) => c > 1)
  if (dups.length === 0) pass('No duplicates found')
  else dups.forEach(([k, c]) => issue(`${k.split('||')[1]} — ${c} copies`))
}

header('G8: Open grants sample (visual check)')
{
  const { data } = await sb.from('active_grants')
    .select('programme_name, application_deadline, grant_size_text, organisations(name)')
    .eq('status', 'open')
    .order('application_deadline', { ascending: true, nullsFirst: false })
    .limit(14)
  ;(data || []).forEach(g =>
    console.log(`  ${g.programme_name} | ${(g.organisations)?.name} | ${g.application_deadline} | ${g.grant_size_text}`)
  )
}

// ── INCUBATORS ────────────────────────────────────────────────

header('I1: Incubators with zero programmes')
{
  const { data: inc } = await sb.from('incubators').select('id, name, slug')
  const { data: prog } = await sb.from('incubator_programmes').select('incubator_id')
  const linked = new Set((prog || []).map(p => p.incubator_id))
  const none = (inc || []).filter(i => !linked.has(i.id))
  if (none.length === 0) pass('All incubators have at least one programme')
  else none.forEach(i => issue(`${i.name} (${i.slug})`))
}

header('I2: Programmes with broken incubator_id')
{
  const { data: inc } = await sb.from('incubators').select('id')
  const { data: prog } = await sb.from('incubator_programmes').select('id, programme_name, incubator_id')
  const validIds = new Set((inc || []).map(i => i.id))
  const broken = (prog || []).filter(p => !validIds.has(p.incubator_id))
  if (broken.length === 0) pass('All programmes link to a valid incubator')
  else broken.forEach(p => issue(`${p.programme_name} — bad incubator_id: ${p.incubator_id}`))
}

header('I3: Cohorts with broken programme_id')
{
  const { data: prog } = await sb.from('incubator_programmes').select('id')
  const { data: cohorts } = await sb.from('incubator_cohorts').select('id, cohort_name, programme_id')
  const validIds = new Set((prog || []).map(p => p.id))
  const broken = (cohorts || []).filter(c => !validIds.has(c.programme_id))
  if (broken.length === 0) pass('All cohorts link to a valid programme')
  else broken.forEach(c => issue(`${c.cohort_name} — bad programme_id: ${c.programme_id}`))
}

header('I4: Duplicate incubator slugs')
{
  const { data } = await sb.from('incubators').select('slug')
  const seen = {}
  ;(data || []).forEach(i => { seen[i.slug] = (seen[i.slug] || 0) + 1 })
  const dups = Object.entries(seen).filter(([, c]) => c > 1)
  if (dups.length === 0) pass('No duplicate slugs')
  else dups.forEach(([s, c]) => issue(`slug "${s}" appears ${c} times`))
}

header('I5: Incubators with thin or missing descriptions')
{
  const { data } = await sb.from('incubators').select('name, slug, description')
  const thin = (data || []).filter(i => !i.description || i.description.length < 100)
  if (thin.length === 0) pass('All descriptions ≥ 100 chars')
  else thin.forEach(i => issue(`${i.name} — ${i.description?.length ?? 0} chars`))
}

header('I6: Cohorts with no named winners')
{
  const { data: cohorts } = await sb.from('incubator_cohorts')
    .select('cohort_name, cohort_year, programme_id, notable_winners')
  const { data: prog } = await sb.from('incubator_programmes').select('id, programme_name, incubator_id')
  const { data: inc } = await sb.from('incubators').select('id, name')
  const progMap = Object.fromEntries((prog || []).map(p => [p.id, p]))
  const incMap = Object.fromEntries((inc || []).map(i => [i.id, i]))

  const noWinners = (cohorts || []).filter(c => {
    const w = c.notable_winners
    return !w || w === '' || w === '{}' || (Array.isArray(w) && w.length === 0)
  })
  if (noWinners.length === 0) pass('All cohorts have named winners')
  else {
    console.log(`  ${noWinners.length} cohorts have no named winners:`)
    noWinners.forEach(c => {
      const p = progMap[c.programme_id]
      const org = p ? incMap[p.incubator_id]?.name : '?'
      console.log(`  · ${org} / ${p?.programme_name} / ${c.cohort_name || 'unnamed'} (${c.cohort_year})`)
    })
  }
}

header('I7: Data quality distribution')
{
  const { data } = await sb.from('incubators').select('data_quality')
  const counts = {}
  ;(data || []).forEach(i => { const k = i.data_quality || 'null'; counts[k] = (counts[k] || 0) + 1 })
  Object.entries(counts).sort().forEach(([q, c]) => console.log(`  ${q}: ${c}`))
}

header('I8: Incubators with empty/null sectors')
{
  const { data } = await sb.from('incubators').select('name, slug, sectors')
  const empty = (data || []).filter(i => {
    const s = i.sectors
    return !s || s === '' || s === '{}' || (Array.isArray(s) && s.length === 0)
  })
  if (empty.length === 0) pass('All incubators have sectors populated')
  else empty.forEach(i => issue(`${i.name} — sectors: ${JSON.stringify(i.sectors)}`))
}

header('I9: Programme and cohort counts per incubator')
{
  const { data: inc } = await sb.from('incubators').select('id, name, incubator_type')
  const { data: prog } = await sb.from('incubator_programmes').select('id, incubator_id')
  const { data: cohorts } = await sb.from('incubator_cohorts').select('id, programme_id')
  const progByInc = {}
  ;(prog || []).forEach(p => { progByInc[p.incubator_id] = (progByInc[p.incubator_id] || []).concat(p.id) })
  const cohortsByProg = {}
  ;(cohorts || []).forEach(c => { cohortsByProg[c.programme_id] = (cohortsByProg[c.programme_id] || 0) + 1 })

  const rows = (inc || []).map(i => {
    const progIds = progByInc[i.id] || []
    const cohortCount = progIds.reduce((sum, pid) => sum + (cohortsByProg[pid] || 0), 0)
    return { name: i.name, type: i.incubator_type, programmes: progIds.length, cohorts: cohortCount }
  }).sort((a, b) => b.cohorts - a.cohorts || b.programmes - a.programmes)

  rows.forEach(r => console.log(`  ${r.name} (${r.type}) — ${r.programmes} progs, ${r.cohorts} cohorts`))
}

header('I10: Incubator type distribution')
{
  const { data } = await sb.from('incubators').select('incubator_type')
  const counts = {}
  ;(data || []).forEach(i => { counts[i.incubator_type] = (counts[i.incubator_type] || 0) + 1 })
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`))
}

header('I11: Programme type distribution')
{
  const { data } = await sb.from('incubator_programmes').select('programme_type')
  const counts = {}
  ;(data || []).forEach(p => { counts[p.programme_type] = (counts[p.programme_type] || 0) + 1 })
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`))
}

header('I12: Recent cohorts (2024+)')
{
  const { data: cohorts } = await sb.from('incubator_cohorts')
    .select('cohort_name, cohort_year, number_of_winners, programme_id')
    .gte('cohort_year', 2024)
    .order('cohort_year', { ascending: false })
  const { data: prog } = await sb.from('incubator_programmes').select('id, programme_name, incubator_id')
  const { data: inc } = await sb.from('incubators').select('id, name')
  const progMap = Object.fromEntries((prog || []).map(p => [p.id, p]))
  const incMap = Object.fromEntries((inc || []).map(i => [i.id, i]))

  if (!cohorts || cohorts.length === 0) {
    console.log('  No cohorts from 2024+')
  } else {
    cohorts.forEach(c => {
      const p = progMap[c.programme_id]
      const org = p ? incMap[p.incubator_id]?.name : '?'
      console.log(`  ${c.cohort_year} | ${org} / ${p?.programme_name} / ${c.cohort_name || 'unnamed'} — ${c.number_of_winners ?? '?'} winners`)
    })
  }
}

console.log('\n' + '═'.repeat(60))
console.log('Test suite complete.')
console.log('═'.repeat(60) + '\n')
