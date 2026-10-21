"use server";

export type RsvpState = { error?: string };

const MAX_LENGTH = 120;

const MESSAGES = {
  missing: "Both fields are required, agent.",
  tooLong: `Keep it under ${MAX_LENGTH} characters, agent.`,
  closed: "Enlistment is temporarily closed. Check back shortly, agent.",
};

export async function rsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();

  if (!name || !contact) return { error: MESSAGES.missing };
  if (name.length > MAX_LENGTH || contact.length > MAX_LENGTH) return { error: MESSAGES.tooLong };

  return { error: MESSAGES.closed };
}
