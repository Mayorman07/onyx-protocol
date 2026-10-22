"use client";

import { useState, useTransition } from "react";
import { deleteSignup, setSignupStatus } from "../actions";
import { SIGNUP_STATUSES, type SignupStatus } from "../statuses";

type Props = { id: string; name: string; status: SignupStatus };

/** Status dropdown and two-step delete for one signup row. Renders two table cells. */
export function SignupControls({ id, name, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <td data-label="Status">
        <select
          className="status-select"
          aria-label={`Status for ${name}`}
          defaultValue={status}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            startTransition(() => setSignupStatus(id, next));
          }}
        >
          {SIGNUP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="actions">
        {confirming ? (
          <>
            <button
              type="button"
              className="small danger"
              disabled={pending}
              onClick={() => startTransition(() => deleteSignup(id))}
            >
              {pending ? "Deleting…" : "Confirm delete"}
            </button>
            <button type="button" className="small" disabled={pending} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="small" aria-label={`Delete ${name}`} onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </td>
    </>
  );
}
