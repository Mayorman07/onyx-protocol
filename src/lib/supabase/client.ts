import { createBrowserClient } from "@supabase/ssr";

/** Browser client: anon key + session cookies. Safe for "use client" files. */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
