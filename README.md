# The Onyx Protocol

A spy / 1920s-speakeasy murder-mystery party invite. Guests enlist through the site, and the hosts cast each of them a secret agent identity, served on their own dossier page.

- `/` — the invite
- `/rsvp` — name + email enlistment form
- `/agent/[slug]` — a cast guest's dossier, e.g. `/agent/the-magpie-3f9a1c07be` (themed 404 for any other slug)
- `/admin` — the hosts' signups dashboard and casting (magic-link login at `/admin/login`)
- `/admin/library` — the role library editor

Built with Next.js (App Router, TypeScript) and Supabase.

## How it works

1. **Enlistment.** A guest submits their name and email at `/rsvp`. A server action adds them to `signups` with status `enlisted`, the page shows a "MISSION ACCEPTED" confirmation, and a confirmation email goes out from `handler@theonyxprotocol.xyz`. The email is best-effort: it's sent after the response, so if it fails the enlistment still stands (the failure is logged on the server). Someone who's already enlisted doesn't get a second email.
2. **Role library.** `dossiers` is the hosts' pool of role templates (the 12 seeded agents to start with). The hosts add, edit and delete roles at `/admin/library`.
3. **Casting.** From the dashboard, a host opens a guest's **Cast** page, picks a library role and edits the guest's copy (including a storyline written for them). Saving writes the role onto the guest's `signups` row, sets their status to `cast` and gives them an unguessable dossier URL (`/agent/<codename>-<random hex>`).
   - **Copy-on-cast:** the guest gets their own copy, so later edits to the library, or deleting the role, never change a guest who is already cast.
   - **No double casting:** a codename can belong to only one cast or sent guest at a time. The app shows a warning, and a database index enforces it.
   - **Fixing mistakes:** a guest can be recast to a different role (which frees their old codename and issues a new URL) or un-cast back to `enlisted` (which clears their role and retires their URL).
4. **Sending.** On a cast guest's page, **Send dossier** emails them a teaser from `agent@theonyxprotocol.xyz`: their display name and an **Open your dossier** button linking to their `/agent/[slug]` page. The cover story, motive, ally, rival and storyline are only on the dossier page, never in the email. A successful send sets the guest's status to `sent` and records `sent_at`. Re-sending asks for confirmation and updates `sent_at`. The dashboard's **Dossier** column shows who has been sent theirs and when.

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Supabase project (**Project Settings → API**):

| Variable | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. Safe to expose. Used for admin sign-in and for every admin read and write (signups, casting, role library), which run as the signed-in user so RLS decides what they can do. On its own (signed out) it can't read or write any table. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Bypasses row level security. Used only on the server (`src/lib/supabase-admin.ts`) for the public enlistment insert and the public dossier page, never for admin actions. Never give it a `NEXT_PUBLIC_` prefix. |
| `RESEND_API_KEY` | **Secret.** Resend API key for `theonyxprotocol.xyz`. Used only on the server (`src/lib/email.ts`). Never give it a `NEXT_PUBLIC_` prefix. |
| `EMAIL_FROM_HANDLER` | Sender for enlistment confirmations: `"The Handler <handler@theonyxprotocol.xyz>"`. |
| `EMAIL_FROM_AGENT` | Sender for dossier emails: `"The Onyx Protocol <agent@theonyxprotocol.xyz>"`. |
| `NEXT_PUBLIC_SITE_URL` | Base URL used to build dossier links in emails: `https://onyx-protocol-gamma.vercel.app` (change it if you move to a custom domain). |

`.env.local` is git-ignored. On Vercel, add the same variables under **Project Settings → Environment Variables**.

**Emails won't send until you add `RESEND_API_KEY`, `EMAIL_FROM_HANDLER`, `EMAIL_FROM_AGENT` and `NEXT_PUBLIC_SITE_URL` to both `.env.local` and Vercel** (then restart `npm run dev` / redeploy). Until then, enlistment still works but no confirmation email goes out, and **Send dossier** shows an error.

## 2. Database

### New database

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/schema.sql` — creates `signups` (including the per-guest role columns) and `dossiers`, and enables RLS on both. `signups.email` is unique (emails are saved lowercased), so each address can enlist once; a repeat submission shows "You're already enlisted, Agent — await your instructions" instead of adding a row.
2. `supabase/seed.sql` — inserts 12 starter roles into `dossiers`.
3. `supabase/admins.sql` — creates the `admins` allowlist (seeded with the two host emails), the `is_admin()` function and the admin-only RLS policies on `signups`.
4. `supabase/casting.sql` — adds the admin-only RLS policies on `dossiers`, so the role library editor works.
5. `supabase/sending.sql` — adds `signups.sent_at` (already in `schema.sql`, so on a new database this changes nothing).
6. `supabase/edit-tracking.sql` — adds `signups.role_edited_at` and the trigger that stamps it whenever a guest's role fields change.

`admins.sql`, `casting.sql`, `sending.sql` and `edit-tracking.sql` are safe to re-run.

### Upgrading for stale-dossier warnings (keeps all rows)

**Run `supabase/edit-tracking.sql` in the SQL Editor before deploying this version.** The dashboard and cast page read `signups.role_edited_at`, so they fail until it exists. The script adds that column and a `before update` trigger on `signups`. The trigger sets `role_edited_at = now()` only when one of the role fields (`display_name`, `codename`, `archetype`, `cover_story`, `secret_motive`, `ally`, `rival`, `storyline`) actually changes, whether from the cast page or by hand in Supabase. Status and `sent_at` changes don't count, and neither does a save that changes nothing. Existing rows start with no value, so nothing is flagged until a role is next edited.

If `role_edited_at` is later than `sent_at`, the guest's dossier email is out of date. The dashboard shows **⚠ Edited since** next to the send time, and the cast page shows a warning above the send button. Nothing is re-sent automatically; re-sending clears the flag.

### Upgrading for dossier emails (keeps all rows)

**Run `supabase/sending.sql` in the SQL Editor before deploying this version.** The dashboard and cast page read `signups.sent_at`, so they fail until it exists. It runs one statement:

```sql
alter table signups add column if not exists sent_at timestamptz;
```

### Upgrading an existing database (keeps all rows)

If your database was set up before casting existed, **run `supabase/casting.sql` in the SQL Editor before deploying this version.** The public dossier page and the dashboard read the new columns, so they fail until the upgrade is applied. `casting.sql` only adds what's missing and drops nothing. It runs:

```sql
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

create unique index if not exists signups_cast_codename_key
  on signups (codename) where status in ('cast', 'sent');
```

It then creates the four `dossiers` policies (select, insert, update, delete, each using `is_admin()`). The existing `signups` policies already cover the new columns, because RLS policies apply to whole rows, so admins can update them with no further change. The old `dossiers.assigned_to_email`, `slug` and `sent_at` columns are no longer used, but they're left in place so no data is lost.

### Roles

Each role needs a `codename` (lowercase letters, numbers and single hyphens, unique in the library), `display_name`, `cover_story` and `secret_motive`. `archetype`, `ally`, `rival` and `storyline` are optional, and the dossier page only shows the ones that are filled in. Nothing in the app depends on how many roles there are.

### Clearing test data

To clear test signups, including their castings, without touching the role library or the admins:

```sql
delete from signups;
```

## 3. Admin access

The hosts sign in at `/admin/login` with a magic link (Supabase Auth, via `@supabase/ssr` cookies). Access is checked in two places:

- **In the app:** every `/admin` page redirects signed-out visitors to the login page. A signed-in user who isn't on the allowlist sees "CLEARANCE REVOKED — this terminal is not authorised" and no data.
- **In the database:** the dashboard, casting and library screens read and write as the signed-in user, not with the service role. RLS policies built on `is_admin()` return zero rows to non-admins and block their writes, even if they reach a page.

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
3. **SQL Editor:** run `supabase/admins.sql` and `supabase/casting.sql` (see [Database](#2-database)).

**Things to know:**

- Supabase's built-in email sender on the free tier is rate-limited to a few auth emails per hour. That's fine for the two hosts and for testing; if you hit the limit, wait and try again. Guest-facing emails will go through Resend later; this sender is only for admin login.
- Open the magic link in the same browser you requested it from. The sign-in flow stores a one-time verifier in that browser's cookies.
- Any email can request a link and sign in, but only addresses in `admins` see any data.

### Test script

Sign in as an admin (`classified700@gmail.com`) for steps 1–6.

1. **Dashboard:** `/admin` lists signups. Changing a status and deleting a signup both take effect.
2. **Role library:** at `/admin/library`, create a role, edit it and delete it. A codename that's already in the library, or isn't lowercase-with-hyphens, shows a themed error and nothing is saved.
3. **Cast:** on the dashboard, click **Cast** for a guest. Pick a role, change a field, add a storyline and save. The guest's status becomes `cast`, their codename shows on the dashboard, and a dossier link like `/agent/the-magpie-3f9a1c07be` appears.
4. **Dossier:** open that link while signed out. It shows the guest's edited copy of the role; an unknown slug shows the themed 404.
5. **No double casting:** cast a second guest. The role you just used is marked "(taken)" and can't be picked, and typing its codename by hand shows a warning and doesn't save.
6. **Fix mistakes:** on the dashboard, a guest with a role can only be switched between `cast` and `sent`; `enlisted` isn't offered. Un-cast the first guest from their cast page instead. They return to `enlisted` and their old dossier link now 404s. Recast them to a different role; it saves with a new link.
7. **Non-admin:** sign out, then sign in with any other address. You see "CLEARANCE REVOKED" on `/admin`, `/admin/library` and every cast page, and no data.
8. **Public enlistment:** submit the form at `/rsvp` with a new email. You see MISSION ACCEPTED, a new `enlisted` row appears on the dashboard, and a "Mission Accepted — Await Further Instructions" email arrives from `handler@theonyxprotocol.xyz`. Submitting the same email again shows "already enlisted" and sends no second email.
9. **Email failure is non-fatal:** temporarily set `RESEND_API_KEY` to an invalid value and restart. Enlisting still shows MISSION ACCEPTED and adds the row; the server log shows `enlistment email failed`. Restore the key afterwards.
10. **Send dossier:** cast a guest (use an address you can check), then click **Send dossier** on their cast page. You see "Dossier transmitted", and a "Your Cover Identity Has Been Assigned" email arrives from `agent@theonyxprotocol.xyz` with their display name and an **Open your dossier** button that opens their `/agent/[slug]` page. Their status becomes `sent`, and the dashboard's Dossier column shows the send time.
11. **Re-send:** click **Re-send dossier**, then **Confirm re-send**. A second email arrives and the send time updates.
12. **Stale dossier:** after sending, change a field on the guest's cast page (e.g. the storyline) and save. The dashboard shows **⚠ Edited since** in the Dossier column, and the cast page shows the out-of-date warning. Saving again without changing anything doesn't set the flag. Re-send the dossier and the flag clears.
13. **Themes:** in a private window, open `/`. It loads in the dark CLASSIFIED look. Tap the **CLASSIFIED** stamp (top right); the page turns to aged manila paper and the stamp reads **DECLASSIFIED**. Reload and visit `/rsvp`: it stays declassified with no flash of the dark theme. Open `/admin/login`: it's still dark, with no stamp. Check both themes on a phone: there's no sideways scrolling, and the dossier page shows every field.
14. **Checks:** `npm run build`, `npm run lint` and `npx tsc --noEmit` pass, and searching for `SERVICE_ROLE` and `RESEND_API_KEY` only finds server-only files.

## 4. Themes (guest pages)

Guest pages (`/`, `/rsvp`, `/agent/[slug]` and the 404 page) come in two looks, framed as two states of the same classified document:

- **CLASSIFIED:** the dark onyx terminal. Every first-time visitor gets this, whatever their device's light/dark setting.
- **DECLASSIFIED:** an aged manila dossier, with paper grain, a soft vignette, worn rubber stamps and black-ink redaction bars.

The rubber-stamp button in the top-right corner switches between them. The choice is saved in the viewer's browser (`localStorage`, key `onyx-theme`), and a small script in `<head>` applies it before the page paints, so there's no flash of the wrong theme. If storage is blocked, the switch still works for that visit.

Both looks share the same markup; only CSS colour tokens change (`:root` vs `:root[data-theme="declassified"]` in `globals.css`). Every guest page is framed by document chrome: TOP SECRET // NOFORN strips, a document ID with a CSS barcode, and a LEVEL 30 clearance box. The dossier page is laid out as a case file, with a withheld subject photo, a CLASSIFIED stamp, a faint fingerprint and a barcode of the guest's slug. The decoration never covers the dossier text.

**The admin area is never themed:** it has no toggle and no chrome, and the `<head>` script skips `/admin` and `/auth` URLs, so it always stays dark. Emails are unaffected, since they carry their own inline styles.

## 5. Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other commands:

```bash
npm run build    # production build — must pass before deploying
npm run lint
```
