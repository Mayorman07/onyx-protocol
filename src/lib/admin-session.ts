import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = { email: string | null; isAdmin: boolean } | null;

/** The signed-in user and whether they're on the admins allowlist. Null when signed out. Cached per request. */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) console.error("is_admin check failed:", error.message);
  return { email: user.email ?? null, isAdmin: isAdmin === true };
});
