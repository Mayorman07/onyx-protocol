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
  assigned_at timestamptz,
  -- Unguessable URL key (codename + random suffix), set when the dossier is claimed.
  slug text unique
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  dossier_id uuid references dossiers(id),
  created_at timestamptz not null default now()
);

alter table dossiers enable row level security;
alter table guests enable row level security;
