-- Casting: per-guest role fields on signups, and admin-only access to the role library.
-- Run after admins.sql. Upgrades an existing database in place without losing rows. Safe to re-run.

alter table signups
  add column if not exists display_name text,
  add column if not exists codename text,
  add column if not exists archetype text,
  add column if not exists cover_story text,
  add column if not exists secret_motive text,
  add column if not exists ally text,
  add column if not exists rival text,
  add column if not exists storyline text,
  add column if not exists slug text unique;

-- A codename can belong to only one cast (or sent) guest at a time.
create unique index if not exists signups_cast_codename_key
  on signups (codename) where status in ('cast', 'sent');

-- The new signups columns are covered by the existing admin-only signups
-- policies in admins.sql; no change needed there.

-- dossiers (role library): admins can read and manage it. The public dossier
-- page reads cast guests from signups via the service role, so it doesn't need these.
drop policy if exists "admins can read dossiers" on dossiers;
create policy "admins can read dossiers" on dossiers
  for select to authenticated
  using (is_admin());

drop policy if exists "admins can insert dossiers" on dossiers;
create policy "admins can insert dossiers" on dossiers
  for insert to authenticated
  with check (is_admin());

drop policy if exists "admins can update dossiers" on dossiers;
create policy "admins can update dossiers" on dossiers
  for update to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "admins can delete dossiers" on dossiers;
create policy "admins can delete dossiers" on dossiers
  for delete to authenticated
  using (is_admin());
