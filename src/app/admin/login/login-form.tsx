"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "failed";

export function LoginForm({ linkFailed }: { linkFailed: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase();
    setStatus("sending");

    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? "failed" : "sent");
  }

  if (status === "sent") {
    return (
      <div role="status">
        <h2>
          Check your <span>inbox</span>
        </h2>
        <p>Check your inbox, Agent — your access link has been transmitted.</p>
        <p className="dim plain">Open it in this same browser to complete sign-in.</p>
      </div>
    );
  }

  return (
    <>
      <h2>
        Handler <span>Access</span>
      </h2>
      <p>Authorised personnel only. Request a one-time access link.</p>
      <form onSubmit={requestLink}>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" inputMode="email" maxLength={120} required />
        </label>
        {linkFailed && status === "idle" && (
          <p className="alert" role="alert">
            That access link is invalid or has expired. Request a new one.
          </p>
        )}
        {status === "failed" && (
          <p className="alert" role="alert">
            Transmission failed. Wait a moment and try again.
          </p>
        )}
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Transmitting…" : "Request access link"}
        </button>
      </form>
    </>
  );
}
