"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Role } from "../../role-fields";
import { RoleInputs } from "../../role-inputs";
import { saveRole, type RoleFormState } from "./actions";

const initialState: RoleFormState = {};

export function RoleForm({ id, values }: { id: string | null; values: Role }) {
  const [state, formAction, pending] = useActionState(saveRole.bind(null, id), initialState);

  return (
    <form action={formAction}>
      <RoleInputs values={values} />
      {state.error && (
        <p className="alert" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : id ? "Save role" : "Add role"}
      </button>
      <Link className="btn" href="/admin/library">
        Cancel
      </Link>
    </form>
  );
}
