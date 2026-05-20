// Add Disability & Special Needs focus area + linked foundations + grants
// Run: node scripts/seed_disability.js (from india-csr-tracker root)
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const FOCUS_AREA_NAME = 'Disability & Special Needs'

const ORG_NAMES = [
  'HCL Foundation',
  'Bajaj Finserv CSR',
  'Infosys Foundation',
  'Tata Trusts',
  'Azim Premji Foundation',
  'Gates Foundation India',
  'Mariwala Health Initiative',
  'EdelGive Foundation',
  'Wipro Foundation',
  'Reliance Foundation',
]

const GRANTS = [
  {
    org_name: 'HCL Foundation',
    ngo_name: 'Amar Seva Sangam',
    amount_lakhs: 500,
    fiscal_year: 'FY2022',
    state: 'Tamil Nadu',
    focus_area: FOCUS_AREA_NAME,
    programme: 'HCLTech Grant Edition V',
    description: 'Amar Seva Sangam won HCLTech Grant Edition V Health Category for community rehabilitation for persons with disabilities in rural Tamil Nadu. Reached 25,000+ people with disabilities.',
    verified: true,
    source_url: 'https://www.hclfoundation.org/hcltech-grant/results',
  },
  {
    org_name: 'Bajaj Finserv CSR',
    ngo_name: 'Youth4Jobs Foundation',
    amount_lakhs: 80,
    fiscal_year: 'FY2024',
    state: 'Pan-India',
    focus_area: FOCUS_AREA_NAME,
    programme: 'Disability Employment',
    description: "Youth4Jobs is South Asia's largest organisation for education and employment of youth with disabilities. Bajaj Finserv Activate partner — 1,300+ corporate partners for disability inclusion.",
    verified: true,
    source_url: 'https://www.aboutbajajfinserv.com/impact-activate',
  },
  {
    org_name: 'Bajaj Finserv CSR',
    ngo_name: 'Mitti Café',
    amount_lakhs: 50,
    fiscal_year: 'FY2024',
    state: 'Pan-India',
    focus_area: FOCUS_AREA_NAME,
    programme: 'Disability Employment Café',
    description: 'Mitti Café provides training and employment to adults with physical, intellectual and psychiatric disabilities through café chain model. Bajaj Finserv Activate partner.',
    verified: true,
    source_url: 'https://www.aboutbajajfinserv.com/impact-activate',
  },
  {
    org_name: 'Bajaj Finserv CSR',
    ngo_name: 'Ummeed Child Development Center',
    amount_lakhs: 60,
    fiscal_year: 'FY2024',
    state: 'Maharashtra',
    focus_area: FOCUS_AREA_NAME,
    programme: 'Child Disability Support',
    description: 'Ummeed helps children with autism, cerebral palsy, down syndrome and intellectual disabilities reach their full potential. Bajaj Finserv Activate partner in Mumbai.',
    verified: true,
    source_url: 'https://www.aboutbajajfinserv.com/impact-activate',
  },
  {
    org_name: 'Bajaj Finserv CSR',
    ngo_name: 'Umang — Children with Brain Damage',
    amount_lakhs: 40,
    fiscal_year: 'FY2024',
    state: 'Rajasthan',
    focus_area: FOCUS_AREA_NAME,
    programme: 'Cerebral Palsy Support',
    description: 'Umang works with children with cerebral palsy, intellectual disability, autism and multiple disabilities in Rajasthan. Bajaj Finserv Activate partner.',
    verified: true,
    source_url: 'https://www.aboutbajajfinserv.com/impact-activate',
  },
  {
    org_name: 'Tata Trusts',
    ngo_name: 'Sense International India',
    amount_lakhs: 150,
    fiscal_year: 'FY2024',
    state: 'Pan-India',
    focus_area: FOCUS_AREA_NAME,
    programme: 'Deafblind Support',
    description: 'Tata Trusts supports Sense International India for deafblind persons — education, rehabilitation and community inclusion across India.',
    verified: true,
    source_url: 'https://www.tatatrusts.org',
  },
  {
    org_name: 'Infosys Foundation',
    ngo_name: 'Sightsavers India',
    amount_lakhs: 200,
    fiscal_year: 'FY2023',
    state: 'Karnataka',
    focus_area: FOCUS_AREA_NAME,
    programme: 'Visual Impairment Programme',
    description: 'Infosys Foundation supports Sightsavers India for inclusive education for visually impaired children and cataract surgery programme in Karnataka and Tamil Nadu.',
    verified: true,
    source_url: 'https://www.sightsavers.org/india',
  },
  {
    org_name: 'Mariwala Health Initiative',
    ngo_name: 'Sangath',
    amount_lakhs: 350,
    fiscal_year: 'FY2024',
    state: 'Goa',
    focus_area: FOCUS_AREA_NAME,
    programme: 'Mental Health and Disability',
    description: 'Mariwala Health Initiative supports Sangath for community mental health and disability — Lay Counsellor model for autism, intellectual disability and mental health in Goa and Delhi.',
    verified: true,
    source_url: 'https://mariwalahealthinitiative.org',
  },
]

async function run() {
  // 1. Upsert focus area
  console.log(`\n1. Upserting focus area: "${FOCUS_AREA_NAME}"`)
  const { data: fa, error: faErr } = await sb
    .from('focus_areas')
    .upsert({ name: FOCUS_AREA_NAME }, { onConflict: 'name' })
    .select()
    .single()
  if (faErr) { console.error('focus_areas error:', faErr.message); process.exit(1) }
  console.log(`   ✓ focus_area id: ${fa.id}`)

  // 2. Fetch all relevant org IDs
  console.log(`\n2. Fetching org IDs for ${ORG_NAMES.length} foundations`)
  const { data: orgs, error: orgErr } = await sb
    .from('organisations')
    .select('id, name')
    .in('name', ORG_NAMES)
  if (orgErr) { console.error('organisations error:', orgErr.message); process.exit(1) }
  console.log(`   Found ${orgs.length}/${ORG_NAMES.length} orgs`)
  const missing = ORG_NAMES.filter(n => !orgs.find(o => o.name === n))
  if (missing.length) console.warn('   ⚠ Not found in DB:', missing)

  // 3. Link orgs to focus area
  console.log(`\n3. Linking ${orgs.length} foundations to "${FOCUS_AREA_NAME}"`)
  const links = orgs.map(o => ({ org_id: o.id, focus_area_id: fa.id, is_primary: false }))
  const { error: linkErr } = await sb
    .from('org_focus_areas')
    .upsert(links, { onConflict: 'org_id,focus_area_id' })
  if (linkErr) { console.error('org_focus_areas error:', linkErr.message); process.exit(1) }
  console.log(`   ✓ Linked ${links.length} foundations`)

  // 4. Insert grants
  console.log(`\n4. Inserting ${GRANTS.length} grant records`)
  const orgMap = Object.fromEntries(orgs.map(o => [o.name, o.id]))
  let inserted = 0, skipped = 0
  for (const g of GRANTS) {
    const org_id = orgMap[g.org_name]
    if (!org_id) { console.warn(`   ⚠ Skipping grant — org not found: ${g.org_name}`); skipped++; continue }
    const { org_name, ...grantData } = g
    const { error: gErr } = await sb.from('grants').insert({ ...grantData, org_id })
    if (gErr) {
      // Ignore duplicate key errors gracefully
      if (gErr.code === '23505') { console.log(`   ~ Skipped duplicate: ${g.ngo_name}`); skipped++ }
      else { console.error(`   ✗ Grant error (${g.ngo_name}):`, gErr.message) }
    } else {
      console.log(`   ✓ ${g.ngo_name} — ₹${g.amount_lakhs}L (${g.fiscal_year})`)
      inserted++
    }
  }

  // 5. Summary
  console.log(`\n── Summary ─────────────────────────────────`)
  console.log(`   Focus area created/confirmed: 1`)
  console.log(`   Foundations linked:           ${links.length}`)
  console.log(`   Grants inserted:              ${inserted}`)
  if (skipped) console.log(`   Skipped (dup/missing):        ${skipped}`)

  // 6. Verify counts
  const { count: linkCount } = await sb
    .from('org_focus_areas')
    .select('*', { count: 'exact', head: true })
    .eq('focus_area_id', fa.id)
  const { count: grantCount } = await sb
    .from('grants')
    .select('*', { count: 'exact', head: true })
    .eq('focus_area', FOCUS_AREA_NAME)
  console.log(`\n── Live counts in Supabase ─────────────────`)
  console.log(`   Foundations with Disability & Special Needs: ${linkCount}`)
  console.log(`   Grant records for disability NGOs:           ${grantCount}`)
  console.log(`───────────────────────────────────────────────\n`)
}

run().catch(e => { console.error(e); process.exit(1) })
