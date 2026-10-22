"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseRole } from "../../role-fields";

// Library writes use the signed-in user's client, so RLS (is_admin) decides whether they take effect.

export type RoleFormState = { error?: string };

const UNIQUE_VIOLATION = "23505";

/** Creates a role when `id` is null, otherwise updates it. */
export async function saveRole(id: string | null, _prev: RoleFormState, formData: FormData): Promise<RoleFormState> {
  const parsed = parseRole(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const query = id
    ? supabase.from("dossiers").update(parsed.role).eq("id", id)
    : supabase.from("dossiers").insert(parsed.role);
  const { data, error } = await query.select("id");

  if (error?.code === UNIQUE_VIOLATION) {
    return { error: `The codename "${parsed.role.codename}" is already in the library. Pick another, agent.` };
  }
  if (error || !data?.length) {
    if (error) console.error("role save failed:", error.message);
    return { error: "Transmission failed. The role was not saved." };
  }

  redirect("/admin/library");
}

export async function deleteRole(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("dossiers").delete().eq("id", id);
  if (error) console.error("role delete failed:", error.message);
  redirect("/admin/library");
}
