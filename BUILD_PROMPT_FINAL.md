# BUILD PROMPT — The Onyx Protocol (ready to paste)

Paste everything below this line into the Claude extension in VS Code. The design reference is already included at the bottom — nothing to fill in.

---

You are building a production web app called **The Onyx Protocol**: a spy / 1920s-speakeasy murder-mystery **party invite** that assigns each guest a secret agent identity when they RSVP. Build the complete project in this folder. Work in small, verified steps, approve nothing destructive, and run the dev server to confirm it works before finishing. A `CLAUDE.md` in this folder defines conventions (especially commit style and a security rule) — follow it.

## Stack (non-negotiable)
- **Next.js (latest, App Router) + TypeScript** — scaffold with `create-next-app`, App Router, `src/` directory, **no Tailwind**, no component library. The bespoke CSS below IS the aesthetic; do not replace it.
- **Supabase** (`@supabase/supabase-js`) for the database.
- **Server Actions** for all writes. Deploy target is **Vercel**.

## Environment variables (read from `.env.local`, never hardcode, never commit)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only. Never prefix with NEXT_PUBLIC. Only import inside Server Actions / server code. If it ever appears in a `"use client"` file, that is a critical bug — stop and fix it.**

Create a `.env.example` listing these three keys with blank values. Ensure `.env.local` is in `.gitignore`. The human will fill in `.env.local` with real values themselves.

## Database — generate `supabase/schema.sql` exactly as below

```sql
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

alter table dossiers enable row level security;
alter table guests enable row level security;
```

Also generate `supabase/seed.sql` inserting the 12 dossiers in the ROSTER section.

## Pages / routes
1. **`/`** — Port the reference HTML (bottom of this file) into a React component **pixel-faithfully**: same colours, fonts, typewriter decrypt intro, step-by-step reveal on button click, redacted location that unredacts on tap, all copy preserved. The **only** change: the final "Accept mission · RSVP" button links to **`/rsvp`**, not the Google Form.
2. **`/rsvp`** — A short themed form matching the aesthetic: **name** and **contact** fields + submit. On submit, a Server Action `claimDossier(name, contact)` calls the Supabase `claim_dossier` RPC **using the service role key**. On success, `redirect()` to `/agent/[codename]`. If the RPC raises `ALL_DOSSIERS_ASSIGNED`, show a themed "All field agents deployed — contact your handler" message, no crash.
3. **`/agent/[codename]`** — The guest's personal dossier page, server-rendered from Supabase by codename. Show, in the dossier aesthetic: **DISPLAY_NAME**, archetype, cover story, secret motive, ally, rival, and a "Commit this to memory. Trust no one." footer. Unknown codename → themed 404.

## Visual system (global CSS variables)
```
--bg:#0c0d0d; --panel:#161818; --ink:#e2e4e1; --dim:#8b908d;
--gold:#d4af37; --lemon:#f2e35b; --grey:#9aa09c; --red:#c0392b; --line:#2b2f2e;
```
Body font = Courier New / monospace; headings = Georgia / serif in `--gold`. Keep the scanline background, the rotated red "TOP SECRET" tag, reduced-motion support. Mobile-first, max-width ~640px, safe-area insets.

## ROSTER — seed these 12 (gender-neutral; anyone can play any role)
| display_name | codename | archetype | cover_story | secret_motive | ally | rival |
|---|---|---|---|---|---|---|
| THE MAGPIE | the-magpie | A venture capitalist who collects secrets like jewels | Funded half the room; everyone owes you a favour | Acquire the access codes to the £30M asset before midnight | THE CARTOGRAPHER | THE WIDOW |
| THE WIDOW | the-widow | Inherited an empire under suspicious circumstances | The grieving heir, gracious and untouchable | Protect your inheritance from a clawback only you know is coming | THE PRIEST | THE MAGPIE |
| THE CARTOGRAPHER | the-cartographer | A fixer who maps everyone's weaknesses | The quiet one who knows where the bodies are | Sell your map of the room to the highest bidder tonight | THE MAGPIE | THE SOMMELIER |
| THE SOMMELIER | the-sommelier | A connoisseur whose hobby is poisons | Pouring the finest in the house, charming everyone | Settle an old debt before the clock strikes twelve | THE WIDOW | THE CARTOGRAPHER |
| THE ARCHITECT | the-architect | Built the vault holding the asset | The genius who designed the unbreakable | Prove the vault is flawless — or that you already cracked it | THE BANKER | THE MAGPIE |
| THE CLOCK | the-clock | Keeps everyone's timelines and alibis | The punctual, forgettable observer | Blackmail the one person whose alibi doesn't hold | THE ARCHITECT | THE PRIEST |
| THE PRIEST | the-priest | Trusted confessor of the entire room | The one everyone tells their secrets to | You are the mastermind of tonight's betrayal | THE WIDOW | THE CLOCK |
| THE DIPLOMAT | the-diplomat | Brokered the deal that made the asset go live | The smooth operator who made it all happen | Hide that you skimmed millions off the top of the deal | THE SOMMELIER | THE SIREN |
| THE SIREN | the-siren | A performer who overhears everything | The dazzling entertainer of the evening | Find out who really killed your patron last winter | THE GHOST | THE DIPLOMAT |
| THE GHOST | the-ghost | Supposedly died years ago | A stranger no one quite recognises | Expose whoever faked your death and stole your name | THE SIREN | THE WIDOW |
| THE BANKER | the-banker | Holds the only key to move the asset | The nervous VIP everyone is suddenly very nice to | Simply survive the night — everyone wants what you hold | THE ARCHITECT | THE MAGPIE |
| THE JOURNALIST | the-journalist | Undercover to break the story of the decade | A plus-one no one invited | Get one person on record confessing before you leave | THE GHOST | THE PRIEST |

## Acceptance criteria (verify before finishing)
- `npm run build` passes. `npm run dev` boots with no errors.
- `/`, `/rsvp`, `/agent/the-magpie` all render.
- Submitting the RSVP assigns a dossier, writes a `guests` row, flips `is_assigned`, redirects to the right agent page.
- Two rapid submissions never get the same dossier.
- Search the codebase for `SERVICE_ROLE`; every hit is in server-only code.
- `README.md` explains the three env vars, running the schema + seed SQL in Supabase, and `npm run dev`.
- Commit in logical steps using Conventional Commits per `CLAUDE.md`.

## Reference HTML — match this look and feel exactly for `/` (port to React, keep all copy, change only the RSVP button target to /rsvp):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The Onyx Protocol — Classified</title>
<style>
:root{--bg:#0c0d0d;--panel:#161818;--ink:#e2e4e1;--dim:#8b908d;--gold:#d4af37;--lemon:#f2e35b;--grey:#9aa09c;--red:#c0392b;--line:#2b2f2e;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0c0d0d}}
:root[data-theme="dark"]{--bg:#0c0d0d}
*{box-sizing:border-box}
html{scroll-padding-top:env(safe-area-inset-top,0px);scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Courier New",ui-monospace,Menlo,monospace;line-height:1.6;
background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 3px)}
main{max-width:640px;margin:0 auto;padding:24px 20px 80px}
.step{display:none;border:1px solid var(--line);border-top:3px solid var(--lemon);background:var(--panel);padding:26px 22px;margin:22px 0}
.step.show{display:block;animation:in .8s ease both}
@keyframes in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.tag{color:var(--red);border:2px solid var(--red);display:inline-block;padding:2px 10px;letter-spacing:.2em;font-weight:bold;transform:rotate(-2deg);font-size:.8rem}
h1,h2{font-family:Georgia,"Times New Roman",serif;color:var(--gold);letter-spacing:.06em;margin:.4em 0}
h1{font-size:clamp(2rem,9vw,3.2rem);line-height:1.1;text-transform:uppercase}
h2{font-size:1.3rem;text-transform:uppercase}
h2 span{color:var(--lemon)}
.dim{color:var(--dim);font-size:.85rem;letter-spacing:.12em;text-transform:uppercase}
.row{display:flex;gap:12px;padding:10px 0;border-bottom:1px dashed var(--line);flex-wrap:wrap}
.row b{color:var(--lemon);min-width:110px}
#s2b .row b{flex:0 0 100%}
.redact{background:var(--grey);color:var(--grey);padding:0 6px;cursor:pointer;user-select:none;transition:.6s}
.redact.open{background:transparent;color:var(--red)}
button,.btn{font:inherit;background:transparent;color:var(--lemon);border:1px solid var(--lemon);padding:12px 20px;margin:18px 10px 0 0;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-block}
button:hover,.btn:hover{background:var(--lemon);color:#0c0d0d}
.btn.big{background:var(--red);border-color:var(--red);color:#fff;font-weight:bold;animation:pulse 2s infinite}
.btn.big:hover{background:var(--lemon);border-color:var(--lemon);color:#0c0d0d}
@keyframes pulse{50%{box-shadow:0 0 0 8px rgba(192,57,43,.2)}}
.cursor::after{content:"▌";color:var(--lemon);animation:b 1s steps(1) infinite}@keyframes b{50%{opacity:0}}
#typed{min-height:15em;white-space:pre-wrap;margin:18px 0 0}
#typed .k{color:var(--lemon)}#typed .g{color:var(--gold)}
#go{display:none}
.stamp{color:var(--red);font-weight:bold;letter-spacing:.2em}
a.inline{color:var(--lemon)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;scroll-behavior:auto!important}}
</style>
</head>
<body>
<main>
<section class="step show" id="s0">
  <span class="tag">TOP SECRET</span>
  <p class="dim">// For your eyes only</p>
  <h1>The Onyx<br>Protocol</h1>
  <pre id="typed" class="cursor" aria-live="polite"></pre>
  <button id="go" data-next>Open the briefing</button>
</section>

<section class="step" id="s2">
  <h2>The Briefing: <span>Join the Mission</span></h2>
  <p>Agent, your presence is formally requested for an exclusive, high-stakes gathering. A <span class="stamp">£30 Million</span> asset has gone live, and an elite network of tech rivals, power brokers, and founders are converging under one roof. Intelligence suggests a covert betrayal is set to go down.</p>
  <p><b style="color:var(--lemon)">Your Goal:</b> Celebrate, investigate, and survive the evening.</p>
  <p class="dim" style="text-transform:none;letter-spacing:.02em">A note on the operation: This is an immersive theme party with a live mystery. You are both a guest and a central player.</p>
  <button data-next>Declassify intel</button>
</section>

<section class="step" id="s2b">
  <h2>Declassified Intel: <span>How the Evening Works</span></h2>
  <p class="dim" style="text-transform:none;letter-spacing:.02em">For operatives new to this type of field work, here is your procedural briefing:</p>
  <div class="row"><b>1. RSVP to receive your identity</b><span>The most crucial step. Upon confirmation, you will receive a covert identity and dossier. You are not yourself; you are a character in a movie.</span></div>
  <div class="row"><b>2. Learn your cover story</b><span>Your dossier reveals your character's background, secret motives, allies, and rivals at the party. You should have an agenda: Who are you watching? Who must you protect? Who can you trust?</span></div>
  <div class="row"><b>3. Arrive in character</b><span>Wear your designated Spy Attire or 1920s Speakeasy costume and adopt your new identity the moment you arrive.</span></div>
  <div class="row"><b>4. Interrogate and investigate</b><span>There will be a mystery unfolding in real time. To solve it, you must speak to other agents. Introduce yourself using your codename. Share secrets (if you want), collect clues, and piece together the plot through conversation.</span></div>
  <button data-next>Reveal mission details</button>
</section>

<section class="step" id="s3">
  <h2>Mission <span>Details</span></h2>
  <div class="row"><b>Date</b><span>Saturday 7th November</span></div>
  <div class="row"><b>Time</b><span>19:00 hrs — rendezvous strictly on time</span></div>
  <div class="row"><b>Location</b><span>
    <span class="redact" id="loc" tabindex="0" role="button">██████████████</span>
    <br><span class="dim" id="locnote">Tap to attempt declassification</span></span></div>
  <button data-next>Continue</button>
</section>

<section class="step" id="s4">
  <h2>Dress <span>Code</span></h2>
  <p><b style="color:var(--gold)">1920s Speakeasy / Luxe Spy Attire</b></p>
  <p>Think peak lapels, flapper glam, double-breasted suits, trench coats, and vintage elegance.</p>
  <a class="btn" href="https://uk.pinterest.com/search/pins/?q=1920s%20outfits%20men%20and%20women&amp;rs=ac&amp;len=24&amp;source_id=ac_6qNIvlRd&amp;eq=1920s%20outfits%20men%20and%20wo&amp;etslf=8925" target="_blank" rel="noopener">Dress code inspiration</a>
  <button data-next>Final instructions</button>
</section>

<section class="step" id="s5">
  <h2>Your <span>Instructions</span></h2>
  <p>Identity assignments and operative dossiers will be issued strictly upon receipt of your confirmation.</p>
  <p><i>Trust no one. Keep your allies close and your motives hidden.</i></p>
  <p class="stamp">ACCEPT IF YOU DARE.</p>
  <p>Confirm your attendance to receive your cover identity and dossier.</p>
  <a class="btn big" href="https://forms.gle/ab3vXnoYV2r9W6317" target="_blank" rel="noopener">Accept mission · RSVP</a>
  <p class="dim" style="margin-top:22px">Failure to confirm will result in immediate security clearance revocation.</p>
</section>
</main>
<script>
var lines = [
 ["MISSION CODENAME: ","k","THE ONYX PROTOCOL","g"],
 ["TARGET / HOST:    ","k","AGENT OMOTAYO","g"],
 ["CLASSIFICATION:   ","k","RESTRICTED / LEVEL 30 ACCESS","g"],
 ["STATUS:           ","k","TRANSMISSION DECRYPTED","g"]
];
var out = document.getElementById("typed"), go = document.getElementById("go");
var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function type(){
  var html="", li=0, ci=0, seg=0;
  (function tick(){
    if(li>=lines.length){ out.classList.remove("cursor"); go.style.display="inline-block"; return; }
    var l=lines[li], text=l[seg*2], cls=l[seg*2+1];
    if(ci<text.length){
      ci++;
      out.innerHTML = html + '<span class="'+cls+'">'+esc(text.slice(0,ci))+'</span>';
      return setTimeout(tick, reduce?0:38);
    }
    html += '<span class="'+cls+'">'+esc(text)+'</span>'; ci=0; seg++;
    if(seg*2>=l.length){ html+="\n"; li++; seg=0; }
    setTimeout(tick, seg===0?350:0);
  })();
}
type();
var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
document.querySelectorAll("[data-next]").forEach(function(btn){
  btn.addEventListener("click", function(){
    var cur = btn.closest(".step"), next = steps[steps.indexOf(cur)+1];
    btn.style.display = "none";
    if(next){ next.classList.add("show"); setTimeout(function(){ next.scrollIntoView({behavior:"smooth",block:"start"}); },50); }
  });
});
var loc = document.getElementById("loc");
function reveal(){
  loc.textContent = "TO BE DISCLOSED";
  loc.classList.add("open");
  document.getElementById("locnote").textContent = "Coordinates transmitted 24 hours prior to deployment.";
}
loc.addEventListener("click", reveal);
loc.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); reveal(); }});
</script>
</body>
</html>
```

Build it now. Scaffold with create-next-app first, then wire Supabase, then the three pages, then verify.
