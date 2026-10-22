# The Onyx Protocol

A spy / 1920s-speakeasy murder-mystery party invite. Guests enlist through the site, and the host casts each of them a secret agent identity, served on their own dossier page.

- `/` — the invite
- `/rsvp` — name + email enlistment form
- `/agent/[slug]` — a guest's dossier, e.g. `/agent/the-magpie-3f9a1c07be` (themed 404 if no dossier has that slug)
- `/admin` — the hosts' signups dashboard (magic-link login at `/admin/login`)

Built with Next.js (App Router, TypeScript) and Supabase.

## How it works

The party runs in two phases:

1. **Enlistment (live now).** A guest submits their name and email at `/rsvp`. A server action adds them to the `signups` table with status `enlisted`, and the page shows a "MISSION ACCEPTED" confirmation. No dossier is assigned at this point.
2. **Casting (in progress).** The hosts sign in at `/admin` to review signups, change their status (`enlisted` / `cast` / `sent`) and delete them. Still to come: casting each guest a role from the `dossiers` library (cover story, motive, ally, rival and storyline) and emailing it, at which point its `slug` becomes their private dossier URL.

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Supabase project (**Project Settings → API**):

| Variable | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. Safe to expose. Used for admin sign-in and for every admin read and write, which run as the signed-in user so RLS decides what they can see. On its own (signed out) it can't read or write any table. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Bypasses row level security. Used only on the server (`src/lib/supabase-admin.ts`) to record public enlistments and read dossiers, never for admin actions. Never give it a `NEXT_PUBLIC_` prefix. |

`.env.local` is git-ignored. On Vercel, add the same three variables under **Project Settings → Environment Variables**.

## 2. Database

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/schema.sql` — creates the `signups` and `dossiers` tables and enables RLS on both. `signups.email` is unique (emails are saved lowercased), so each address can enlist once; a repeat submission shows "You're already enlisted, Agent — await your instructions" instead of adding a row.
2. `supabase/seed.sql` — inserts 12 starter roles into `dossiers`.
3. `supabase/admins.sql` — creates the `admins` allowlist (seeded with the two host emails), the `is_admin()` function and the RLS policies that let only admins read, update and delete `signups`. Safe to re-run.

Each role needs a `codename`, `display_name`, `cover_story` and `secret_motive`. `archetype`, `ally`, `rival` and `storyline` are optional, and the dossier page only shows the ones that are filled in.

The 12 roles are only a starting library. Edit, add or remove `dossiers` rows directly in Supabase whenever you like; nothing in the app depends on how many there are.

A dossier only gets a page once its `slug` is set (in Phase 2, when it's sent). Use the codename plus a random suffix, such as `the-magpie-3f9a1c07be`, so dossier URLs can't be guessed.

### Resetting

To rebuild from scratch, run the SQL below. You need this if you ran any earlier version of the schema: `guests` was replaced by `signups`, `dossiers` changed shape (including the restored `archetype` column), and `signups.email` is now unique.

```sql
drop table if exists guests cascade;
drop table if exists signups cascade;
drop table if exists dossiers cascade;
drop function if exists claim_dossier(text, text);
```

Then re-run `schema.sql`, `seed.sql` and `admins.sql`. Dropping `signups` also drops its admin policies, so `admins.sql` must be re-run to restore them. The `admins` table itself is kept.

To clear test signups without touching the role library:

```sql
delete from signups;
```

## 3. Admin access

The hosts sign in at `/admin/login` with a magic link (Supabase Auth, via `@supabase/ssr` cookies). Access is checked in two places:

- **In the app:** `/admin` redirects signed-out visitors to the login page. A signed-in user who isn't on the allowlist sees "CLEARANCE REVOKED — this terminal is not authorised" and no signup data.
- **In the database:** the dashboard reads and writes `signups` as the signed-in user, not with the service role. RLS policies built on `is_admin()` return zero rows to non-admins and block their updates and deletes, even if they reach the page.

The allowlist lives only in the `admins` table. To add or remove a host, edit it in the SQL Editor:

```sql
insert into admins (email) values ('new.host@example.com');
delete from admins where email = 'old.host@example.com';
```

Use lowercase emails.

### Supabase dashboard setup (required for magic links)

1. **Authentication → URL Configuration**
   - **Site URL:** `https://onyx-protocol-gamma.vercel.app`
   - **Redirect URLs:** add all four:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`
     - `https://onyx-protocol-gamma.vercel.app`
     - `https://onyx-protocol-gamma.vercel.app/auth/callback`
2. **Authentication → Providers → Email:** make sure the Email provider is enabled, so magic links / OTP work.
3. **SQL Editor:** run `supabase/admins.sql` (see [Database](#2-database)).

**Things to know:**

- Supabase's built-in email sender on the free tier is rate-limited to a few auth emails per hour. That's fine for the two hosts and for testing; if you hit the limit, wait and try again. Guest-facing emails will go through Resend later; this sender is only for admin login.
- Open the magic link in the same browser you requested it from. The sign-in flow stores a one-time verifier in that browser's cookies.
- Any email can request a link and sign in, but only addresses in `admins` see any data.

### Test script

1. **Admin:** request a link at `/admin/login` with `classified700@gmail.com` and click it. You land on `/admin` and see the signups table. Change a status and delete a signup; both take effect.
2. **Non-admin:** sign out, then request a link with any other address and click it. You see "CLEARANCE REVOKED" and no signup data.
3. **Public enlistment:** submit the form at `/rsvp`. A new row appears in `signups` (and on the dashboard).
4. **Checks:** `npm run build`, `npm run lint` and `npx tsc --noEmit` pass, and searching for `SERVICE_ROLE` only finds server-only files.

## 4. Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other commands:

```bash
npm run build    # production build — must pass before deploying
npm run lint
```
