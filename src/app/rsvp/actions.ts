"use server";

import { after } from "next/server";
import { sendEnlistmentConfirmation } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type RsvpState = { error?: string; outcome?: "enlisted" | "already-enlisted" };

const MAX_LENGTH = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION = "23505";

const MESSAGES = {
  missingName: "State your name, agent.",
  badEmail: "That secure line doesn't check out. Enter a valid email, agent.",
  tooLong: `Keep it under ${MAX_LENGTH} characters, agent.`,
  failed: "Transmission failed. Try again in a moment.",
};

export async function rsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name) return { error: MESSAGES.missingName };
  if (!EMAIL_PATTERN.test(email)) return { error: MESSAGES.badEmail };
  if (name.length > MAX_LENGTH || email.length > MAX_LENGTH) return { error: MESSAGES.tooLong };

  const { error } = await supabaseAdmin().from("signups").insert({ name, email });
  if (error?.code === UNIQUE_VIOLATION) return { outcome: "already-enlisted" };
  if (error) {
    console.error("signup insert failed:", error.message);
    return { error: MESSAGES.failed };
  }

  // Best-effort and only for new signups: runs after the response, so a failed
  // email never blocks or undoes the enlistment. The signups row is the source of truth.
  after(async () => {
    try {
      await sendEnlistmentConfirmation(email);
    } catch (err) {
      console.error("enlistment email failed:", err instanceof Error ? err.message : err);
    }
  });

  return { outcome: "enlisted" };
}
