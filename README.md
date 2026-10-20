# The Onyx Protocol

A spy / 1920s-speakeasy murder-mystery party invite. Guests RSVP and are instantly assigned a secret agent identity, served on their own dossier page.

- `/` — the invite
- `/rsvp` — name + contact form; claims a random unassigned dossier
- `/agent/[slug]` — the guest's dossier, e.g. `/agent/the-magpie-3f9a1c07be`

Built with Next.js (App Router, TypeScript) and Supabase.

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Supabase project (**Project Settings → API**):

| Variable | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. Safe to expose; RLS blocks it from reading or writing the tables. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Bypasses row level security. Used only on the server (`src/lib/supabase-admin.ts`) to claim and read dossiers. Never give it a `NEXT_PUBLIC_` prefix. |

`.env.local` is git-ignored. On Vercel, add the same three variables under **Project Settings → Environment Variables**.

## 2. Database

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/schema.sql` — creates the `dossiers` and `guests` tables, the `claim_dossier` function (callable only with the service role key) and enables RLS.
2. `supabase/seed.sql` — inserts the 12 agent dossiers.

`claim_dossier` locks a random unassigned dossier with `for update skip locked`, so two simultaneous RSVPs can never receive the same identity. Once all 12 are taken, the RSVP page shows "All field agents deployed — contact your handler."

Each claim also generates the dossier's `slug`: its codename plus a random 10-character suffix. That slug is the guest's private URL, so dossiers can't be found by guessing codenames, and unclaimed dossiers have no page at all.

To reset between test runs (this also clears the slugs, so old dossier links stop working):

```sql
delete from guests;
update dossiers set is_assigned = false, assigned_at = null, slug = null;
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
