// scripts/seed.js
// Run: node scripts/seed.js
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ORGS = [
  { name:"Tata Trusts", parent_company:"Tata Group", type:"Philanthropic", founded:1892, team_size:"400+",
    spend_label:"₹500–800 Cr/yr", spend_min_cr:500, spend_max_cr:800,
    gender_score:8, programmes_count:12, saukhyam_fit:"High",
    description:"India's oldest philanthropic organisation. Deep focus on healthcare systems, nutrition, WASH, and rural livelihoods. Menstrual hygiene active via Tata Water Mission in 900+ villages.",
    menstrual_note:"Active — Tata Water Mission covers MHM in 900 villages, 200,000+ women",
    grant_size:"Multi-year, ₹10L–5 Cr per project",
    geography:"Pan-India, priority: Maharashtra, Jharkhand, Odisha",
    website:"tatatrusts.org", contact_name:"Aparna Uppaluri", contact_title:"Programmes Director", contact_email:"info@tatatrusts.org",
    verified:true, focus:["Education","Health & Nutrition","Rural Development","WASH","Livelihoods"] },

  { name:"Azim Premji Foundation", parent_company:"Azim Premji / Wipro", type:"Philanthropic", founded:2001, team_size:"2,000+",
    spend_label:"₹1,000–2,000 Cr/yr", spend_min_cr:1000, spend_max_cr:2000,
    gender_score:6, programmes_count:8, saukhyam_fit:"Medium",
    description:"One of the world's largest philanthropic endowments (~$29B). Primarily education reform and public health. Grants range from a few lakhs to tens of crores.",
    menstrual_note:"Indirect — through health and community programmes",
    grant_size:"₹5L–50 Cr, multi-year",
    geography:"MP, Karnataka, Jharkhand, Odisha, Bihar, NE India",
    website:"azimpremjifoundation.org", contact_name:"Dileep Ranjekar", contact_title:"CEO", contact_email:"philanthropy.registrations@azimpremjifoundation.org",
    verified:true, focus:["Education","Health & Nutrition","Rural Development","Livelihoods"] },

  { name:"Reliance Foundation", parent_company:"Reliance Industries", type:"Corporate", founded:2010, team_size:"500+",
    spend_label:"₹900–1,200 Cr/yr", spend_min_cr:900, spend_max_cr:1200,
    gender_score:7, programmes_count:10, saukhyam_fit:"High",
    description:"One of India's largest CSR spenders. Holistic rural development, education scholarships, women's empowerment, and disaster relief.",
    menstrual_note:"Active — women health camps, rural distribution",
    grant_size:"₹10L–10 Cr",
    geography:"Pan-India, priority: Gujarat, MP, Maharashtra",
    website:"reliancefoundation.org", contact_name:"Nita Ambani", contact_title:"Chairperson", contact_email:"csrhelpdesk@ril.com",
    verified:true, focus:["Education","Health & Nutrition","Rural Development","Livelihoods","Women & Girls"] },

  { name:"Infosys Foundation", parent_company:"Infosys Ltd", type:"Corporate", founded:1996, team_size:"100+",
    spend_label:"₹350–420 Cr/yr", spend_min_cr:350, spend_max_cr:420,
    gender_score:6, programmes_count:8, saukhyam_fit:"Medium",
    description:"Invests in healthcare infrastructure, libraries, sanitation. Aarohan Social Innovation Awards fund tech-enabled social innovations up to ₹50L.",
    menstrual_note:"Indirect via health and sanitation projects",
    grant_size:"₹25L–5 Cr; Aarohan up to ₹50L",
    geography:"Karnataka, Andhra Pradesh, Tamil Nadu, Maharashtra",
    website:"infosys.com/infosys-foundation", contact_name:"Sudha Murthy", contact_title:"Founder Chairperson", contact_email:"infosysfoundation@infosys.com",
    verified:true, focus:["Education","Health & Nutrition","Rural Development","Environment"] },

  { name:"HCL Foundation", parent_company:"HCLTech", type:"Corporate", founded:2011, team_size:"60+",
    spend_label:"₹150–200 Cr/yr", spend_min_cr:150, spend_max_cr:200,
    gender_score:7, programmes_count:6, saukhyam_fit:"High",
    description:"Annual HCLTech Grant of ₹5 Cr to winning NGOs in Education, Healthcare, and Environment. Committed ₹135+ Cr to NGOs across 24 states since inception.",
    menstrual_note:"Active via women's health grants",
    grant_size:"₹5 Cr (winners); ₹25–50L (runners-up)",
    geography:"Pan-India (24 states)",
    website:"hclfoundation.org", contact_name:"Nidhi Pundhir", contact_title:"President", contact_email:"hclgrant@hcl.com",
    verified:true, focus:["Education","Health & Nutrition","Environment","Women & Girls"] },

  { name:"Hindustan Unilever Foundation", parent_company:"HUL / Unilever", type:"Corporate", founded:2010, team_size:"80+",
    spend_label:"₹150–200 Cr/yr", spend_min_cr:150, spend_max_cr:200,
    gender_score:9, programmes_count:7, saukhyam_fit:"High",
    description:"Project Shakti — menstrual pad distribution & women micro-entrepreneurs. Water conservation and handwashing campaigns across rural India.",
    menstrual_note:"High priority — Project Shakti directly distributes sanitary pads and trains women as micro-entrepreneurs",
    grant_size:"₹10L–3 Cr, partnership-based",
    geography:"Rural India, priority UP, Bihar, Maharashtra",
    website:"hul.co.in/our-purpose", contact_name:"Priya Nair", contact_title:"Executive Director", contact_email:"india.csr@unilever.com",
    verified:true, focus:["WASH","Women & Girls","Livelihoods","Health & Nutrition","Menstrual Health"] },

  { name:"EdelGive Foundation", parent_company:"Edelweiss Group", type:"Philanthropic", founded:2008, team_size:"40+",
    spend_label:"₹80–120 Cr/yr", spend_min_cr:80, spend_max_cr:120,
    gender_score:9, programmes_count:9, saukhyam_fit:"High",
    description:"Grant-making org building philanthropy infrastructure in India. Focus on women, girls, and community resilience. GEDI lens embedded in funding.",
    menstrual_note:"Active — supports MHM-focused NGOs; GEDI framework prioritises period equity",
    grant_size:"₹20L–2 Cr, multi-year preferred",
    geography:"Pan-India (grassroots NGOs)",
    website:"edelgivefoundation.org", contact_name:"Vidya Shah", contact_title:"CEO", contact_email:"info@edelgivefoundation.org",
    verified:true, focus:["Women & Girls","Education","Livelihoods","Menstrual Health","Health & Nutrition"] },

  { name:"Rohini Nilekani Philanthropies", parent_company:"Nilekani Family", type:"Philanthropic", founded:2017, team_size:"30+",
    spend_label:"₹100–150 Cr/yr", spend_min_cr:100, spend_max_cr:150,
    gender_score:8, programmes_count:6, saukhyam_fit:"Medium",
    description:"Trust-based, systemic philanthropy. Funds gender equity, active citizenship, mental health, and biodiversity. Co-founder of Arghyam (WASH) and EkStep.",
    menstrual_note:"Indirect — gender equity grants may include MHM",
    grant_size:"₹20L–5 Cr, trust-based multi-year",
    geography:"Pan-India",
    website:"rohininilekaniphilanthropies.org", contact_name:"Rohini Nilekani", contact_title:"Chairperson", contact_email:"contact@rnpf.in",
    verified:true, focus:["Women & Girls","Environment","Health & Nutrition","Rural Development"] },

  { name:"Axis Bank Foundation", parent_company:"Axis Bank", type:"Corporate", founded:2006, team_size:"50+",
    spend_label:"₹150–250 Cr/yr", spend_min_cr:150, spend_max_cr:250,
    gender_score:7, programmes_count:5, saukhyam_fit:"Medium",
    description:"Goal: support 2 million households by 2025. Long-term NGO partnerships in sustainable rural livelihoods, women's empowerment, and financial inclusion.",
    menstrual_note:"Indirect — women's empowerment may include hygiene",
    grant_size:"Multi-year NGO partnerships, ₹1–10 Cr",
    geography:"Rural India, 100+ NGO partners",
    website:"axisbankfoundation.org", contact_name:"Dhruv Kaji", contact_title:"Managing Trustee", contact_email:"abf@axisbank.com",
    verified:true, focus:["Livelihoods","Women & Girls","Rural Development","Education"] },

  { name:"HDFC Bank Parivartan", parent_company:"HDFC Bank", type:"Corporate", founded:2014, team_size:"150+",
    spend_label:"₹700–900 Cr/yr", spend_min_cr:700, spend_max_cr:900,
    gender_score:6, programmes_count:10, saukhyam_fit:"Medium",
    description:"One of India's highest CSR spenders. SmartUp Grants (up to ₹50L) for social impact startups. Broad mandate across SDGs.",
    menstrual_note:"Indirect via health and skilling",
    grant_size:"₹50L (SmartUp); ₹1–20 Cr (core projects)",
    geography:"Pan-India",
    website:"hdfcbank.com/parivartan", contact_name:"Ashima Bhat", contact_title:"Group Head – ESG", contact_email:"csr@hdfcbank.com",
    verified:true, focus:["Education","Livelihoods","Health & Nutrition","Environment","Rural Development"] },

  { name:"Godrej Foundation", parent_company:"Godrej Group", type:"Corporate", founded:2011, team_size:"40+",
    spend_label:"₹100–150 Cr/yr", spend_min_cr:100, spend_max_cr:150,
    gender_score:8, programmes_count:6, saukhyam_fit:"Medium",
    description:"Godrej Good & Green agenda. LGBTQ+ inclusion, women in workforce, mangrove conservation. Salon-i trains women in beauty entrepreneurship.",
    menstrual_note:"Active via women's livelihood and health programmes",
    grant_size:"₹10L–3 Cr",
    geography:"Maharashtra, Andhra Pradesh",
    website:"godrej.com/our-purpose", contact_name:"Parmesh Shahani", contact_title:"Head, Culture Lab", contact_email:"csr@godrej.com",
    verified:true, focus:["Women & Girls","Education","Environment","Livelihoods"] },

  { name:"SBI Foundation", parent_company:"State Bank of India", type:"PSU", founded:2015, team_size:"80+",
    spend_label:"₹200–300 Cr/yr", spend_min_cr:200, spend_max_cr:300,
    gender_score:5, programmes_count:8, saukhyam_fit:"Low",
    description:"Platinum Jubilee Asha Scholarships (₹90 Cr for 23,000+ students). Healthcare and rural infrastructure. Compliance-driven but increasingly strategic.",
    menstrual_note:"Indirect via health programmes",
    grant_size:"₹25L–5 Cr; large scholarship pools",
    geography:"Pan-India",
    website:"sbifoundation.in", contact_name:"Aman Bhaiya", contact_title:"MD & CEO", contact_email:"sbif.mumbai@sbi.co.in",
    verified:true, focus:["Education","Health & Nutrition","Rural Development","Livelihoods"] },

  { name:"ONGC Foundation", parent_company:"ONGC Ltd", type:"PSU", founded:2014, team_size:"100+",
    spend_label:"₹300–500 Cr/yr", spend_min_cr:300, spend_max_cr:500,
    gender_score:4, programmes_count:7, saukhyam_fit:"Low",
    description:"One of India's largest PSU CSR spenders. Scholarships for SC/ST students, healthcare centres, rural infrastructure.",
    menstrual_note:"Minimal — scope exists via healthcare grants",
    grant_size:"₹10L–10 Cr, NGO registration required",
    geography:"Gujarat, Maharashtra, Rajasthan, Assam",
    website:"ongcindia.com/csr", contact_name:"Pankaj Kumar", contact_title:"Director (HR) / CSR Head", contact_email:"csr@ongc.co.in",
    verified:true, focus:["Education","Health & Nutrition","Rural Development","Environment","Livelihoods"] },

  { name:"ITC Limited CSR", parent_company:"ITC Ltd", type:"Corporate", founded:2004, team_size:"200+",
    spend_label:"₹250–350 Cr/yr", spend_min_cr:250, spend_max_cr:350,
    gender_score:7, programmes_count:9, saukhyam_fit:"High",
    description:"Mission Sunehra Kal — watershed development, women's SHGs, skilling. Empowered 2 lakh+ women micro-entrepreneurs.",
    menstrual_note:"Active — hygiene included in women's empowerment programs",
    grant_size:"₹50L–5 Cr, implementing-partner model",
    geography:"MP, UP, Bihar, Maharashtra, Karnataka, AP, Rajasthan",
    website:"itcportal.com/sustainability", contact_name:"S. Sivakumar", contact_title:"Group Head – CSR", contact_email:"contactus@itcportal.com",
    verified:true, focus:["Rural Development","Women & Girls","Livelihoods","Education","Environment"] },

  { name:"P&G India – Whisper CSR", parent_company:"Procter & Gamble", type:"International", founded:1992, team_size:"30+",
    spend_label:"₹50–100 Cr/yr", spend_min_cr:50, spend_max_cr:100,
    gender_score:10, programmes_count:5, saukhyam_fit:"High",
    description:"Spotlight Red (with UNESCO) — teaching modules on MHHM. Aim to reach 10M+ girls on period education. Most direct menstrual health CSR in India.",
    menstrual_note:"Primary — period education, product distribution, school WASH infrastructure",
    grant_size:"Partnership-based, ₹10L–2 Cr",
    geography:"Schools across 10+ states",
    website:"pg.co.in/sustainability", contact_name:"Kruti Desai", contact_title:"Head of Corporate Affairs", contact_email:"pg.india@pg.com",
    verified:true, focus:["Women & Girls","Education","Menstrual Health","Health & Nutrition"] },

  { name:"Dasra", parent_company:"Independent", type:"Philanthropic", founded:2000, team_size:"80+",
    spend_label:"₹30–60 Cr/yr", spend_min_cr:30, spend_max_cr:60,
    gender_score:9, programmes_count:7, saukhyam_fit:"High",
    description:"India's leading strategic philanthropy organisation. Convenes funders, publishes sector reports, runs accelerators. MHM-focused convenings and knowledge platform.",
    menstrual_note:"High — hosted MHM funder convenings, published reports, ecosystem builder",
    grant_size:"Accelerator grants ₹10–50L; facilitated larger pools",
    geography:"Pan-India (convening-based)",
    website:"dasra.org", contact_name:"Deval Sanghavi", contact_title:"Co-founder & Partner", contact_email:"info@dasra.org",
    verified:true, focus:["Women & Girls","Education","Health & Nutrition","Menstrual Health","Livelihoods"] },

  { name:"Cipla Foundation", parent_company:"Cipla Ltd", type:"Corporate", founded:2012, team_size:"40+",
    spend_label:"₹80–120 Cr/yr", spend_min_cr:80, spend_max_cr:120,
    gender_score:7, programmes_count:5, saukhyam_fit:"High",
    description:"'Caring for Life' — primary healthcare access, skilling, and HIV/reproductive health. Strong pharmaceutical linkages.",
    menstrual_note:"Active via reproductive health and primary care programmes",
    grant_size:"₹10L–3 Cr",
    geography:"Maharashtra, Delhi, Hyderabad",
    website:"ciplafoundation.org", contact_name:"Umesh Wadha", contact_title:"CEO", contact_email:"foundation@cipla.com",
    verified:true, focus:["Health & Nutrition","Education","Women & Girls","Environment","Livelihoods"] },

  { name:"Marico Innovation Foundation", parent_company:"Marico Ltd", type:"Corporate", founded:2003, team_size:"20+",
    spend_label:"₹30–60 Cr/yr", spend_min_cr:30, spend_max_cr:60,
    gender_score:6, programmes_count:4, saukhyam_fit:"Medium",
    description:"Scale for Good accelerator supports social innovators scaling rural livelihoods and women empowerment.",
    menstrual_note:"Indirect — women-led social enterprises may include hygiene",
    grant_size:"₹25L–2 Cr (Scale for Good)",
    geography:"Pan-India (accelerator)",
    website:"maricoinnovationfoundation.org", contact_name:"Rakesh Pandey", contact_title:"Managing Director", contact_email:"mif@maricoindia.net",
    verified:false, focus:["Livelihoods","Women & Girls","Education","Health & Nutrition"] },

  { name:"Wipro Cares", parent_company:"Wipro Ltd", type:"Corporate", founded:2001, team_size:"60+",
    spend_label:"₹200–300 Cr/yr", spend_min_cr:200, spend_max_cr:300,
    gender_score:5, programmes_count:6, saukhyam_fit:"Low",
    description:"Ecological sustainability, primary education, and primary healthcare. Long-term systemic approach.",
    menstrual_note:"Indirect — health grants may cover MHM",
    grant_size:"₹25L–5 Cr",
    geography:"Bangalore, Hyderabad, Pune, Chennai",
    website:"wipro.com/wipro-cares", contact_name:"Anurag Behar", contact_title:"CSR Lead", contact_email:"wiprocares@wipro.com",
    verified:false, focus:["Education","Environment","Health & Nutrition","Livelihoods"] },

  { name:"Tech Mahindra Foundation", parent_company:"Tech Mahindra", type:"Corporate", founded:2006, team_size:"50+",
    spend_label:"₹100–150 Cr/yr", spend_min_cr:100, spend_max_cr:150,
    gender_score:5, programmes_count:5, saukhyam_fit:"Low",
    description:"SMART Schools, MahaHealIT, and Rural Transformation. IT-enabled education and employability. Partners with 200+ NGOs.",
    menstrual_note:"Indirect",
    grant_size:"₹10L–2 Cr",
    geography:"Pan-India (200+ NGO partners)",
    website:"techmahindrafoundation.org", contact_name:"Harsh Manglik", contact_title:"Chairperson", contact_email:"tmf@techmahindra.com",
    verified:false, focus:["Education","Livelihoods","Health & Nutrition","Rural Development"] },

  { name:"Dr. Reddy's Foundation", parent_company:"Dr. Reddy's Laboratories", type:"Corporate", founded:1996, team_size:"80+",
    spend_label:"₹80–120 Cr/yr", spend_min_cr:80, spend_max_cr:120,
    gender_score:6, programmes_count:5, saukhyam_fit:"Low",
    description:"LABS (Livelihood Advancement Business School) — vocational skilling at scale. DISHA rural health programme.",
    menstrual_note:"Indirect via health and skilling",
    grant_size:"₹10L–2 Cr",
    geography:"AP, Telangana, Karnataka, UP",
    website:"drreddysfoundation.org", contact_name:"Ravi Prasad", contact_title:"CEO", contact_email:"drf@drreddys.com",
    verified:false, focus:["Livelihoods","Education","Health & Nutrition","Rural Development"] },

  { name:"Kotak Education Foundation", parent_company:"Kotak Mahindra Bank", type:"Corporate", founded:2007, team_size:"50+",
    spend_label:"₹80–120 Cr/yr", spend_min_cr:80, spend_max_cr:120,
    gender_score:6, programmes_count:5, saukhyam_fit:"Low",
    description:"Scholarships, vocational training, and girl child education in Mumbai slums. Strong focus on first-generation learners.",
    menstrual_note:"Indirect via girl child education",
    grant_size:"₹10L–2 Cr",
    geography:"Maharashtra (Mumbai, Thane, Pune)",
    website:"kotakeducation.org", contact_name:"Suresh Kamath", contact_title:"Managing Director", contact_email:"kef@kotak.com",
    verified:false, focus:["Education","Livelihoods","Women & Girls","Rural Development"] },

  { name:"Gates Foundation India", parent_company:"Bill & Melinda Gates Foundation", type:"International", founded:2003, team_size:"150+",
    spend_label:"₹500–1,000 Cr/yr", spend_min_cr:500, spend_max_cr:1000,
    gender_score:7, programmes_count:10, saukhyam_fit:"Medium",
    description:"Global health, WASH, and agricultural development. India office focuses on polio eradication, maternal health, and financial inclusion for women.",
    menstrual_note:"Active — maternal/reproductive health grants",
    grant_size:"₹1–50 Cr, strategic grants",
    geography:"Pan-India, priority: Bihar, UP, Rajasthan",
    website:"gatesfoundation.org/india", contact_name:"Arnav Kapur", contact_title:"India Representative", contact_email:"info@gatesfoundation.org",
    verified:true, focus:["Health & Nutrition","Women & Girls","Education","WASH","Livelihoods"] },

  { name:"Arghyam Foundation", parent_company:"Rohini Nilekani", type:"Philanthropic", founded:2001, team_size:"30+",
    spend_label:"₹20–40 Cr/yr", spend_min_cr:20, spend_max_cr:40,
    gender_score:6, programmes_count:4, saukhyam_fit:"High",
    description:"Dedicated water and sanitation foundation. Funds WASH research, community-led sanitation, and water governance. Key funder for safe menstrual waste disposal.",
    menstrual_note:"Active — menstrual waste management and school WASH",
    grant_size:"₹10L–1 Cr",
    geography:"Pan-India (sanitation-priority districts)",
    website:"arghyam.org", contact_name:"Sunita Nadhamuni", contact_title:"CEO", contact_email:"info@arghyam.org",
    verified:true, focus:["WASH","Rural Development","Health & Nutrition","Women & Girls"] },

  { name:"Aditya Birla Foundation", parent_company:"Aditya Birla Group", type:"Corporate", founded:2000, team_size:"500+",
    spend_label:"₹400–600 Cr/yr", spend_min_cr:400, spend_max_cr:600,
    gender_score:6, programmes_count:8, saukhyam_fit:"Low",
    description:"Weaver of Lives — integrated rural development, education, and healthcare in plant communities. 7,500+ villages in 18 states.",
    menstrual_note:"Indirect — health and WASH may include MHM",
    grant_size:"₹25L–10 Cr",
    geography:"18 states, plant-community focused",
    website:"adityabirla.com/sustainability", contact_name:"Amrita Patwardhan", contact_title:"CSR Head", contact_email:"aditya.birla@adityabirla.com",
    verified:false, focus:["Education","Health & Nutrition","Livelihoods","Rural Development","WASH"] },

  { name:"L&T Foundation", parent_company:"L&T Group", type:"Corporate", founded:2002, team_size:"100+",
    spend_label:"₹300–500 Cr/yr", spend_min_cr:300, spend_max_cr:500,
    gender_score:5, programmes_count:6, saukhyam_fit:"Low",
    description:"Technical education for the underprivileged. Rural development in operational geographies. Infrastructure-led CSR.",
    menstrual_note:"Minimal",
    grant_size:"₹10L–5 Cr",
    geography:"Maharashtra, Tamil Nadu, Gujarat",
    website:"larsentoubro.com/csr", contact_name:"S. Krishnaswamy", contact_title:"CSR Head", contact_email:"ltcsr@larsentoubro.com",
    verified:false, focus:["Education","Rural Development","Health & Nutrition","Environment"] },

  { name:"JSW Foundation", parent_company:"JSW Group", type:"Corporate", founded:2009, team_size:"80+",
    spend_label:"₹100–200 Cr/yr", spend_min_cr:100, spend_max_cr:200,
    gender_score:6, programmes_count:6, saukhyam_fit:"Medium",
    description:"Parvaah ('We Care') — rural women's empowerment, education, and healthcare in plant communities.",
    menstrual_note:"Active via women's health and empowerment",
    grant_size:"₹10L–3 Cr",
    geography:"Karnataka, Maharashtra, Jharkhand, Odisha",
    website:"jswfoundation.in", contact_name:"Sangita Jindal", contact_title:"Chairperson", contact_email:"jswfoundation@jsw.in",
    verified:false, focus:["Education","Women & Girls","Rural Development","Health & Nutrition","Environment"] },

  { name:"Mahindra Foundation", parent_company:"Mahindra Group", type:"Corporate", founded:1998, team_size:"100+",
    spend_label:"₹150–250 Cr/yr", spend_min_cr:150, spend_max_cr:250,
    gender_score:6, programmes_count:6, saukhyam_fit:"High",
    description:"Nanhi Kali — education for underprivileged girls (1.5M+ girls supported). K.C. Mahindra Scholarships. Mahindra Hariyali — environmental sustainability.",
    menstrual_note:"Active via Nanhi Kali girl-child education and hygiene kits",
    grant_size:"₹10L–5 Cr",
    geography:"Rajasthan, UP, Bihar, MP, Maharashtra",
    website:"mahindra.com/our-responsibility", contact_name:"Firoz Antia", contact_title:"Trustee", contact_email:"kcmef@mahindra.com",
    verified:true, focus:["Education","Livelihoods","Rural Development","Women & Girls","Environment"] },

  { name:"Bajaj Foundation", parent_company:"Bajaj Group", type:"Corporate", founded:1961, team_size:"50+",
    spend_label:"₹50–100 Cr/yr", spend_min_cr:50, spend_max_cr:100,
    gender_score:6, programmes_count:5, saukhyam_fit:"Medium",
    description:"Integrated rural development in Rajasthan and Maharashtra. Women's SHGs, health camps, and vocational training.",
    menstrual_note:"Active — women's health camps include menstrual health",
    grant_size:"₹10L–2 Cr",
    geography:"Rajasthan, Maharashtra (Wardha, Pune)",
    website:"bajajfoundation.org", contact_name:"Kiran Sharma", contact_title:"Secretary", contact_email:"bajajfoundation@bajaj.co.in",
    verified:false, focus:["Education","Health & Nutrition","Livelihoods","Rural Development","Women & Girls"] },

  { name:"Biocon Foundation", parent_company:"Biocon Ltd", type:"Corporate", founded:2004, team_size:"30+",
    spend_label:"₹40–80 Cr/yr", spend_min_cr:40, spend_max_cr:80,
    gender_score:7, programmes_count:4, saukhyam_fit:"High",
    description:"Primary healthcare delivery at doorstep. Affordable diagnostics, preventive healthcare, and women's health camps.",
    menstrual_note:"Active — women's reproductive health programmes",
    grant_size:"₹5L–1 Cr",
    geography:"Karnataka, Tamil Nadu",
    website:"bioconfoundation.org", contact_name:"Kiran Mazumdar Shaw", contact_title:"Chairperson", contact_email:"info@bioconcsr.com",
    verified:true, focus:["Health & Nutrition","Women & Girls","Education","Livelihoods"] },

  { name:"Swades Foundation", parent_company:"Ronnie & Zarina Screwvala", type:"Philanthropic", founded:2013, team_size:"200+",
    spend_label:"₹30–60 Cr/yr", spend_min_cr:30, spend_max_cr:60,
    gender_score:8, programmes_count:5, saukhyam_fit:"High",
    description:"Integrated rural development in Raigad district. WASH, women's empowerment, digital literacy, and livelihoods. 100% village coverage model.",
    menstrual_note:"Active — WASH + women's dignity programmes",
    grant_size:"Direct implementation; limited external grants",
    geography:"Raigad district, Maharashtra",
    website:"swadesfoundation.org", contact_name:"Zarina Screwvala", contact_title:"Co-founder", contact_email:"info@swadesfoundation.org",
    verified:true, focus:["WASH","Education","Women & Girls","Livelihoods","Health & Nutrition","Rural Development"] },

  { name:"Shiv Nadar Foundation", parent_company:"Shiv Nadar / HCL", type:"Philanthropic", founded:2011, team_size:"150+",
    spend_label:"₹300–500 Cr/yr", spend_min_cr:300, spend_max_cr:500,
    gender_score:5, programmes_count:5, saukhyam_fit:"Low",
    description:"VidyaGyan — free residential schools for rural talent. SSN Institutions. Primarily education-focused philanthropy.",
    menstrual_note:"Indirect — school-based hygiene possible",
    grant_size:"₹25L–10 Cr (education-focused)",
    geography:"UP, Rajasthan, Tamil Nadu",
    website:"shivnadarfoundation.org", contact_name:"Kiran Nadar", contact_title:"Chairperson", contact_email:"info@shivnadarfoundation.org",
    verified:false, focus:["Education","Livelihoods","Rural Development"] },

  { name:"Vedanta Foundation (Nand Ghar)", parent_company:"Vedanta Resources", type:"Corporate", founded:1992, team_size:"200+",
    spend_label:"₹100–200 Cr/yr", spend_min_cr:100, spend_max_cr:200,
    gender_score:6, programmes_count:5, saukhyam_fit:"Low",
    description:"Nand Ghar programme — upgraded anganwadis with tech, solar power, and healthcare. 7,000+ Nand Ghars across India.",
    menstrual_note:"Indirect — women's community programs",
    grant_size:"₹10L–5 Cr",
    geography:"Rajasthan, Odisha, UP, Jharkhand",
    website:"vedanta.com/csr", contact_name:"Priya Agarwal Hebbar", contact_title:"Chairperson", contact_email:"csr@vedanta.co.in",
    verified:false, focus:["Education","Health & Nutrition","Women & Girls","Rural Development","Livelihoods"] },

  { name:"Mariwala Health Initiative", parent_company:"Harsh Mariwala / Marico", type:"Philanthropic", founded:2016, team_size:"15+",
    spend_label:"₹10–30 Cr/yr", spend_min_cr:10, spend_max_cr:30,
    gender_score:7, programmes_count:4, saukhyam_fit:"Medium",
    description:"Mental health philanthropy for marginalised communities. Women's mental health, gender-based violence survivors, and community psychosocial support.",
    menstrual_note:"Active via women's wellbeing programmes",
    grant_size:"₹5L–50L",
    geography:"Maharashtra, Delhi",
    website:"mariwalahealthinitiative.org", contact_name:"Vandana Gopikumar", contact_title:"Partner", contact_email:"info@mariwalahealthinitiative.org",
    verified:false, focus:["Health & Nutrition","Women & Girls","Education","Livelihoods"] },

  { name:"Piramal Foundation", parent_company:"Piramal Group", type:"Corporate", founded:2006, team_size:"200+",
    spend_label:"₹80–150 Cr/yr", spend_min_cr:80, spend_max_cr:150,
    gender_score:6, programmes_count:6, saukhyam_fit:"Medium",
    description:"Piramal Swasthya — mobile health vans and telemedicine reaching tribal and rural India.",
    menstrual_note:"Active via mobile health van programme in tribal areas",
    grant_size:"₹10L–5 Cr",
    geography:"Rajasthan, MP, Maharashtra, tribal belt",
    website:"piramalfoundation.org", contact_name:"Anand Piramal", contact_title:"Trustee", contact_email:"piramalfoundation@piramal.com",
    verified:false, focus:["Health & Nutrition","Education","Rural Development","Women & Girls","Livelihoods"] }
]

async function seed() {
  console.log('🌱 Seeding organisations...')

  // Get focus area map
  const { data: focusAreas, error: faErr } = await supabase.from('focus_areas').select('*')
  if (faErr) { console.error('Error fetching focus areas:', faErr); process.exit(1) }
  const faMap = Object.fromEntries(focusAreas.map(f => [f.name, f.id]))

  let created = 0, skipped = 0

  for (const org of ORGS) {
    const { focus, ...orgData } = org

    // Upsert org
    const { data: inserted, error: orgErr } = await supabase
      .from('organisations')
      .upsert(orgData, { onConflict: 'name' })
      .select('id')
      .single()

    if (orgErr) { console.error(`Error inserting ${org.name}:`, orgErr); skipped++; continue }

    const orgId = inserted.id

    // Delete existing focus area links
    await supabase.from('org_focus_areas').delete().eq('org_id', orgId)

    // Insert focus area links
    const links = focus
      .filter(f => faMap[f])
      .map((f, i) => ({ org_id: orgId, focus_area_id: faMap[f], is_primary: i === 0 }))

    if (links.length) {
      const { error: linkErr } = await supabase.from('org_focus_areas').insert(links)
      if (linkErr) console.error(`Focus area link error for ${org.name}:`, linkErr)
    }

    console.log(`  ✓ ${org.name}`)
    created++
  }

  console.log(`\n✅ Done. ${created} organisations seeded, ${skipped} skipped.`)
}

seed().catch(console.error)
