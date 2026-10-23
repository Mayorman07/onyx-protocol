import Link from "next/link";
import { getAdminSession } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "../format";
import type { SignupStatus } from "../statuses";
import { SignupControls } from "./signup-controls";

// Reads the session cookie, so render on request (as the layout does).
export const instant = false;

type Signup = {
  id: string;
  name: string;
  email: string;
  status: SignupStatus;
  created_at: string;
  codename: string | null;
  sent_at: string | null;
};

function DossierCell({ signup }: { signup: Signup }) {
  if (!signup.codename) return <td data-label="Dossier">—</td>;
  return (
    <td data-label="Dossier">
      {signup.sent_at ? (
        <span>
          <b className="gold">Sent</b> {formatDateTime(signup.sent_at)}
        </span>
      ) : (
        <span className="stamp">Not sent</span>
      )}
    </td>
  );
}

export default async function AdminPage() {
  // The layout already gates the UI; this keeps the page safe on its own too.
  const session = await getAdminSession();
  if (!session?.isAdmin) return null;

  // Authenticated client, not the service role: RLS returns rows only to admins.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("signups")
    .select("id, name, email, status, created_at, codename, sent_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Signups lookup failed: ${error.message}`);
  const signups = (data ?? []) as Signup[];
  const awaitingDossier = signups.filter((s) => s.codename && !s.sent_at).length;

  return (
    <section className="step show">
      <span className="tag">TOP SECRET</span>
      <p className="dim">{"// Handler terminal"}</p>
      <h2>
        Enlisted <span>Agents</span>
      </h2>
      <p className="dim plain">
        {signups.length} {signups.length === 1 ? "signup" : "signups"}
        {awaitingDossier > 0 && ` · ${awaitingDossier} cast but not yet sent their dossier`}
      </p>

      {signups.length === 0 ? (
        <p>No agents have enlisted yet.</p>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Enlisted</th>
              <th>Role</th>
              <th>Dossier</th>
              <th>Status</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {signups.map((signup) => (
              <tr key={signup.id}>
                <td data-label="Name">{signup.name}</td>
                <td data-label="Email">{signup.email}</td>
                <td data-label="Enlisted">{formatDateTime(signup.created_at)}</td>
                <td data-label="Role">
                  <span>{signup.codename ?? "—"}</span>
                  <Link className="btn small" href={`/admin/cast/${signup.id}`}>
                    {signup.codename ? "Recast" : "Cast"}
                  </Link>
                </td>
                <DossierCell signup={signup} />
                <SignupControls
                  id={signup.id}
                  status={signup.status}
                  name={signup.name}
                  hasRole={signup.codename !== null}
                />
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
