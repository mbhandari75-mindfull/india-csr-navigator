# India CSR Tracker — Saukhyam Pads

A production-grade CSR intelligence dashboard tracking 35 Indian CSR foundations — scored for alignment with menstrual health, women empowerment, and rural development.

Built as a Next.js 14 app backed by Supabase, deployable to Vercel in under 30 minutes.

---

## What's inside

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Hosting | Vercel (ISR, edge-ready) |
| Charts | Chart.js (bubble/quadrant) |
| Export | Client-side CSV + JSON |

---

## Setup in 5 steps

### Step 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/india-csr-tracker.git
cd india-csr-tracker
npm install
```

### Step 2 — Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a region close to India (e.g. **ap-south-1 Mumbai**)
3. Once created, go to **Settings → API**
4. Copy your **Project URL** and **anon public key**

### Step 3 — Run the database schema

1. In Supabase, open the **SQL Editor**
2. Copy the contents of `scripts/schema.sql`
3. Paste and click **Run**

This creates all tables, RLS policies, views, and focus area seed data.

### Step 4 — Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> The service role key is only needed for the seed script. Never expose it in the browser.

### Step 5 — Seed the database

```bash
node scripts/seed.js
```

This inserts all 35 organisations and links them to their focus areas.

Expected output:
```
🌱 Seeding organisations...
  ✓ Tata Trusts
  ✓ Azim Premji Foundation
  ... (35 total)
✅ Done. 35 organisations seeded, 0 skipped.
```

---

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

When prompted, set environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B — Vercel dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

---

## Adding / updating organisations

### Via seed script

Edit the `ORGS` array in `scripts/seed.js` and re-run:

```bash
node scripts/seed.js
```

The script uses `upsert` on `name` — existing orgs are updated, new ones are added.

### Via Supabase dashboard

1. Open your Supabase project → **Table Editor → organisations**
2. Add/edit rows directly
3. Then manually link focus areas in the `org_focus_areas` table

### Via Supabase SQL

```sql
-- Insert a new org
insert into organisations (name, parent_company, type, spend_label, spend_min_cr, spend_max_cr, ...)
values ('New Foundation', 'Parent Corp', 'Corporate', '₹50–100 Cr/yr', 50, 100, ...);

-- Link to focus areas
insert into org_focus_areas (org_id, focus_area_id, is_primary)
select o.id, fa.id, (fa.name = 'Women & Girls')
from organisations o, focus_areas fa
where o.name = 'New Foundation'
  and fa.name in ('Women & Girls', 'Health & Nutrition');
```

---

## Project structure

```
india-csr-tracker/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Server component, fetches data
│   ├── globals.css
│   └── api/
│       ├── orgs/           # REST endpoint for orgs (optional)
│       ├── stats/          # Aggregated stats
│       └── focus-areas/    # Focus areas with org lists
├── components/
│   ├── Dashboard.tsx       # Main client shell, tab state
│   ├── Header.tsx          # Top bar with search + export
│   ├── StatRow.tsx         # 4 KPI cards
│   ├── FilterBar.tsx       # Focus + fit filter pills
│   ├── OrgGrid.tsx         # Card grid
│   ├── OrgCard.tsx         # Individual org card
│   ├── OrgModal.tsx        # Full org detail modal
│   ├── QuadrantChart.tsx   # 2×2 bubble chart
│   └── FocusAreaView.tsx   # Focus area rows with org pills
├── lib/
│   ├── supabase.ts         # Supabase client + TypeScript types
│   ├── colours.ts          # Tag/type colour helpers
│   └── export.ts           # CSV + JSON download
└── scripts/
    ├── schema.sql          # Full Supabase schema (run once)
    └── seed.js             # Org data seeder (run after schema)
```

---

## Scoring methodology

**Saukhyam fit** (High / Medium / Low) is assessed on:
- Whether the org explicitly funds menstrual health or women's hygiene
- Gender mandate score (1–10) based on stated focus areas and recent grants
- Geographic overlap with Saukhyam's operational areas
- Grant size compatibility with Saukhyam's fundraising asks

**Gender mandate score** (1–10):
- 9–10: Core mandate is women/girls' health or menstrual hygiene
- 7–8: Strong women's empowerment focus with health component
- 5–6: Women is one of several equal priority areas
- 3–4: Incidental women's programmes alongside core mandate
- 1–2: No meaningful gender focus

---

## Data sources

- Company CSR reports (MCA Schedule VII filings)
- CSRBOX foundation profiles
- Bain & Company India Philanthropy Reports (2024, 2025)
- Foundation websites (verified contacts)
- The CSR Journal
- Dasra sector reports

---

## Roadmap

- [ ] Supabase Auth — gated admin panel for updating orgs
- [ ] Outreach tracker — log calls, meetings, proposals per org
- [ ] Email alerts — notify when new grant windows open
- [ ] State-level choropleth map — show CSR spend by geography
- [ ] Import from CSV — bulk update orgs via spreadsheet upload

---

## License

Built for Saukhyam Pads internal use. Data is compiled from public sources; verify before use in formal proposals.
