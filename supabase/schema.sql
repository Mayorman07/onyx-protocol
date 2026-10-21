-- Phase 1: guests enlist here. The host casts them a role later.
create table signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  status text not null default 'enlisted' check (status in ('enlisted', 'cast', 'sent')),
  created_at timestamptz not null default now()
);

-- The host's editable role library. Rows can be added or removed freely.
create table dossiers (
  id uuid primary key default gen_random_uuid(),
  codename text unique not null,
  display_name text not null,
  cover_story text not null,
  secret_motive text not null,
  ally text,
  rival text,
  storyline text,
  assigned_to_email text,
  -- Unguessable public URL key, set when the dossier is sent to its guest.
  slug text unique,
  sent_at timestamptz
);

-- All app access goes through the service role in server code; RLS blocks everyone else.
alter table signups enable row level security;
alter table dossiers enable row level security;
