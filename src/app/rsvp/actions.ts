"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type RsvpState = { error?: string };

const MAX_LENGTH = 120;

const MESSAGES = {
  missing: "Both fields are required, agent.",
  tooLong: `Keep it under ${MAX_LENGTH} characters, agent.`,
  deployed: "All field agents deployed — contact your handler.",
  failed: "Transmission failed. Try again in a moment.",
};

export async function rsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();

  if (!name || !contact) return { error: MESSAGES.missing };
  if (name.length > MAX_LENGTH || contact.length > MAX_LENGTH) return { error: MESSAGES.tooLong };

  const result = await claimDossier(name, contact);
  if ("error" in result) return { error: result.error };

  redirect(`/agent/${encodeURIComponent(result.codename)}`);
}

async function claimDossier(name: string, contact: string): Promise<{ codename: string } | { error: string }> {
  const { data, error } = await supabaseAdmin().rpc("claim_dossier", {
    p_name: name,
    p_contact: contact,
  });

  if (error) {
    if (error.message.includes("ALL_DOSSIERS_ASSIGNED")) return { error: MESSAGES.deployed };
    console.error("claim_dossier failed:", error.message);
    return { error: MESSAGES.failed };
  }
  return { codename: data as string };
}
