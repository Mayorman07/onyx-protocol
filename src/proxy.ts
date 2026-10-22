import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only the admin area and the auth callback use sessions; public pages skip the refresh.
export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
