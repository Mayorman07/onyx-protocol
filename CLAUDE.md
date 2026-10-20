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
- `/rsvp` — themed form (name + contact) → Server Action → Supabase `claim_dossier` RPC → redirect to `/agent/[codename]`.
- `/agent/[codename]` — the guest's personal dossier page, server-rendered from Supabase.

## Environment variables (in `.env.local`, never committed)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🔒 Security rule — highest priority
`SUPABASE_SERVICE_ROLE_KEY` is a master key that bypasses all database security.
- It must **never** carry the `NEXT_PUBLIC_` prefix.
- It must **only** be imported inside Server Actions / server components — never in any file marked `"use client"`.
- Before finishing any task that touches Supabase, search the codebase for `SERVICE_ROLE` and confirm every hit is in server-only code.

## Commit conventions — commits must look professional
Use **Conventional Commits**: `type(scope): short imperative summary`.
- Types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`, `test`, `build`.
- Summary is imperative and lowercase ("add rsvp form", not "Added RSVP form"), no trailing period, ≤ 72 chars.
- One logical change per commit. Never commit `wip`, `stuff`, `asdf`, or bundle unrelated changes.
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
