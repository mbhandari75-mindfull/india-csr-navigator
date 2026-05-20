import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fravnwhdpekzhthqaajw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYXZud2hkcGVremh0aHFhYWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg0OTUxNSwiZXhwIjoyMDg5NDI1NTE1fQ.Lvxy0LkDbDOObQI65A232NRxLepBKvlzDyn4R_bFnKQ'
)

async function getOrgId(name) {
  const { data, error } = await supabase.from('organisations').select('id').eq('name', name).single()
  if (error || !data) { console.error(`✗ Org not found: ${name}`); return null }
  return data.id
}

async function run() {
  const [forbes, piramal, huf, bat] = await Promise.all([
    getOrgId('Forbes Marshall Foundation'),
    getOrgId('Piramal Foundation'),
    getOrgId('Hindustan Unilever Foundation'),
    getOrgId('British Asian Trust'),
  ])

  const grants = [
    {
      org_id: forbes,
      ngo_name: 'Akanksha Foundation',
      amount_lakhs: 50,
      fiscal_year: 'FY2024',
      state: 'Maharashtra',
      focus_area: 'Education',
      programme: 'After School Learning Centre',
      description: 'Forbes Marshall supports Akanksha Foundation for after-school learning centres for children from municipal schools in Pune. Source: forbesmarshall.com/social-initiatives',
      verified: true,
      source_url: 'https://www.forbesmarshall.com/social-initiatives/',
    },
    {
      org_id: forbes,
      ngo_name: 'Umeed Child Development Center',
      amount_lakhs: 30,
      fiscal_year: 'FY2024',
      state: 'Maharashtra',
      focus_area: 'Disability & Special Needs',
      programme: 'Child Disability Support Pune',
      description: 'Forbes Marshall Foundation partners with Umeed Child Development Center for children with developmental disabilities in Maharashtra. Source: idronline.org/partner/forbes-foundation',
      verified: true,
      source_url: 'https://idronline.org/partner/forbes-foundation/',
    },
    {
      org_id: piramal,
      ngo_name: 'Piramal Swasthya',
      amount_lakhs: 5000,
      fiscal_year: 'FY2024',
      state: 'Pan-India',
      focus_area: 'Health & Nutrition',
      programme: 'Aspirational Districts Health Programme',
      description: 'Piramal Foundation delivers last-mile healthcare in NITI Aayog Aspirational Districts across UP, Bihar, Rajasthan, MP, Maharashtra, Jharkhand and Assam. Capacity building of frontline health workers. Source: NITI Aayog',
      verified: true,
      source_url: 'https://niti.gov.in/leveraging-csr-complement-indias-covid-19-mitigation-strategy',
    },
    {
      org_id: huf,
      ngo_name: 'WaterAid India',
      amount_lakhs: 200,
      fiscal_year: 'FY2024',
      state: 'Pan-India',
      focus_area: 'Water, Sanitation & Hygiene',
      programme: 'Water Security Programme',
      description: 'Hindustan Unilever Foundation partners with WaterAid India for community water conservation and sanitation in rural Maharashtra and Rajasthan. Source: hul.co.in',
      verified: true,
      source_url: 'https://hul.co.in/planet-and-society',
    },
    {
      org_id: bat,
      ngo_name: 'Pratham Education Foundation',
      amount_lakhs: 150,
      fiscal_year: 'FY2024',
      state: 'Uttar Pradesh',
      focus_area: 'Education',
      programme: 'Quality Education UP',
      description: 'British Asian Trust partners with Pratham for quality education in Uttar Pradesh — learning outcomes for children in government schools. Source: britishasiantrust.org',
      verified: true,
      source_url: 'https://britishasiantrust.org/our-work/india/',
    },
  ]

  // Filter out any rows where org lookup failed
  const valid = grants.filter(g => g.org_id !== null)
  const skipped = grants.length - valid.length
  if (skipped > 0) console.warn(`⚠ ${skipped} grant(s) skipped — org not found`)

  const { data, error } = await supabase.from('grants').insert(valid).select('id')
  if (error) { console.error('✗ Insert failed:', error.message); process.exit(1) }
  console.log(`✓ Inserted ${data.length} grants`)

  // Counts
  const [{ count: foundationCount }, { count: grantCount }] = await Promise.all([
    supabase.from('organisations').select('*', { count: 'exact', head: true }),
    supabase.from('grants').select('*', { count: 'exact', head: true }),
  ])
  const { data: ngoData } = await supabase.from('grants').select('ngo_name')
  const uniqueNGOs = new Set(ngoData?.map(g => g.ngo_name)).size

  console.log(`\n--- Final counts ---`)
  console.log(`Foundations: ${foundationCount}`)
  console.log(`Grants:      ${grantCount}`)
  console.log(`Unique NGOs: ${uniqueNGOs}`)
}

run().catch(console.error)
