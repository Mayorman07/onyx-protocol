-- Admin allowlist and admin-only access to signups.
-- Run after schema.sql. Safe to re-run.

create table if not exists admins (
  email text primary key
);

-- REPLACE THESE before running: use your real admin (host) email addresses, in lowercase.
-- Only addresses in this table can see the admin dashboard.
insert into admins (email) values
  ('admin1@example.com'),
  ('admin2@example.com')
on conflict (email) do nothing;

-- SECURITY DEFINER so policies can check the allowlist without recursing into admins' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from admins
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

-- admins: readable by admins only; changes are made by hand in SQL.
alter table admins enable row level security;

drop policy if exists "admins can read admins" on admins;
create policy "admins can read admins" on admins
  for select to authenticated
  using (is_admin());

-- signups: admins can read, update and delete. No anon policies; public
-- enlistment inserts go through the service role, which bypasses RLS.
drop policy if exists "admins can read signups" on signups;
create policy "admins can read signups" on signups
  for select to authenticated
  using (is_admin());

drop policy if exists "admins can update signups" on signups;
create policy "admins can update signups" on signups
  for update to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "admins can delete signups" on signups;
create policy "admins can delete signups" on signups
  for delete to authenticated
  using (is_admin());
