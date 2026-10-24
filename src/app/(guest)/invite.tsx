"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Typewriter } from "./typewriter";

const DRESS_CODE_URL =
  "https://uk.pinterest.com/search/pins/?q=1920s%20outfits%20men%20and%20women&rs=ac&len=24&source_id=ac_6qNIvlRd&eq=1920s%20outfits%20men%20and%20wo&etslf=8925";

export function Invite() {
  const [revealed, setRevealed] = useState(0);
  const [decrypted, setDecrypted] = useState(false);
  const steps = useRef<(HTMLElement | null)[]>([]);
  const onDecrypted = useCallback(() => setDecrypted(true), []);

  useEffect(() => {
    if (revealed === 0) return;
    const timer = setTimeout(() => {
      steps.current[revealed]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(timer);
  }, [revealed]);

  function step(index: number, id: string, children: ReactNode, nextLabel?: string) {
    return (
      <section
        id={id}
        ref={(el) => {
          steps.current[index] = el;
        }}
        className={index <= revealed ? "step show" : "step"}
      >
        {children}
        {nextLabel && revealed === index && (
          <button type="button" onClick={() => setRevealed(index + 1)}>
            {nextLabel}
          </button>
        )}
      </section>
    );
  }

  return (
    <main>
      {step(
        0,
        "s0",
        <>
          <span className="tag">TOP SECRET</span>
          <p className="dim">{"// For your eyes only"}</p>
          <h1>
            The Onyx
            <br />
            Protocol
          </h1>
          <Typewriter onDone={onDecrypted} />
        </>,
        decrypted ? "Open the briefing" : undefined,
      )}

      {step(
        1,
        "s2",
        <>
          <h2>
            The Briefing: <span>Join the Mission</span>
          </h2>
          <p>
            Agent, your presence is formally requested for an exclusive, high-stakes gathering. A{" "}
            <span className="stamp">£30 Million</span> asset has gone live, and an elite network of tech rivals,
            power brokers, and founders are converging under one roof. Intelligence suggests a covert betrayal is
            set to go down.
          </p>
          <p>
            <b className="lemon">Your Goal:</b> Celebrate, investigate, and survive the evening.
          </p>
          <p className="dim plain">
            A note on the operation: This is an immersive theme party with a live mystery. You are both a guest and a
            central player.
          </p>
        </>,
        "Declassify intel",
      )}

      {step(
        2,
        "s2b",
        <>
          <h2>
            Declassified Intel: <span>How the Evening Works</span>
          </h2>
          <p className="dim plain">For operatives new to this type of field work, here is your procedural briefing:</p>
          <div className="row stacked">
            <b>1. RSVP to receive your identity</b>
            <span>
              The most crucial step. Upon confirmation, you will receive a covert identity and dossier. You are not
              yourself; you are a character in a movie.
            </span>
          </div>
          <div className="row stacked">
            <b>2. Learn your cover story</b>
            <span>
              Your dossier reveals your character&apos;s background, secret motives, allies, and rivals at the party.
              You should have an agenda: Who are you watching? Who must you protect? Who can you trust?
            </span>
          </div>
          <div className="row stacked">
            <b>3. Arrive in character</b>
            <span>
              Wear your designated Spy Attire or 1920s Speakeasy costume and adopt your new identity the moment you
              arrive.
            </span>
          </div>
          <div className="row stacked">
            <b>4. Interrogate and investigate</b>
            <span>
              There will be a mystery unfolding in real time. To solve it, you must speak to other agents. Introduce
              yourself using your codename. Share secrets (if you want), collect clues, and piece together the plot
              through conversation.
            </span>
          </div>
        </>,
        "Reveal mission details",
      )}

      {step(
        3,
        "s3",
        <>
          <h2>
            Mission <span>Details</span>
          </h2>
          <div className="row">
            <b>Date</b>
            <span>Saturday 7th November</span>
          </div>
          <div className="row">
            <b>Time</b>
            <span>19:00 hrs — rendezvous strictly on time</span>
          </div>
          <div className="row">
            <b>Location</b>
            <RedactedLocation />
          </div>
        </>,
        "Continue",
      )}

      {step(
        4,
        "s4",
        <>
          <h2>
            Dress <span>Code</span>
          </h2>
          <p>
            <b className="gold">1920s Speakeasy / Luxe Spy Attire</b>
          </p>
          <p>Think peak lapels, flapper glam, double-breasted suits, trench coats, and vintage elegance.</p>
          <a className="btn" href={DRESS_CODE_URL} target="_blank" rel="noopener">
            Dress code inspiration
          </a>
        </>,
        "Final instructions",
      )}

      {step(
        5,
        "s5",
        <>
          <h2>
            Your <span>Instructions</span>
          </h2>
          <p>Identity assignments and operative dossiers will be issued strictly upon receipt of your confirmation.</p>
          <p>
            <i>Trust no one. Keep your allies close and your motives hidden.</i>
          </p>
          <p className="stamp">ACCEPT IF YOU DARE.</p>
          <p>Confirm your attendance to receive your cover identity and dossier.</p>
          <Link className="btn big" href="/rsvp">
            Accept mission · RSVP
          </Link>
          <p className="dim" style={{ marginTop: 22 }}>
            Failure to confirm will result in immediate security clearance revocation.
          </p>
        </>,
      )}
    </main>
  );
}

function RedactedLocation() {
  const [open, setOpen] = useState(false);

  return (
    <span>
      <span
        className={open ? "redact open" : "redact"}
        tabIndex={0}
        role="button"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {open ? "TO BE DISCLOSED" : "██████████████"}
      </span>
      <br />
      <span className="dim">
        {open ? "Coordinates transmitted 24 hours prior to deployment." : "Tap to attempt declassification"}
      </span>
    </span>
  );
}
