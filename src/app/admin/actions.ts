"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSignupStatus } from "./statuses";

// Admin writes use the signed-in user's client, so RLS decides whether they take effect.

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function setSignupStatus(id: string, status: string) {
  if (!isSignupStatus(status)) return;

  const supabase = await createClient();
  let query = supabase.from("signups").update({ status }).eq("id", id);
  // A guest with a role only returns to enlisted via uncastSignup, which also clears the role and slug.
  if (status === "enlisted") query = query.is("codename", null);
  const { error } = await query;
  if (error) console.error("signup status update failed:", error.message);
  refresh();
}

export async function deleteSignup(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("signups").delete().eq("id", id);
  if (error) console.error("signup delete failed:", error.message);
  refresh();
}
