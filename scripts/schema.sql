-- ============================================================
-- India CSR Tracker — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANISATIONS table
-- ============================================================
create table if not exists organisations (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  parent_company   text,
  type             text check (type in ('Corporate','Philanthropic','PSU','International')),
  founded          integer,
  team_size        text,
  -- Spend
  spend_label      text,          -- e.g. "₹150–200 Cr/yr"
  spend_min_cr     numeric,       -- lower bound in Crore
  spend_max_cr     numeric,       -- upper bound in Crore
  -- Scoring
  gender_score     integer check (gender_score between 1 and 10),
  programmes_count integer,
  saukhyam_fit     text check (saukhyam_fit in ('High','Medium','Low')),
  -- Qualitative
  description      text,
  menstrual_note   text,
  grant_size       text,
  geography        text,
  website          text,
  -- Contact
  contact_name     text,
  contact_title    text,
  contact_email    text,
  -- Meta
  verified         boolean default false,
  last_verified_at timestamptz,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- FOCUS AREAS lookup
-- ============================================================
create table if not exists focus_areas (
  id    serial primary key,
  name  text unique not null,
  color text,   -- tailwind / hex hint
  icon  text    -- emoji or symbol
);

insert into focus_areas (name, color, icon) values
  ('Women & Girls',    '#993556', '♀'),
  ('Menstrual Health', '#E8593C', '◉'),
  ('Education',        '#185FA5', '◈'),
  ('Health & Nutrition','#1D9E75','✦'),
  ('Livelihoods',      '#BA7517', '⬡'),
  ('Environment',      '#3B6D11', '◯'),
  ('Rural Development','#5F5E5A', '▣'),
  ('WASH',             '#534AB7', '◇')
on conflict (name) do nothing;

-- ============================================================
-- ORG ↔ FOCUS_AREA join table
-- ============================================================
create table if not exists org_focus_areas (
  org_id        uuid references organisations(id) on delete cascade,
  focus_area_id integer references focus_areas(id) on delete cascade,
  is_primary    boolean default false,
  primary key (org_id, focus_area_id)
);

-- ============================================================
-- GRANTS table (optional detail layer)
-- ============================================================
create table if not exists grants (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid references organisations(id) on delete cascade,
  title       text not null,
  description text,
  min_amount_lakhs numeric,
  max_amount_lakhs numeric,
  deadline    date,
  status      text check (status in ('open','closed','rolling')),
  url         text,
  created_at  timestamptz default now()
);

-- ============================================================
-- OUTREACH LOG (track Saukhyam engagement with each CSR org)
-- ============================================================
create table if not exists outreach (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid references organisations(id) on delete cascade,
  date        date not null,
  stage       text check (stage in ('Identified','Contacted','Meeting','Proposal Sent','Under Review','Funded','Declined','On Hold')),
  notes       text,
  created_by  text,
  created_at  timestamptz default now()
);

-- ============================================================
-- Row-Level Security (public read, auth-gated write)
-- ============================================================
alter table organisations    enable row level security;
alter table focus_areas      enable row level security;
alter table org_focus_areas  enable row level security;
alter table grants           enable row level security;
alter table outreach         enable row level security;

-- Public read
create policy "public read orgs"    on organisations   for select using (true);
create policy "public read focus"   on focus_areas     for select using (true);
create policy "public read mapping" on org_focus_areas for select using (true);
create policy "public read grants"  on grants          for select using (true);
create policy "public read outreach" on outreach       for select using (true);

-- Authenticated write (protect via Supabase Auth or service role in seed script)
create policy "auth insert orgs"    on organisations   for insert with check (auth.role() = 'authenticated');
create policy "auth update orgs"    on organisations   for update using (auth.role() = 'authenticated');
create policy "auth insert outreach" on outreach       for insert with check (auth.role() = 'authenticated');
create policy "auth update outreach" on outreach       for update using (auth.role() = 'authenticated');

-- ============================================================
-- Handy views
-- ============================================================
create or replace view orgs_with_focus as
select
  o.*,
  array_agg(fa.name order by ofa.is_primary desc, fa.name) as focus_areas
from organisations o
left join org_focus_areas ofa on ofa.org_id = o.id
left join focus_areas fa on fa.id = ofa.focus_area_id
group by o.id;

-- ============================================================
-- Auto-updated_at trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organisations_updated_at
  before update on organisations
  for each row execute procedure set_updated_at();

-- ============================================================
-- ADDITIONAL COLUMNS for Navigator scoring (run after initial schema)
-- ============================================================
alter table organisations
  add column if not exists ngo_size_preference text check (ngo_size_preference in ('grassroots','growing','established','large','all')),
  add column if not exists grant_tier text check (grant_tier in ('small','medium','large')),
  add column if not exists recent_investments text,
  add column if not exists application_type text check (application_type in ('open','invite','both','rolling')),
  add column if not exists application_window text;

-- Refresh the view to include new columns
drop view if exists orgs_with_focus;
create or replace view orgs_with_focus as
select
  o.*,
  array_agg(fa.name order by ofa.is_primary desc, fa.name) as focus_areas
from organisations o
left join org_focus_areas ofa on ofa.org_id = o.id
left join focus_areas fa on fa.id = ofa.focus_area_id
group by o.id;
