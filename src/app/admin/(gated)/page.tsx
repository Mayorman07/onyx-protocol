import { getAdminSession } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";
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
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});

export default async function AdminPage() {
  // The layout already gates the UI; this keeps the page safe on its own too.
  const session = await getAdminSession();
  if (!session?.isAdmin) return null;

  // Authenticated client, not the service role: RLS returns rows only to admins.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("signups")
    .select("id, name, email, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Signups lookup failed: ${error.message}`);
  const signups = (data ?? []) as Signup[];

  return (
    <section className="step show">
      <span className="tag">TOP SECRET</span>
      <p className="dim">{"// Handler terminal"}</p>
      <h2>
        Enlisted <span>Agents</span>
      </h2>
      <p className="dim plain">
        {signups.length} {signups.length === 1 ? "signup" : "signups"}
      </p>

      {signups.length === 0 ? (
        <p>No agents have enlisted yet.</p>
      ) : (
        <table className="signups">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Enlisted</th>
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
                <td data-label="Enlisted">{DATE_FORMAT.format(new Date(signup.created_at))}</td>
                <SignupControls id={signup.id} status={signup.status} name={signup.name} />
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
