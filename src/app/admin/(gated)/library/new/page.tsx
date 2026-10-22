import { getAdminSession } from "@/lib/admin-session";
import { EMPTY_ROLE } from "../../../role-fields";
import { RoleForm } from "../role-form";

// Reads the session cookie, so render on request.
export const instant = false;

export default async function NewRolePage() {
  const session = await getAdminSession();
  if (!session?.isAdmin) return null;

  return (
    <section className="step show">
      <span className="tag">TOP SECRET</span>
      <p className="dim">{"// Role library"}</p>
      <h2>
        New <span>Role</span>
      </h2>
      <RoleForm id={null} values={EMPTY_ROLE} />
    </section>
  );
}
