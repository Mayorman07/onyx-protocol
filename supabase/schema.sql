create table dossiers (
  id uuid primary key default gen_random_uuid(),
  codename text unique not null,
  display_name text not null,
  archetype text not null,
  cover_story text not null,
  secret_motive text not null,
  ally text not null,
  rival text not null,
  is_assigned boolean not null default false,
  assigned_at timestamptz
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  dossier_id uuid references dossiers(id),
  created_at timestamptz not null default now()
);

create or replace function claim_dossier(p_name text, p_contact text)
returns text
language plpgsql
security definer
as $$
declare
  v_id uuid;
  v_codename text;
begin
  select id, codename into v_id, v_codename
  from dossiers
  where is_assigned = false
  order by random()
  limit 1
  for update skip locked;

  if v_id is null then
    raise exception 'ALL_DOSSIERS_ASSIGNED';
  end if;

  update dossiers set is_assigned = true, assigned_at = now() where id = v_id;
  insert into guests (name, contact, dossier_id) values (p_name, p_contact, v_id);
  return v_codename;
end;
$$;

-- Only the server (service role) may claim dossiers; block direct calls via the public API.
revoke execute on function claim_dossier(text, text) from public, anon, authenticated;

alter table dossiers enable row level security;
alter table guests enable row level security;
