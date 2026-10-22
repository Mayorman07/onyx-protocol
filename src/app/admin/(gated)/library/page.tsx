import Link from "next/link";
import { getAdminSession } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";

// Reads the session cookie, so render on request.
export const instant = false;

type LibraryRole = {
  id: string;
  display_name: string;
  codename: string;
  archetype: string | null;
  secret_motive: string;
};

const MOTIVE_PREVIEW = 60;

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export default async function LibraryPage() {
  const session = await getAdminSession();
  if (!session?.isAdmin) return null;

  // Authenticated client: RLS returns library rows only to admins.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dossiers")
    .select("id, display_name, codename, archetype, secret_motive")
    .order("display_name");

  if (error) throw new Error(`Library lookup failed: ${error.message}`);
  const roles = (data ?? []) as LibraryRole[];

  return (
    <section className="step show">
      <span className="tag">TOP SECRET</span>
      <p className="dim">{"// Role library"}</p>
      <h2>
        Role <span>Library</span>
      </h2>
      <p className="dim plain">
        {roles.length} {roles.length === 1 ? "role" : "roles"}. Casting copies a role onto the guest, so editing or
        deleting a role here never changes a guest who is already cast.
      </p>
      <Link className="btn" href="/admin/library/new">
        New role
      </Link>

      {roles.length === 0 ? (
        <p>The library is empty. Add a role to start casting.</p>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              <th>Role</th>
              <th>Codename</th>
              <th>Archetype</th>
              <th>Motive</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td data-label="Role">{role.display_name}</td>
                <td data-label="Codename">{role.codename}</td>
                <td data-label="Archetype">{role.archetype ?? "—"}</td>
                <td data-label="Motive">{truncate(role.secret_motive, MOTIVE_PREVIEW)}</td>
                <td className="actions">
                  <Link className="btn small" href={`/admin/library/${role.id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
