# CLAUDE.md — The Onyx Protocol

Context for any agent working in this repo. Read before acting.

## What this is
A spy / 1920s-speakeasy murder-mystery **party invite** web app. Guests RSVP and are instantly assigned a secret agent identity (codename, cover story, motive, ally, rival) served on their own private dossier page. One-off event site; ship date is firm.

## Stack
- Next.js (latest, App Router) + TypeScript, `src/` directory, **no Tailwind, no component library** — bespoke CSS is the aesthetic.
- Supabase (`@supabase/supabase-js`) for the database.
- Server Actions for all writes. Deploys to Vercel.

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build (must pass before any deploy)
- `npm run lint` — lint

## Routes
- `/` — the invite (typewriter decrypt intro, step-by-step reveal, redacted location). RSVP button → `/rsvp`.
- `/rsvp` — themed enlistment form (name + email) → Server Action → insert into `signups` → on-screen "MISSION ACCEPTED" confirmation. No dossier is assigned here.
- `/agent/[slug]` — a cast guest's dossier, server-rendered (service role) from the **`signups`** row with that `slug` and status `cast`/`sent`; themed 404 otherwise. The slug is the codename plus a random suffix (e.g. `the-magpie-3f9a1c07be`) so URLs can't be guessed.
- `/admin/login` — magic-link sign-in (`signInWithOtp`) → `/auth/callback` route handler exchanges the code → `/admin`.
- `/admin` — hosts' signups dashboard (view, change status, delete, link to casting). `/admin/cast/[id]` — cast a guest. `/admin/library` — role library CRUD. All gated in `app/admin/(gated)/layout.tsx` and, independently, by RLS via `is_admin()`. Allowlist = the `admins` table (`supabase/admins.sql`), nowhere else.
- Guest pages live in the `src/app/(guest)/` route group (URLs unchanged), whose layout wraps them in `GuestShell` (theme toggle + document chrome). The root `not-found.tsx` also uses `GuestShell`; `app/admin/not-found.tsx` is the plain admin 404.

## Themes (guest pages only)
- Two modes: **CLASSIFIED** (dark, the default — never follow the system preference) and **DECLASSIFIED** (aged manila). Same markup; only CSS tokens change: `:root` vs `:root[data-theme="declassified"]` in `globals.css`. Never hardcode colours — add a token for both modes.
- `src/app/theme.ts` holds the storage key (`onyx-theme`) and the inline `<head>` script that applies the saved theme before paint; it skips `/admin` and `/auth`. `src/app/theme-toggle.tsx` is the stamp button.
- **Admin is never themed** — no `GuestShell`, no toggle, always dark. Emails keep their own inline styles.
- The dossier case file (`src/app/(guest)/agent/[slug]/case-file.tsx`) only decorates; real dossier text must never be covered or obscured.

## Data model
- `signups` — enlisted guests. Casting **copies** a library role onto the guest's own columns (`display_name`, `codename`, `archetype`, `cover_story`, `secret_motive`, `ally`, `rival`, `storyline`), sets `status = 'cast'` and a `slug`. Editing or deleting a library role never touches a cast guest.
- `dossiers` — the editable role library (templates only), no fixed size; never hard-code the role count. Its `assigned_to_email`/`slug`/`sent_at` columns are legacy and unused.
- A codename may be held by only one `cast`/`sent` guest (app check + partial unique index `signups_cast_codename_key`). Un-cast clears the role and slug.
- Role fields are defined once in `src/app/admin/role-fields.ts` (shared by the library editor and casting form).
- `signups.sent_at` records the last dossier email; un-cast clears it.
- `signups.role_edited_at` is stamped by a DB trigger (`edit-tracking.sql`) whenever a role field actually changes. `role_edited_at > sent_at` means the sent dossier is stale; the admin UI flags it (`src/app/admin/dossier-status.ts`) but never auto-resends. Don't set `role_edited_at` from app code.
- SQL files, in run order: `schema.sql`, `seed.sql`, `admins.sql`, `casting.sql`, `sending.sql`, `edit-tracking.sql` (all but the first two are idempotent and upgrade older databases in place). Never instruct a drop-and-rebuild; the database has real data.

## Email (Resend)
- All sending goes through `src/lib/email.ts` (`import "server-only"`), which holds the Resend client and both templates. Never import it from a `"use client"` file.
- Enlistment confirmation: sent from the `/rsvp` action via `after()`, only for new signups, best-effort (a failure is logged, never shown or rolled back).
- Dossier email: admin-only `sendDossier` action (authenticated client, so RLS applies). It's a teaser only — display name + link to `${NEXT_PUBLIC_SITE_URL}/agent/${slug}`; never put cover story, motive, ally, rival or storyline in an email. On success it sets `status = 'sent'` and `sent_at`.

## Environment variables (in `.env.local`, never committed)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (secret, server-only)
- `EMAIL_FROM_HANDLER`, `EMAIL_FROM_AGENT` (sender identities)
- `NEXT_PUBLIC_SITE_URL` (base URL for dossier links in emails)

## 🔒 Security rule — highest priority
`SUPABASE_SERVICE_ROLE_KEY` is a master key that bypasses all database security.
- It must **never** carry the `NEXT_PUBLIC_` prefix.
- It must **only** be imported inside Server Actions / server components — never in any file marked `"use client"`.
- Before finishing any task that touches Supabase, search the codebase for `SERVICE_ROLE` and confirm every hit is in server-only code.
- The same rules apply to `RESEND_API_KEY`: no `NEXT_PUBLIC_` prefix, only read in `src/lib/email.ts`. Search for it before finishing any email task.
- The service-role client (`src/lib/supabase-admin.ts`) is for the public enlistment insert and the public `/agent/[slug]` read only. **All admin reads/writes use the signed-in user's client** (`src/lib/supabase/server.ts`, anon key + session cookies) so RLS enforces the allowlist. Never route admin data through the service role.
- Session refresh lives in `src/proxy.ts` (Next 16's replacement for `middleware.ts`), scoped to `/admin` and `/auth`.

## Commit conventions — commits must look professional and human-authored
Use **Conventional Commits**: `type(scope): short imperative summary`.
- Types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`, `test`, `build`.
- Summary is imperative and lowercase ("add rsvp form", not "Added RSVP form"), no trailing period, ≤ 72 chars.
- One logical change per commit. Never commit `wip`, `stuff`, `asdf`, or bundle unrelated changes.
- **No AI footprint.** Do NOT add any tool attribution, emoji footers, "Generated with…" lines, or `Co-Authored-By: Claude` / `Co-Authored-By: anthropic` trailers to commit messages. Commits must read as if written by the human developer. The commit body is optional; when used, keep it a plain human-style sentence or two with no tool branding.
- Examples:
  - `feat(rsvp): add dossier claim server action`
  - `feat(invite): port onyx landing page from reference html`
  - `chore: initialise next.js project`
  - `fix(agent): return themed 404 for unknown codename`

## Code style
- TypeScript strict. Prefer server components; add `"use client"` only when interactivity requires it.
- Keep the CSS variables and dossier aesthetic consistent across all pages.
- Small, readable functions. No dead code.

## Scaffolding note
If `create-next-app` refuses to scaffold because this folder already contains `CLAUDE.md`/`README.md`, temporarily move them out, scaffold into the folder, then move them back and commit.
