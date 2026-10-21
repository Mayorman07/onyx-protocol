"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type RsvpState = { error?: string; enlisted?: boolean };

const MAX_LENGTH = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (error) {
    console.error("signup insert failed:", error.message);
    return { error: MESSAGES.failed };
  }

  // TODO(resend): send enlistment confirmation email to {email}

  return { enlisted: true };
}
