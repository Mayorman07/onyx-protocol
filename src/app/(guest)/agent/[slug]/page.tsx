import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CaseFile, type Dossier } from "./case-file";

// Render on request and block until the dossier is fetched, so unknown slugs get a real 404.
export const instant = false;

export const metadata: Metadata = {
  title: "Dossier — The Onyx Protocol",
  robots: { index: false, follow: false },
};

async function getDossier(slug: string): Promise<Dossier | null> {
  const { data, error } = await supabaseAdmin()
    .from("signups")
    .select("codename, display_name, archetype, cover_story, secret_motive, ally, rival, storyline")
    .eq("slug", slug)
    .in("status", ["cast", "sent"])
    .maybeSingle<Dossier>();

  if (error) throw new Error(`Dossier lookup failed: ${error.message}`);
  return data;
}

export default async function AgentPage({ params }: PageProps<"/agent/[slug]">) {
  const { slug } = await params;
  const dossier = await getDossier(slug);
  if (!dossier) notFound();

  return (
    <main>
      <CaseFile dossier={dossier} slug={slug} />
    </main>
  );
}
