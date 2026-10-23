-- Stale-dossier tracking: stamps signups.role_edited_at whenever a guest's role
-- fields change, so the dashboard can flag dossiers edited after they were sent.
-- Run after sending.sql. Upgrades an existing database in place without losing rows. Safe to re-run.

alter table signups
  add column if not exists role_edited_at timestamptz;

-- Fires on any update (from the app or by hand in Supabase), but only stamps
-- when a role field actually changes; status and sent_at changes don't count.
create or replace function public.stamp_role_edited_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.display_name, new.codename, new.archetype, new.cover_story,
      new.secret_motive, new.ally, new.rival, new.storyline)
     is distinct from
     (old.display_name, old.codename, old.archetype, old.cover_story,
      old.secret_motive, old.ally, old.rival, old.storyline) then
    new.role_edited_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists signups_stamp_role_edited_at on signups;
create trigger signups_stamp_role_edited_at
  before update on signups
  for each row execute function public.stamp_role_edited_at();
