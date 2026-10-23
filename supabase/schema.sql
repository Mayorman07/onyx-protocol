-- Guests enlist here. When the host casts a guest, a copy of the chosen
-- library role is written onto their row and can be edited per guest.
create table signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Stored lowercased by the app, so one enlistment per address.
  email text not null unique,
  status text not null default 'enlisted' check (status in ('enlisted', 'cast', 'sent')),
  created_at timestamptz not null default now(),
  -- Cast role (copied from dossiers, then edited per guest). Null until cast.
  display_name text,
  codename text,
  archetype text,
  cover_story text,
  secret_motive text,
  ally text,
  rival text,
  storyline text,
  -- Unguessable public dossier URL key (codename + random hex), set on cast.
  slug text unique,
  -- When the dossier email was last sent. Null until sent.
  sent_at timestamptz
);

-- A codename can belong to only one cast (or sent) guest at a time.
create unique index signups_cast_codename_key on signups (codename) where status in ('cast', 'sent');

-- The host's editable role library: templates copied onto guests when cast.
-- Rows can be added or removed freely.
create table dossiers (
  id uuid primary key default gen_random_uuid(),
  codename text unique not null,
  display_name text not null,
  archetype text,
  cover_story text not null,
  secret_motive text not null,
  ally text,
  rival text,
  storyline text,
  -- Unused since casting moved onto signups; kept so no data is lost.
  assigned_to_email text,
  slug text unique,
  sent_at timestamptz
);

-- Access is granted by policies in admins.sql and casting.sql (admins only);
-- public enlistment and dossier pages go through the service role on the server.
alter table signups enable row level security;
alter table dossiers enable row level security;
