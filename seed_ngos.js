// ============================================================
// India CSR Navigator — NGO Seed Script
// ============================================================
// Setup:  npm install @supabase/supabase-js
// Run:    SUPABASE_SERVICE_KEY=your_key node seed_ngos.js
//
// Service role key: Supabase Dashboard → Settings → API → service_role
// This key bypasses RLS — keep it secret, never commit it.
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fravnwhdpekzhthqaajw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================
// FOCUS AREA ID MAP — confirmed from DB
// ============================================================
const FOCUS_AREAS = {
  'Women & Girls':             1,
  'Menstrual Health':          2,
  'Education':                 3,
  'Health & Nutrition':        4,
  'Livelihoods':               5,
  'Environment':               6,
  'Rural Development':         7,
  'Water, Sanitation & Hygiene': 8,
  'Disability & Special Needs': 17,
  'Skill Development':         18,
  'Culture, Heritage & Crafts': 19,
};

// ============================================================
// FOUNDATION ORG_ID MAP — confirmed from DB
// source = 'ngo_submission' prevents automated overwrites
// ============================================================
const FOUNDATIONS = {
  'Godrej Foundation':              '8fce5754-583d-407c-b0fa-6b72848a9def',
  'Forbes Marshall Foundation':     '64c1ff2f-ef00-4e6c-b413-188d601faf1f',
  'EXL Service CSR':                '3562c9db-ffbb-4ae4-8e76-d06b17fc380c',
  'Genpact CSR':                    'd37b0693-0c9b-4f5a-ae27-4d6f4c90c7a9',
  'Aadhar Housing Finance CSR':     '640edded-8517-4ec3-981d-66912c128c70',
  'Suzlon Foundation':              '485b08c0-8331-4da0-9e60-86d87b5e5718',
  'Wipro Foundation':               'e7254561-a66c-4d6b-9234-25361fd7a74a',
  'SBI Foundation':                 'd796e764-2965-4d79-b0fa-b0951f8e15c7',
  'Kotak Mahindra Bank CSR':        'ff72f08d-096d-47a5-a608-151c63f3ad44',
  'HDFC Bank Parivartan':           '51bdfaf4-d7b7-4f29-bb2b-8e93df134f9f',
  'Cadence Design Systems CSR':     'c0e1b6db-51ae-49c3-9569-c6c60ad9057a',
  'Hindustan Unilever Foundation':  '5e5f4af3-163e-4433-aa79-1c8c59991812',
};

// ============================================================
// SAUKHYAM GRANT IDS TO DELETE — confirmed from DB
// ============================================================
const SAUKHYAM_GRANT_IDS = [
  '5ebe8ebd-1d17-4d73-984c-a1178f2b595d',
  '620da1c1-289f-48ed-8992-44a68d23d058',
  'c3274475-0d69-4e3b-885f-ceffe23c8ca7',
  'f05b6145-371b-4ea1-8fd6-73d4d8b7e0e8',
  '6a648f38-d990-45f4-b3b0-5e15af68cd7b',
];

// ============================================================
// NGO DATA — all submissions verified May 2026
// grants[] only includes foundations confirmed in DB with amounts
// ============================================================
const NGO_SUBMISSIONS = [
  {
    name: 'VOON HANDS FOUNDATION',
    website: 'https://www.voonhandsfoundation.com',
    contact_name: 'D. Parameswari',
    contact_email: 'voonhandsfoundation@gmail.com',
    states: ['Andhra Pradesh', 'Telangana'],
    focus_areas: ['Environment'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Founded August 2024. Works on monkey-human conflict mitigation, Narsapur, Medak District. Funder Vaaradhi Trust unverifiable — no grant records added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'The Community for Resource Elevation and Effective Development (CREED)',
    website: 'https://creedimpact.org',
    contact_name: 'Jennifer Borgohain',
    contact_email: 'jenniferborgohain@gmail.com',
    contact_linkedin: 'https://linkedin.com/in/jenniferborgohain',
    description: 'Women-led NGO founded 2014, Guwahati. Works in agriculture, handloom, handicrafts, skill development and livelihoods across North East India. CSR-1 registered. Partners include Star Cement Charitable Trust and Indian Oil CSR.',
    founded: 2014,
    states: ['Assam', 'North East India'],
    focus_areas: ['Women & Girls', 'Livelihoods', 'Skill Development', 'Rural Development', 'Culture, Heritage & Crafts'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Star Cement and Indian Oil listed as CSR funders. No grant amounts provided — grant records not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'SHIELD Foundation',
    website: 'https://shieldfoundation.in',
    contact_name: 'Mrs. Swati Ingole',
    contact_email: 'shieldfoundation@gmail.com',
    contact_linkedin: 'https://www.linkedin.com/company/shield-foundation-india/about/',
    states: ['Maharashtra'],
    focus_areas: ['Health & Nutrition', 'Livelihoods', 'Skill Development'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Tech Mahindra Foundation SMART project partnership confirmed. Also funded by ONGC, BPCL, RCF, Volkart Foundation. No grant amounts provided.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Udayan Care',
    website: 'https://udayancare.org',
    contact_name: 'Anjali Hegde',
    contact_email: 'Anjali.Hegde@udayancare.org',
    contact_linkedin: 'https://www.linkedin.com/in/anjalihegde/',
    description: 'Founded 1994. Works in child and youth care via Udayan Ghar group homes, aftercare for care leavers, education and skilling for adolescent girls. 11 Udayan Ghars across 4 states. 18,500+ Shalini Fellows across 15 states. FCRA compliant.',
    founded: 1994,
    states: ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Andhra Pradesh', 'Telangana', 'Delhi', 'Haryana', 'Punjab'],
    focus_areas: ['Education', 'Women & Girls', 'Skill Development'],
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'Genpact CSR',
        amount_lakhs: 100,
        fiscal_year: 'FY2025-26',
        programme: 'Udayan Shalini Fellowship Program',
        focus_area: 'Education',
        state: 'Pan-India',
        verified: true,
      }
    ]
  },
  {
    name: 'Operation Eyesight India',
    website: 'https://operationeyesightindia.org',
    contact_name: 'Subhadip Bhattacharya',
    contact_email: 'bhattacharays@operationeyesight.com',
    contact_linkedin: 'https://www.linkedin.com/in/subhadipb/',
    states: ['Maharashtra', 'Karnataka', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Jharkhand', 'Odisha', 'West Bengal', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Assam', 'North East India'],
    focus_areas: ['Education', 'Health & Nutrition', 'Water, Sanitation & Hygiene', 'Rural Development', 'Disability & Special Needs'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Azim Premji Foundation grant 1.6 Cr (2025) for Cataract Blindness Block, Anuppur MP — philanthropic funder, not Schedule VII CSR. Grant not added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Sebama Charitable Foundation',
    website: 'https://www.facebook.com/share/1YVPgvRkNe/',
    contact_name: 'Dr. Stany Pancras',
    contact_email: 'stanypancras@gmail.com',
    contact_linkedin: 'https://linkedin.com/in/stanypancras',
    description: 'Runs a home for children and senior citizens in Tamil Nadu.',
    states: ['Tamil Nadu'],
    focus_areas: ['Education', 'Health & Nutrition'],
    verified: false,
    source: 'ngo_submission',
    notes: 'No website found — Facebook only. Cisco listed as funder but could not be verified. Flagged for follow-up before grant record is added.',
    data_quality: 'low',
    grants: []
  },
  {
    name: 'Society for Animal Health Agriculture Science and Humanity (SAHASH)',
    website: 'https://www.sahashindia.org',
    contact_name: 'Lalmani Kashyap',
    contact_email: 'lalmani@sahashindia.org',
    contact_linkedin: 'https://www.linkedin.com/in/lal-mani-a40b07a/',
    states: ['Uttar Pradesh', 'Delhi', 'Haryana'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Menstrual Health', 'Livelihoods', 'Environment', 'Disability & Special Needs'],
    awards: 'NYKS Amethi award (2023, 2024). Independence Day recognition at BBAU Lucknow (2025). Honoured by Minda Corporation for disability empowerment camp (March 2026). UPRSL recognition (Dec 2025).',
    verified: true,
    source: 'ngo_submission',
    notes: 'Spark Minda Foundation CSR confirmed as funder. No grant amount provided — grant record not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Magic Bus India Foundation',
    website: 'https://www.magicbus.org',
    contact_name: 'Robin Mathew',
    contact_email: 'robin.mathew@magicbusindia.org',
    contact_linkedin: 'https://www.linkedin.com/in/robin-mathew-45818814/',
    description: 'Pan-India adolescent development organisation. 135 livelihood centres, 1200+ college partnerships, 2400 government schools. 35 lakh adolescents impacted. 7.5 lakh youth trained and placed. Partnerships with 10 state governments.',
    states: ['Pan-India'],
    focus_areas: ['Education', 'Women & Girls', 'Livelihoods', 'Skill Development'],
    awards: 'Best NGO in Skill Development — 7th National CSR E Summit. Excellent NGO of the Year — CMAI. ET Now Leadership Award. Rashtriya Khel Protsahan Puraskar.',
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'EXL Service CSR',
        amount_lakhs: 245,
        fiscal_year: 'FY2023',
        programme: 'Life Skills and FLN for Adolescent',
        focus_area: 'Education',
        state: 'Pan-India',
        verified: true,
      }
    ]
  },
  {
    name: 'Modern Educational Social & Cultural Organisation (MESCO)',
    website: 'https://www.mescotrust.org',
    contact_name: 'Mohammed Faizan',
    contact_email: 'frd.hrm@mescotrust.org',
    contact_linkedin: 'https://www.linkedin.com/company/mesco-trust',
    description: 'Secular trust registered 1968 with Charity Commissioner of Mumbai. Works in education, medical assistance and poverty relief. Impacts 15,000+ families annually.',
    founded: 1968,
    states: ['Maharashtra'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development'],
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'HDFC Bank Parivartan',
        amount_lakhs: 55,
        fiscal_year: 'FY2025-26',
        programme: 'Education',
        focus_area: 'Education',
        state: 'Maharashtra',
        verified: true,
      }
    ]
  },
  {
    name: 'United Conservation Movement & Charitable Trust (UCM Trust)',
    website: 'https://www.unitedconservationmevement.in',
    contact_name: 'Daniel Sukumardas',
    contact_email: 'unitedconsdrvationmovement@gmail.com',
    contact_linkedin: 'https://linkedin.com/in/daniel-sukumardas-29376171',
    description: 'Works with Karnataka Forest Department on wildlife conservation, forest fire awareness, anti-poaching, human-wildlife conflict mitigation and wildlife education.',
    states: ['Karnataka'],
    focus_areas: ['Education', 'Health & Nutrition', 'Environment', 'Rural Development'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Karnataka Forest Department partnership confirmed. Funders Sidvin Core Tech, Capco Technologies, Alabos BPO are small companies — could not be verified publicly. No grant records added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Dost Learning Foundation',
    website: 'https://www.dosteducation.com',
    contact_name: 'Gatisheel Dass',
    contact_email: 'gatisheel@dosteducation.com',
    contact_linkedin: 'https://www.linkedin.com/in/gatisheeldass-comms-fr',
    description: 'EdTech nonprofit founded 2017. Uses phone-based audio content to support caregivers in early childhood development. Reached 1.5 lakh caregivers and 3 lakh children in 15 months. Tech+Touch model embedded in Government of India Poshan Bhi Padhai Bhi. State partnerships in UP, Jharkhand, Uttarakhand.',
    states: ['Pan-India', 'Karnataka', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Jharkhand', 'Andhra Pradesh', 'Delhi', 'Assam', 'Uttarakhand'],
    focus_areas: ['Education'],
    awards: 'WISE Award Qatar 2022. mEducation Alliance Award 2021. HundrED Global Collection 2022. Next Billion EdTech Prize UK 2019. MIT Solve Early Childhood Development cohort.',
    verified: true,
    source: 'ngo_submission',
    notes: 'Primary funders are international philanthropic (LEGO Foundation, Echidna Giving, Van Leer, Y Combinator). Reliance Foundation listed as strategic partner. No Schedule VII CSR grant confirmed — no grant records added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Madhi Foundation',
    website: 'https://www.madhifoundation.org',
    contact_name: 'Merlia Shaukath',
    contact_email: 'merlia@madhifoundation.org',
    contact_linkedin: 'https://www.linkedin.com/in/merlia-shaukath-48352111/',
    description: 'Founded 2016. Chief Management Partner for Tamil Nadu Foundational Literacy and Numeracy Mission (Ennum Ezhuthum). Impacts 2 million children, 85,000 teachers, 45,000 administrators across Tamil Nadu. 300+ full-time staff.',
    founded: 2016,
    states: ['Tamil Nadu', 'North East India'],
    focus_areas: ['Education'],
    awards: 'Nexus for Good Award. Zendesk Tech For Good Impact Award 2025. Doing Good for Bharat Awards 2025 — Education category. FICCI FLO Woman Achiever Award 2024-25.',
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'Godrej Foundation',
        amount_lakhs: 50.02,
        fiscal_year: 'FY2023',
        programme: 'Ennum Ezhuthum — Foundational Literacy and Numeracy',
        focus_area: 'Education',
        state: 'Tamil Nadu',
        verified: true,
      }
    ]
  },
  {
    name: 'School Health Annual Report Programme (SHARP NGO)',
    website: 'https://www.schoolindia.org',
    contact_name: 'Menaka Sharma',
    contact_email: 'menaka@schoolindia.org',
    contact_linkedin: 'https://www.linkedin.com/in/menakasharma/',
    states: ['Pan-India'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Menstrual Health', 'Skill Development', 'Water, Sanitation & Hygiene', 'Rural Development'],
    awards: 'Mahatma Award for Social Good and Impact 2025. Flame Award. WARC Award.',
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'Hindustan Unilever Foundation',
        amount_lakhs: 100,
        fiscal_year: 'FY2025-26',
        programme: 'Project Prabhat Nutrition Program',
        focus_area: 'Health & Nutrition',
        state: 'Pan-India',
        verified: true,
      }
    ]
  },
  {
    name: 'Ratna Nidhi Charitable Trust',
    website: 'https://ratnanidhi.org',
    contact_name: 'Pooja Gupta',
    contact_email: 'pooja.gupta@ratnanidhi.org',
    contact_linkedin: 'https://www.linkedin.com/in/pooja-khandelwal-gupta-2127aa11a/',
    states: ['Pan-India', 'Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Delhi'],
    focus_areas: ['Education', 'Health & Nutrition', 'Disability & Special Needs'],
    awards: 'Google Award. Humanitarian Rose Award — The People\'s Princess Charitable Foundation. 7th CSR Impact Award in COVID-19 Response (Large Category).',
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'Aadhar Housing Finance CSR',
        amount_lakhs: 104.15,
        fiscal_year: 'FY2022-25',
        programme: 'Disability Project',
        focus_area: 'Disability & Special Needs',
        state: 'Pan-India',
        verified: true,
      }
    ]
  },
  {
    name: 'ATG HealthCare Foundation',
    website: 'https://atgfoundation.org',
    contact_email: 'silasantosh@atgfoundation.org',
    description: 'Founded October 2023. Works in cancer prevention, HIV/AIDS prevention and treatment, women\'s development, child welfare and education. 12A and 80G registered. CSR-1 registered.',
    founded: 2023,
    states: ['Maharashtra', 'Andhra Pradesh', 'Telangana'],
    focus_areas: ['Health & Nutrition'],
    verified: true,
    source: 'ngo_submission',
    notes: 'No CSR funders provided. Recently founded organisation — no grant records added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Concern India Foundation',
    website: 'https://www.concernindiafoundation.org',
    contact_email: 'manisha.desai@concernindia.org',
    states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'Odisha', 'West Bengal', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Delhi', 'Haryana'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Environment', 'Rural Development', 'Disability & Special Needs', 'Culture, Heritage & Crafts'],
    awards: 'Top 20 Best NGO of the Year 2022 — Brand Honchos. CSR Excellence in Sustainability Practices Award 2023 — India CSR & Sustainability Conclave.',
    verified: true,
    source: 'ngo_submission',
    notes: 'Cadence Design Systems CSR is in DB but no grant amount provided. Amazon, NXP, Fractal not in DB. Grant records not added — follow up for amounts.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Carers Worldwide India',
    website: 'https://carersworldwide.org/our-work/carers-worldwide-india',
    contact_name: 'Suyasha Sharma',
    contact_email: 'suyasha.sharma@carersworldwide.org',
    contact_linkedin: 'https://www.linkedin.com/in/suyashasharma/',
    description: 'Works with unpaid carers of people with mental illness and disability. 33,400 carers supported. 1,509 carer groups formed. 7,685 carers now earning income. Equivalent of INR 97.8 crore in government support accessed for beneficiaries.',
    states: ['Karnataka', 'Tamil Nadu', 'Jharkhand', 'Odisha', 'Andhra Pradesh'],
    focus_areas: ['Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Rural Development', 'Disability & Special Needs'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Live Laugh Love Foundation grant ~3 Cr (2020-25) confirmed. Foundation not in DB — grant record not added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Chaitanya Rural Development Society',
    website: 'https://www.chaitanyango.org',
    contact_name: 'R Prasad',
    contact_email: 'managercrds@chaitanyango.org',
    states: ['Karnataka'],
    focus_areas: ['Menstrual Health', 'Livelihoods', 'Skill Development', 'Environment', 'Rural Development'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Dhwani Foundation, DG Limited and Azim Premji Foundation listed as funders — primarily philanthropic. No Schedule VII CSR grant confirmed — grant records not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Bal Mahila Vikas Samiti',
    website: 'https://www.vamaindia.org',
    contact_name: 'Siddharth Verma',
    contact_email: 'bmvs1988@yahoo.co.in',
    description: 'Founded 1988. Works across education, health, women and rural development in Madhya Pradesh. Trains ASHA and USHA workers in 3 blocks of Datia district.',
    founded: 1988,
    states: ['Madhya Pradesh'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Environment', 'Water, Sanitation & Hygiene', 'Rural Development', 'Culture, Heritage & Crafts'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Uflex mentioned as CSR funder with project outcomes but no grant amount provided. Grant record not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Action for Women And Rural Development (AWARD)',
    website: 'https://awardsatara.org',
    contact_name: 'Kiran Kadam',
    contact_email: 'awardorg@rediffmail.com',
    contact_linkedin: 'https://linkedin.com/company/action-for-women-and-rural-development-award',
    states: ['Maharashtra'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Environment', 'Water, Sanitation & Hygiene', 'Rural Development'],
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'Suzlon Foundation',
        amount_lakhs: 45,
        fiscal_year: 'FY2023-26',
        programme: 'Integrated Village Development',
        focus_area: 'Rural Development',
        state: 'Maharashtra',
        verified: true,
      }
    ]
  },
  {
    name: 'Sparsh Hospice',
    website: 'https://www.sparshhospice.org',
    contact_name: 'Neha',
    contact_email: 'promgr@sparshhospice.org',
    contact_linkedin: 'https://www.linkedin.com/in/neha-rani-patel/',
    description: 'An entity of Rotary CBHCT. Provides palliative and hospice care in Telangana.',
    states: ['Telangana'],
    focus_areas: ['Health & Nutrition'],
    awards: 'Awards for palliative care and hospice care.',
    verified: true,
    source: 'ngo_submission',
    notes: 'SBI Foundation confirmed funder but no amount provided. Laurus Labs and Truhome Finance not in DB. Grant records not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Navikru Eco Foundation',
    website: 'https://navikrueco.org',
    contact_name: 'Tajamul Akhtar',
    contact_email: 'tajamul@navikru.org',
    states: ['Ladakh'],
    focus_areas: ['Education', 'Women & Girls', 'Menstrual Health', 'Livelihoods', 'Environment'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Wipro Foundation confirmed as funder. No grant amount provided — grant record not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Shop For Change Fair Trade',
    website: 'https://shopforchange.ngo',
    contact_name: 'Dipa Hakali',
    contact_email: 'dipa@shopforchange.ngo',
    contact_linkedin: 'https://www.linkedin.com/in/dipa-mehta-hakani-8aa16b21b/',
    description: 'Founded 2009. Fair trade certification and market linkages for smallholder and tribal farmers. Works with Shoppers Stop, ColorPlus, Anita Dongre on fair trade cotton. GeBBS Healthcare CSR and Forbes Marshall confirmed funders.',
    founded: 2009,
    states: ['Pan-India', 'Maharashtra', 'Gujarat', 'Chhattisgarh'],
    focus_areas: ['Women & Girls', 'Livelihoods', 'Skill Development', 'Environment', 'Rural Development'],
    verified: true,
    source: 'ngo_submission',
    notes: 'GeBBS Healthcare and Forbes Marshall confirmed as CSR funders. No grant amounts provided — grant records not added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Womens Environment Development Society (WEDS)',
    website: 'https://weds1ngo.org',
    contact_name: 'Govindaiah B',
    contact_email: 'govindaiahballekattappa@gmail.com',
    contact_linkedin: 'https://www.linkedin.com/in/govindaiah-b-a859921bb',
    states: ['Karnataka'],
    focus_areas: ['Women & Girls', 'Livelihoods', 'Environment', 'Rural Development'],
    awards: 'KSDMA Award 2025. Honorary Lifetime Achievement Award — Asia Vedic Culture Academy 2022. Kannada Rajyostava Award 2021. Multiple state-level recognitions 2018-2021.',
    verified: true,
    source: 'ngo_submission',
    notes: 'Reliance Foundation and Mukand Sumi Special Steel confirmed CSR funders. CoreCarbonX not verified. No grant amounts provided — grant records not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'The Orange Heart Foundation',
    website: 'https://www.theorangeheartfoundation.com',
    contact_email: 'pranjalljain@outlook.com',
    states: ['Rajasthan', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Haryana', 'Punjab'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Menstrual Health', 'Skill Development', 'Rural Development', 'Disability & Special Needs'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Section 8 registered, Niti Aayog affiliated. No CSR funders provided or found publicly — no grant records added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'DR. MUTHULAKSHMI CHARITABLE TRUST',
    website: 'https://muthulakshmict.1ngo.in',
    contact_name: 'Mr. Johnson A.M.',
    contact_email: 'drmuthulakshmitrust@gmail.com',
    contact_linkedin: 'https://www.linkedin.com/in/dr-muthulakshmi-trust',
    states: ['Tamil Nadu'],
    focus_areas: ['Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Environment', 'Water, Sanitation & Hygiene'],
    awards: 'Dhwani Foundation N-Lite cohort winner.',
    verified: true,
    source: 'ngo_submission',
    notes: 'Dhwani Foundation N-Lite cohort winner confirmed via Facebook. Dhwani is philanthropic not CSR — no grant records added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Dhanwantari Sevabhavi Sanstha',
    website: 'https://www.dssngoindia.org',
    contact_name: 'Vinod Ramrao Sasane',
    contact_email: 'dssaidsngo@hotmail.com',
    states: ['Maharashtra'],
    focus_areas: ['Health & Nutrition', 'Livelihoods', 'Skill Development', 'Disability & Special Needs'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Kotak Mahindra Bank confirmed CSR funder. Ministry of Health project and disability skill development mentioned. No grant amount provided — grant record not added.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'IAC Patrons (India Autism Center)',
    website: 'https://indiaautismcenter.org',
    contact_name: 'Maumita Banerjee',
    contact_email: 'maumita@indiaautismcenter.org',
    description: 'Works in autism and disability support across India. Ministry of Social Justice and Empowerment fellowship programme partner. Special Olympics Bharat partnership.',
    states: ['Pan-India', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Delhi'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Environment', 'Disability & Special Needs'],
    awards: 'Vocational Excellence Awards 2025 — Rotary Club of Kolkata. NIEPID recognition. NILD recognition.',
    verified: true,
    source: 'ngo_submission',
    notes: 'Sumitomo Chemical, Mindspace Business Parks, K Raheja Corp, Meenakshi Mercantiles listed as funders with amounts. None currently in DB — grant records not added. Follow up to add these foundations first.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Education and Livelihoods in Conflict Impacted Territories (ELICIT Foundation)',
    website: 'https://www.elicitfoundation.com',
    contact_email: 'manasvi@elicitfoundation.com',
    states: ['Gujarat', 'Jharkhand', 'North East India', 'Kashmir'],
    focus_areas: ['Education', 'Health & Nutrition', 'Rural Development'],
    verified: true,
    source: 'ngo_submission',
    data_quality: 'high',
    grants: [
      {
        foundation: 'Forbes Marshall Foundation',
        amount_lakhs: 10,
        fiscal_year: 'FY2023',
        programme: 'Teach to ELICIT Educational Fellowship',
        focus_area: 'Education',
        state: 'Pan-India',
        verified: true,
      },
      {
        foundation: 'Forbes Marshall Foundation',
        amount_lakhs: 10,
        fiscal_year: 'FY2024',
        programme: 'Teach to ELICIT Educational Fellowship',
        focus_area: 'Education',
        state: 'Pan-India',
        verified: true,
      },
      {
        foundation: 'Forbes Marshall Foundation',
        amount_lakhs: 10,
        fiscal_year: 'FY2025',
        programme: 'Teach to ELICIT Educational Fellowship',
        focus_area: 'Education',
        state: 'Pan-India',
        verified: true,
      }
    ]
  },
  {
    name: 'Parinaama Foundation',
    website: 'https://www.parinaama.org',
    contact_name: 'Madhavi Panda',
    contact_email: 'madhavi@parinaama.org',
    contact_linkedin: 'https://www.linkedin.com/in/madhavi-panda-3127528b/',
    description: 'Founded 2012 by Madhavi Panda. Works in maternal health, digital literacy, economic empowerment across Eastern India. 1 million people reached over 13 years. Mission to bring 1 million children back into education in 5 years.',
    founded: 2012,
    states: ['Jharkhand', 'Odisha', 'West Bengal', 'Andhra Pradesh', 'Delhi'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Menstrual Health', 'Livelihoods', 'Water, Sanitation & Hygiene'],
    verified: true,
    source: 'ngo_submission',
    notes: 'QNET RYTHM Foundation (CSR arm of QNET) confirmed as funder during COVID. No grant amount provided — grant record not added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'VANASHAKTI',
    website: 'https://www.vanashakti.org',
    contact_name: 'Pawan',
    contact_email: 'pawan.vanashakti@gmail.com',
    states: ['Maharashtra', 'Uttar Pradesh'],
    focus_areas: ['Education', 'Environment'],
    awards: 'Partnership with Maharashtra Pollution Control Board. India Responsible Tourism State Award 2026 — Maharashtra. IESA Earth Day Cleanup Heroes Award. Samaj Vrati Award 2026. World CSR Congress recognition — 7th Edition CSR Summit.',
    verified: true,
    source: 'ngo_submission',
    notes: 'Mahindra and Mahindra, Reliance Foundation confirmed CSR funders. Tata Trust is philanthropic. No amounts provided — grant records not added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'DEEPALAYA INSTITUTE FOR MENTAL HEALTH AND REHABILITATION',
    website: 'https://deepalayaindia.org',
    contact_name: 'Kshitij Raman',
    contact_email: 'kshitij@deepalayaindia.org',
    contact_linkedin: 'https://linkedin.com/in/kshitij-ramaan',
    description: 'Operating in Purnia, Bihar for 29+ years. 67 team members. Works in disability, special education, education and skills for women. Implementation partner of National Trust GoI, Rehabilitation Council of India, WCDC, ICDS Bihar, NYKS GoI. Also partnered with Aga Khan Foundation and Educate Girls US.',
    states: ['Bihar'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Disability & Special Needs'],
    verified: true,
    source: 'ngo_submission',
    notes: 'NBCC India Ltd and SBI listed as CSR funders — both PSUs. No grant amounts provided — grant records not added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Sakshi',
    website: 'https://sakshi.org.in',
    contact_name: 'Dr. Sharanya',
    contact_email: 'sharanya.sreepad@sakshi.org.in',
    contact_linkedin: 'https://www.linkedin.com/in/sharanya-sreepad/',
    states: ['Pan-India', 'Tamil Nadu', 'Kerala'],
    focus_areas: ['Women & Girls', 'Rural Development'],
    verified: true,
    source: 'ngo_submission',
    notes: 'No CSR funders provided or found publicly. Adding as NGO record only.',
    data_quality: 'medium',
    grants: []
  },
  {
    name: 'Sewa International',
    website: 'https://www.sewainternational.org',
    contact_name: 'Tanya Verma',
    contact_email: 'mgr.rd@sewainternational.org',
    states: ['Pan-India'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Menstrual Health', 'Livelihoods', 'Skill Development', 'Water, Sanitation & Hygiene', 'Rural Development'],
    awards: 'Top 5 Most Trusted NGO of the Year 2025 — Brand Honchos. Best CSR Project of the Year 2024 — Force Motor / National CSR Impact Awards. Delhi ki Shaan 2021. Best-in-Class NGO Certification 2023 — Fitch Solution India.',
    verified: true,
    source: 'ngo_submission',
    notes: 'SBI Foundation, Kotak Mahindra Bank, IndusInd Bank, Yusen Logistics listed as funders. No amounts provided — grant records not added.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Hrudaya (Cure a Little Heart) Foundation',
    website: 'https://hrudaya.org',
    contact_email: 'hrudaya.foundation.lead@gmail.com',
    contact_linkedin: 'https://www.linkedin.com/in/kashyapprem/',
    description: 'Founded 2005 by Padmashri Awardee Dr. Gopichand Mannam. Provides cardiac interventions for underprivileged children with congenital heart defects. 7,200+ patients treated as of March 2024. 8,600+ kids impacted, 700+ surgeries in FY2005. CSR registered.',
    founded: 2005,
    states: ['Andhra Pradesh', 'Telangana'],
    focus_areas: ['Health & Nutrition'],
    verified: true,
    source: 'ngo_submission',
    notes: 'Has CSR registration and corporate sponsors listed on website. No specific grant details submitted — grant records not added. Follow up for funder details.',
    data_quality: 'high',
    grants: []
  },
  {
    name: 'Charvi Empowerment Society',
    website: 'https://www.charviesociety.org',
    contact_name: 'Manish Singh Rathore',
    contact_email: 'manish@charviesociety.org',
    contact_linkedin: 'https://www.linkedin.com/company/100551700/',
    description: 'Founded 2019. Works in education, healthcare, livelihoods, women empowerment, WASH, environment and skill development. 3 lakh+ lives impacted annually. Global CSR Sustainability & ESG Awards 2026.',
    founded: 2019,
    states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Telangana', 'Delhi', 'Haryana'],
    focus_areas: ['Education', 'Health & Nutrition', 'Women & Girls', 'Livelihoods', 'Skill Development', 'Environment', 'Water, Sanitation & Hygiene', 'Rural Development'],
    awards: 'Global CSR Sustainability & ESG Awards 2026.',
    verified: true,
    source: 'ngo_submission',
    notes: 'Many funders listed (Deep Welfare Organisation, G3S Foundation, SRKPS, Sariska Seva Sansthan) appear to be NGOs or implementing agencies rather than corporate CSR funders. Collective Good Foundation, SIDBI, Balancehero India are confirmed funders but not yet in DB. Grant records not added — follow up to verify funder types and add foundations first.',
    data_quality: 'high',
    grants: []
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function upsertNGO(ngo) {
  const { grants, focus_areas, ...ngoData } = ngo;
  const { data, error } = await supabase
    .from('ngos')
    .upsert(ngoData, { onConflict: 'name', returning: 'representation' })
    .select('id')
    .single();

  if (error) {
    console.error(`  ✗ Failed to upsert NGO: ${ngo.name}`, error.message);
    return null;
  }
  return data.id;
}

async function linkFocusAreas(ngoId, focusAreaNames) {
  const mappings = focusAreaNames
    .filter(name => FOCUS_AREAS[name])
    .map(name => ({
      ngo_id: ngoId,
      focus_area_id: FOCUS_AREAS[name],
      is_primary: false,
    }));

  const unknown = focusAreaNames.filter(name => !FOCUS_AREAS[name]);
  if (unknown.length > 0) {
    console.warn(`  ⚠ Unknown focus areas skipped: ${unknown.join(', ')}`);
  }

  if (mappings.length === 0) return;

  const { error } = await supabase
    .from('ngo_focus_areas')
    .upsert(mappings, { onConflict: 'ngo_id,focus_area_id' });

  if (error) {
    console.error(`  ✗ Failed to link focus areas for ngo_id ${ngoId}`, error.message);
  }
}

async function insertGrant(ngoId, ngoName, grant) {
  const orgId = FOUNDATIONS[grant.foundation];
  if (!orgId) {
    console.warn(`  ⚠ Foundation not in DB, grant skipped: ${grant.foundation}`);
    return;
  }

  // Check for duplicate before inserting
  const { data: existing } = await supabase
    .from('grants')
    .select('id')
    .eq('org_id', orgId)
    .eq('ngo_name', ngoName)
    .eq('fiscal_year', grant.fiscal_year)
    .eq('programme', grant.programme)
    .maybeSingle();

  if (existing) {
    console.log(`  ↩ Grant already exists, skipping: ${grant.foundation} → ${ngoName} (${grant.fiscal_year})`);
    return;
  }

  const { error } = await supabase.from('grants').insert({
    org_id: orgId,
    ngo_id: ngoId,
    ngo_name: ngoName,
    amount_lakhs: grant.amount_lakhs,
    fiscal_year: grant.fiscal_year,
    programme: grant.programme,
    focus_area: grant.focus_area,
    state: grant.state || null,
    verified: grant.verified || false,
    source_url: 'ngo_submission',
  });

  if (error) {
    console.error(`  ✗ Grant insert failed: ${grant.foundation} → ${ngoName}`, error.message);
  } else {
    console.log(`  ✓ Grant inserted: ${grant.foundation} → ${ngoName} (${grant.fiscal_year}, ₹${grant.amount_lakhs}L)`);
  }
}

async function backfillNgoId(ngoId, ngoName) {
  // Update existing grant records where ngo_name matches but ngo_id is null
  const { error, count } = await supabase
    .from('grants')
    .update({ ngo_id: ngoId })
    .eq('ngo_name', ngoName)
    .is('ngo_id', null);

  if (error) {
    console.error(`  ✗ Backfill failed for: ${ngoName}`, error.message);
  } else if (count > 0) {
    console.log(`  ↩ Backfilled ngo_id on ${count} existing grant record(s) for: ${ngoName}`);
  }
}

async function deleteSaukhyamGrants() {
  console.log('\n--- Deleting incorrect Saukhyam Foundation grants ---');
  const { error, count } = await supabase
    .from('grants')
    .delete()
    .in('id', SAUKHYAM_GRANT_IDS);

  if (error) {
    console.error('  ✗ Saukhyam deletion failed:', error.message);
  } else {
    console.log(`  ✓ Deleted ${SAUKHYAM_GRANT_IDS.length} Saukhyam grant records`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('=== India CSR Navigator — NGO Seed Script ===\n');

  // Step 1: Delete incorrect Saukhyam grants
  await deleteSaukhyamGrants();

  // Step 2: Insert NGOs
  console.log(`\n--- Inserting ${NGO_SUBMISSIONS.length} NGOs ---`);
  for (const ngo of NGO_SUBMISSIONS) {
    console.log(`\n▶ ${ngo.name}`);

    const ngoId = await upsertNGO(ngo);
    if (!ngoId) continue;

    await linkFocusAreas(ngoId, ngo.focus_areas || []);

    for (const grant of ngo.grants || []) {
      await insertGrant(ngoId, ngo.name, grant);
    }

    await backfillNgoId(ngoId, ngo.name);

    console.log(`  ✓ Done`);
  }

  console.log('\n=== Seed complete ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
