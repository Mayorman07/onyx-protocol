# The Onyx Protocol

A spy / 1920s-speakeasy murder-mystery party invite. Guests enlist through the site, and the host casts each of them a secret agent identity, served on their own dossier page.

- `/` — the invite
- `/rsvp` — name + email enlistment form
- `/agent/[slug]` — a guest's dossier, e.g. `/agent/the-magpie-3f9a1c07be` (themed 404 if no dossier has that slug)

Built with Next.js (App Router, TypeScript) and Supabase.

## How it works

The party runs in two phases:

1. **Enlistment (live now).** A guest submits their name and email at `/rsvp`. A server action adds them to the `signups` table with status `enlisted`, and the page shows a "MISSION ACCEPTED" confirmation. No dossier is assigned at this point.
2. **Casting (coming later).** The host reviews the signups and casts each guest a role from the `dossiers` library: cover story, motive, ally, rival and storyline. The role is then emailed to the guest, and its `slug` becomes their private dossier URL. The admin screens and email sending are not built yet.

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Supabase project (**Project Settings → API**):

| Variable | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. Safe to expose; RLS blocks it from reading or writing the tables. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Bypasses row level security. Used only on the server (`src/lib/supabase-admin.ts`) to record signups and read dossiers. Never give it a `NEXT_PUBLIC_` prefix. |

`.env.local` is git-ignored. On Vercel, add the same three variables under **Project Settings → Environment Variables**.

## 2. Database

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/schema.sql` — creates the `signups` and `dossiers` tables and enables RLS on both.
2. `supabase/seed.sql` — inserts 12 starter roles into `dossiers`.

The 12 roles are only a starting library. Edit, add or remove `dossiers` rows directly in Supabase whenever you like; nothing in the app depends on how many there are.

A dossier only gets a page once its `slug` is set (in Phase 2, when it's sent). Use the codename plus a random suffix, such as `the-magpie-3f9a1c07be`, so dossier URLs can't be guessed.

### Resetting

To rebuild from scratch (needed if you ran an earlier version of the schema, because the table shapes changed and `guests` was replaced by `signups`), run:

```sql
drop table if exists guests cascade;
drop table if exists signups cascade;
drop table if exists dossiers cascade;
drop function if exists claim_dossier(text, text);
```

Then re-run `schema.sql` and `seed.sql`.

To clear test signups without touching the role library:

```sql
delete from signups;
```

## 3. Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other commands:

```bash
npm run build    # production build — must pass before deploying
npm run lint
```
