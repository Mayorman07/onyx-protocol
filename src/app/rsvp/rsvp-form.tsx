"use client";

import { useActionState } from "react";
import { rsvp, type RsvpState } from "./actions";

const initialState: RsvpState = {};

export function RsvpForm() {
  const [state, formAction, pending] = useActionState(rsvp, initialState);

  return (
    <form action={formAction}>
      <label className="field">
        <span>Name</span>
        <input name="name" type="text" autoComplete="name" maxLength={120} required />
      </label>
      <label className="field">
        <span>Contact (email or phone)</span>
        <input name="contact" type="text" autoComplete="email" maxLength={120} required />
      </label>
      {state.error && (
        <p className="alert" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? "Transmitting…" : "Request my dossier"}
      </button>
    </form>
  );
}
