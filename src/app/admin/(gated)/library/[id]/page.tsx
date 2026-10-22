import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { ConfirmButton } from "../../../confirm-button";
import { ROLE_COLUMNS, type Role } from "../../../role-fields";
import { deleteRole } from "../actions";
import { RoleForm } from "../role-form";

// Reads the session cookie, so render on request.
export const instant = false;

export default async function EditRolePage({ params }: PageProps<"/admin/library/[id]">) {
  const session = await getAdminSession();
  if (!session?.isAdmin) return null;

  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data: role, error } = await supabase.from("dossiers").select(ROLE_COLUMNS).eq("id", id).maybeSingle<Role>();

  if (error) throw new Error(`Role lookup failed: ${error.message}`);
  if (!role) notFound();

  return (
    <section className="step show">
      <span className="tag">TOP SECRET</span>
      <p className="dim">{"// Role library"}</p>
      <h2>
        Edit <span>{role.display_name}</span>
      </h2>
      <RoleForm id={id} values={role} />
      <hr className="divider" />
      <p className="dim plain">
        Deleting removes this role from the library only. Guests already cast in it keep their copy.
      </p>
      <ConfirmButton label="Delete role" confirmLabel="Confirm delete" action={deleteRole.bind(null, id)} />
    </section>
  );
}
