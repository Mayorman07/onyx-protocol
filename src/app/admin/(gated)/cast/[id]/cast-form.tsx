"use client";

import { useActionState, useState } from "react";
import { toRole, type Role } from "../../../role-fields";
import { RoleInputs } from "../../../role-inputs";
import { castSignup, type CastFormState } from "../actions";

export type LibraryRole = Role & { id: string };

type Props = {
  signupId: string;
  initialValues: Role;
  library: LibraryRole[];
  /** Codenames held by other cast or sent guests. */
  taken: string[];
};

const initialState: CastFormState = {};

export function CastForm({ signupId, initialValues, library, taken }: Props) {
  const [state, formAction, pending] = useActionState(castSignup.bind(null, signupId), initialState);
  const [values, setValues] = useState(initialValues);
  // Bumped on each pick so the uncontrolled inputs remount with the copied values.
  const [version, setVersion] = useState(0);

  function pickRole(roleId: string) {
    const role = library.find((r) => r.id === roleId);
    if (!role) return;
    setValues(toRole(role));
    setVersion((v) => v + 1);
  }

  return (
    <form action={formAction}>
      <label className="field">
        <span>Copy from library</span>
        <select defaultValue="" onChange={(e) => pickRole(e.target.value)}>
          <option value="" disabled>
            Choose a role…
          </option>
          {library.map((role) => {
            const isTaken = taken.includes(role.codename ?? "");
            return (
              <option key={role.id} value={role.id} disabled={isTaken}>
                {role.display_name}
                {isTaken ? " (taken)" : ""}
              </option>
            );
          })}
        </select>
      </label>
      <p className="dim plain">Picking a role copies it below. Edit anything for this guest before saving.</p>

      <RoleInputs key={version} values={values} />

      {state.error && (
        <p className="alert" role="alert">
          {state.error}
        </p>
      )}
      {state.saved && !pending && (
        <p className="notice" role="status">
          Casting saved. The dossier is live at the link above.
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save casting"}
      </button>
    </form>
  );
}
