import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Render on request and block until the dossier is fetched, so unknown codenames get a real 404.
export const instant = false;

export const metadata: Metadata = {
  title: "Dossier — The Onyx Protocol",
  robots: { index: false, follow: false },
};

type Dossier = {
  codename: string;
  display_name: string;
  archetype: string;
  cover_story: string;
  secret_motive: string;
  ally: string;
  rival: string;
};

async function getDossier(codename: string): Promise<Dossier | null> {
  const { data, error } = await supabaseAdmin()
    .from("dossiers")
    .select("codename, display_name, archetype, cover_story, secret_motive, ally, rival")
    .eq("codename", codename)
    .maybeSingle<Dossier>();

  if (error) throw new Error(`Dossier lookup failed: ${error.message}`);
  return data;
}

export default async function AgentPage({ params }: PageProps<"/agent/[codename]">) {
  const { codename } = await params;
  const dossier = await getDossier(codename);
  if (!dossier) notFound();

  const fields: [string, string][] = [
    ["Archetype", dossier.archetype],
    ["Cover story", dossier.cover_story],
    ["Secret motive", dossier.secret_motive],
    ["Ally", dossier.ally],
    ["Rival", dossier.rival],
  ];

  return (
    <main>
      <section className="step show">
        <span className="tag">TOP SECRET</span>
        <p className="dim">{`// Operative dossier · ${dossier.codename}`}</p>
        <h1>{dossier.display_name}</h1>
        {fields.map(([label, value]) => (
          <div className="row stacked" key={label}>
            <b>{label}</b>
            <span>{value}</span>
          </div>
        ))}
        <p className="stamp" style={{ marginTop: 26 }}>
          Commit this to memory. Trust no one.
        </p>
      </section>
    </main>
  );
}
