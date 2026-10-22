"use server";

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { EMPTY_ROLE, parseRole } from "../../role-fields";

// Casting writes use the signed-in user's client, so RLS (is_admin) decides whether they take effect.

export type CastFormState = { error?: string; saved?: boolean };

const UNIQUE_VIOLATION = "23505";
const CAST_CODENAME_INDEX = "signups_cast_codename_key";

function takenMessage(codename: string, holder?: string) {
  const who = holder ? ` (${holder})` : "";
  return `"${codename}" is already cast to another guest${who}. Un-cast them first or pick another role, agent.`;
}

/** Keeps the guest's slug while their codename is unchanged; otherwise issues a fresh unguessable one. */
function slugFor(codename: string, current: string | null) {
  if (current?.startsWith(`${codename}-`)) return current;
  return `${codename}-${randomBytes(5).toString("hex")}`;
}

/** Saves the guest's copy of their role, marks them cast and makes sure they have a dossier slug. */
export async function castSignup(id: string, _prev: CastFormState, formData: FormData): Promise<CastFormState> {
  if (!isUuid(id)) return { error: "Unknown guest." };
  const parsed = parseRole(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { role } = parsed;
  const codename = role.codename!;

  const supabase = await createClient();

  const { data: holder } = await supabase
    .from("signups")
    .select("name")
    .eq("codename", codename)
    .in("status", ["cast", "sent"])
    .neq("id", id)
    .limit(1)
    .maybeSingle<{ name: string }>();
  if (holder) return { error: takenMessage(codename, holder.name) };

  const { data: current } = await supabase.from("signups").select("slug").eq("id", id).maybeSingle<{ slug: string | null }>();
  if (!current) return { error: "Unknown guest." };

  const { data, error } = await supabase
    .from("signups")
    .update({ ...role, slug: slugFor(codename, current.slug), status: "cast" })
    .eq("id", id)
    .select("id");

  // The partial unique index catches a race with another save of the same codename.
  if (error?.code === UNIQUE_VIOLATION && error.message.includes(CAST_CODENAME_INDEX)) {
    return { error: takenMessage(codename) };
  }
  if (error || !data?.length) {
    if (error) console.error("cast save failed:", error.message);
    return { error: "Transmission failed. The casting was not saved." };
  }

  refresh();
  return { saved: true };
}

/** Reverts a guest to enlisted and clears their copied role, freeing the codename and retiring their dossier URL. */
export async function uncastSignup(id: string) {
  if (!isUuid(id)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("signups")
    .update({ ...EMPTY_ROLE, slug: null, status: "enlisted" })
    .eq("id", id);
  if (error) console.error("uncast failed:", error.message);
  refresh();
}
