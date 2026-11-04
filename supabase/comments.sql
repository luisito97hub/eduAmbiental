-- Run this script in Supabase Dashboard > SQL Editor.
-- Public visitors can submit pending comments and read approved comments only.

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 50),
  message text not null check (char_length(btrim(message)) between 1 and 1000),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

grant select, insert on public.comments to anon, authenticated;

create policy "Anyone can read approved comments"
  on public.comments
  for select
  to anon, authenticated
  using (status = 'approved');

create policy "Anyone can submit pending comments"
  on public.comments
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- Review submissions in Table Editor. Change status to 'approved' to publish
-- a comment, or to 'rejected' to keep it hidden.
