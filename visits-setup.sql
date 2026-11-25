-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It creates the table the site writes a row to on every page view.
-- No IP address, no cookie, no personal data — just which page and when.

create table if not exists public.visits (
  id         bigserial primary key,
  page       text        not null,
  referrer   text,
  created_at timestamptz not null default now()
);

alter table public.visits enable row level security;

-- anyone may record a visit
create policy "anyone can log a visit"
  on public.visits for insert
  to anon, authenticated
  with check (true);

-- anyone may read them, which is what lets the counter show on the site
create policy "anyone can read visits"
  on public.visits for select
  to anon, authenticated
  using (true);

create index if not exists visits_created_at_idx on public.visits (created_at desc);
