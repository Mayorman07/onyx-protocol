"use client";

import { useActionState } from "react";
import { rsvp, type RsvpState } from "./actions";

const initialState: RsvpState = {};

export function RsvpForm() {
  const [state, formAction, pending] = useActionState(rsvp, initialState);

  if (state.outcome === "enlisted") {
    return (
      <div role="status">
        <h2>
          Mission <span>Accepted</span>
        </h2>
        <p>Your enlistment is logged. Await further instructions, Agent.</p>
        <p className="stamp">Keep your eyes open — the walls have ears.</p>
      </div>
    );
  }

  if (state.outcome === "already-enlisted") {
    return (
      <div role="status">
        <h2>
          Already <span>Enlisted</span>
        </h2>
        <p>You&apos;re already enlisted, Agent — await your instructions.</p>
        <p className="stamp">Keep your eyes open — the walls have ears.</p>
      </div>
    );
  }

  return (
    <>
      <h2>
        Accept the <span>Mission</span>
      </h2>
      <p>State your name and a secure email. Your cover identity and instructions will follow.</p>
      <form action={formAction}>
        <label className="field">
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" maxLength={120} required />
        </label>
        <label className="field">
          <span>Secure email (for your instructions)</span>
          <input name="email" type="email" autoComplete="email" inputMode="email" maxLength={120} required />
        </label>
        {state.error && (
          <p className="alert" role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending}>
          {pending ? "Transmitting…" : "Enlist"}
        </button>
      </form>
    </>
  );
}
