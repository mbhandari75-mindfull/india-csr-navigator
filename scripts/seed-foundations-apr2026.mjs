import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fravnwhdpekzhthqaajw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYXZud2hkcGVremh0aHFhYWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0OTUxNSwiZXhwIjoyMDg5NDI1NTE1fQ.Lvxy0LkDbDOObQI65A232NRxLepBKvlzDyn4R_bFnKQ'
)

const ORGS = [
  {
    name: 'ATE Chandra Foundation',
    parent_company: 'Amit and Archana Chandra',
    type: 'Philanthropic',
    founded: 2010,
    spend_label: '₹20–40 Cr/yr',
    spend_min_cr: 20,
    spend_max_cr: 40,
    description: 'ATE Chandra Foundation works closely with nonprofits and governments to design and scale solutions for the most marginalised populations. Two key focus areas: social sector capacity building — building the capacity of professionals and organisations for a stronger nonprofit sector — and sustainable rural development including water body rejuvenation and natural farming. Verified IDR partner.',
    geography: 'Pan-India',
    grant_size: '₹25L–2 Cr',
    gender_score: 8,
    grant_tier: 'medium',
    application_type: 'open',
    verified: true,
    website: 'atechandrafoundation.org',
    data_quality: 'verified',
    last_verified_date: '2026-04-05',
    focus: ['Livelihoods', 'Rural Development', 'Women & Girls', 'Education'],
    primary: 'Livelihoods',
  },
  {
    name: 'H T Parekh Foundation',
    parent_company: 'HDFC Limited',
    type: 'Philanthropic',
    founded: 2014,
    spend_label: '₹15–25 Cr/yr',
    spend_min_cr: 15,
    spend_max_cr: 25,
    description: 'H T Parekh Foundation established in 2012 to honour Shri H T Parekh, founder of HDFC Limited. Distinct from HDFC Bank Parivartan. Flagship programme U.R.B.A.N. (Urban Resilience Building Action Network) builds resilience to climate stressors in urban communities. Focus on urban livelihoods, climate adaptation and financial inclusion. Verified IDR partner.',
    geography: 'Mumbai, Urban India',
    grant_size: '₹25L–1 Cr',
    gender_score: 7,
    grant_tier: 'medium',
    application_type: 'open',
    verified: true,
    website: 'htparekh.in',
    data_quality: 'verified',
    last_verified_date: '2026-04-05',
    focus: ['Livelihoods', 'Environment', 'Women & Girls'],
    primary: 'Livelihoods',
  },
  {
    name: 'Hindustan Unilever Foundation',
    parent_company: 'Hindustan Unilever Limited',
    type: 'Corporate',
    founded: 2010,
    spend_label: '₹80–120 Cr/yr',
    spend_min_cr: 80,
    spend_max_cr: 120,
    description: 'Hindustan Unilever Foundation (HUF) works closely with nonprofits and state governments to develop solutions for water security and rural well-being. Primary focus on water conservation, rural livelihoods and women empowerment. Works at scale across Maharashtra, Rajasthan, UP and other water-stressed states. Verified IDR partner and major WASH funder.',
    geography: 'Maharashtra, Rajasthan, UP, Tamil Nadu',
    grant_size: '₹50L–5 Cr',
    gender_score: 8,
    grant_tier: 'large',
    application_type: 'open',
    verified: true,
    website: 'hul.co.in/planet-and-society',
    data_quality: 'verified',
    last_verified_date: '2026-04-05',
    focus: ['Water, Sanitation & Hygiene', 'Rural Development', 'Women & Girls', 'Livelihoods'],
    primary: 'Water, Sanitation & Hygiene',
  },
  {
    name: 'Piramal Foundation',
    parent_company: 'Piramal Group',
    type: 'Philanthropic',
    founded: 2006,
    spend_label: '₹100–150 Cr/yr',
    spend_min_cr: 100,
    spend_max_cr: 150,
    description: 'Piramal Foundation is the philanthropic arm of Piramal Group. Official NITI Aayog partner for Transformation of Aspirational Districts — supporting 25 districts across 7 states in Health & Nutrition and Education. Develops innovative, replicable and impact-oriented solutions. Runs Piramal Swasthya for last-mile healthcare delivery. Verified NITI Aayog partner.',
    geography: 'Aspirational Districts — UP, Bihar, Rajasthan, MP, Maharashtra, Jharkhand, Assam',
    grant_size: '₹50L–5 Cr',
    gender_score: 7,
    grant_tier: 'large',
    application_type: 'open',
    verified: true,
    website: 'piramalfoundation.org',
    data_quality: 'audited',
    last_verified_date: '2026-04-05',
    focus: ['Health & Nutrition', 'Education', 'Rural Development', 'Livelihoods'],
    primary: 'Health & Nutrition',
  },
  {
    name: 'Koita Foundation',
    parent_company: 'Rizwan and Rekha Koita',
    type: 'Philanthropic',
    founded: 2017,
    spend_label: '₹10–20 Cr/yr',
    spend_min_cr: 10,
    spend_max_cr: 20,
    description: 'Koita Foundation focuses on NGO digital transformation and digital health. Partners with nonprofits to digitally transform operations using data and analytics. Also partners with hospitals and healthcare technology companies for digital health adoption in India. Verified IDR partner. Notable for tech-enabled capacity building of NGOs.',
    geography: 'Pan-India',
    grant_size: '₹10L–75L',
    gender_score: 7,
    grant_tier: 'small',
    application_type: 'open',
    verified: true,
    website: 'koitafoundation.org',
    data_quality: 'verified',
    last_verified_date: '2026-04-05',
    focus: ['Health & Nutrition', 'Livelihoods', 'Education'],
    primary: 'Health & Nutrition',
  },
  {
    name: 'Indian Oil Foundation',
    parent_company: 'Indian Oil Corporation Limited',
    type: 'PSU',
    founded: 2000,
    spend_label: '₹250–350 Cr/yr',
    spend_min_cr: 250,
    spend_max_cr: 350,
    description: "Indian Oil Corporation CSR is one of India's largest PSU CSR spenders. NITI Aayog verified funder in Aspirational Districts — provided bike ambulances in Dumka for last-mile healthcare. Focus on education, healthcare, rural development and environmental sustainability near refineries and pipelines. FY2024 CSR spend approximately ₹300 Cr.",
    geography: 'Pan-India · Priority: Aspirational Districts, refinery locations',
    grant_size: '₹25L–5 Cr',
    gender_score: 6,
    grant_tier: 'large',
    application_type: 'open',
    verified: true,
    website: 'iocl.com/csr',
    data_quality: 'verified',
    last_verified_date: '2026-04-05',
    focus: ['Education', 'Health & Nutrition', 'Rural Development', 'Environment'],
    primary: 'Education',
  },
  {
    name: 'British Asian Trust',
    parent_company: 'Prince Charles (founded)',
    type: 'International',
    founded: 2007,
    spend_label: '₹30–50 Cr/yr',
    spend_min_cr: 30,
    spend_max_cr: 50,
    description: 'British Asian Trust is a diaspora-led international development organisation delivering high-quality programmes in India. Founded by HRH The Prince of Wales (now King Charles III) and British Asian business leaders. Focus on education, livelihoods, mental health and criminal justice reform. Verified IDR partner. Highly relevant for Indian diaspora audience.',
    geography: 'Pan-India · Priority: UP, Bihar, Rajasthan',
    grant_size: '₹25L–3 Cr',
    gender_score: 8,
    grant_tier: 'medium',
    application_type: 'open',
    verified: true,
    website: 'britishasiantrust.org',
    data_quality: 'verified',
    last_verified_date: '2026-04-05',
    focus: ['Education', 'Livelihoods', 'Women & Girls', 'Health & Nutrition'],
    primary: 'Education',
  },
]

async function run() {
  // 1. Fetch all focus areas once
  const { data: allFAs, error: faErr } = await supabase.from('focus_areas').select('id, name')
  if (faErr) { console.error('Failed to fetch focus areas:', faErr.message); process.exit(1) }
  const faMap = Object.fromEntries(allFAs.map(f => [f.name, f.id]))
  console.log('Focus areas loaded:', Object.keys(faMap).length)

  let inserted = 0, skipped = 0

  for (const org of ORGS) {
    const { focus, primary, ...orgData } = org

    // Check for existing
    const { data: existing } = await supabase.from('organisations').select('id').eq('name', orgData.name).single()
    if (existing) {
      console.log(`⚠  SKIP (already exists): ${orgData.name}`)
      skipped++
      continue
    }

    // Insert org
    const { data: newOrg, error: orgErr } = await supabase.from('organisations').insert(orgData).select('id').single()
    if (orgErr) { console.error(`✗ Failed to insert ${orgData.name}:`, orgErr.message); continue }

    // Insert focus areas
    const faRows = focus
      .filter(f => faMap[f])
      .map(f => ({ org_id: newOrg.id, focus_area_id: faMap[f], is_primary: f === primary }))

    const missing = focus.filter(f => !faMap[f])
    if (missing.length) console.warn(`  ⚠ Focus areas not found in DB: ${missing.join(', ')}`)

    if (faRows.length > 0) {
      const { error: faInsErr } = await supabase.from('org_focus_areas').insert(faRows)
      if (faInsErr) console.error(`  ✗ Focus area link failed for ${orgData.name}:`, faInsErr.message)
      else console.log(`  ✓ Linked ${faRows.length} focus areas`)
    }

    console.log(`✓ Inserted: ${orgData.name}`)
    inserted++
  }

  // Summary
  const { count } = await supabase.from('organisations').select('*', { count: 'exact', head: true })
  const { data: recent } = await supabase.from('organisations').select('name').order('created_at', { ascending: false }).limit(10)

  console.log(`\n--- Done: ${inserted} inserted, ${skipped} skipped ---`)
  console.log(`Total foundations in DB: ${count}`)
  console.log('Most recent 10:')
  recent?.forEach(r => console.log(' -', r.name))
}

run().catch(console.error)
