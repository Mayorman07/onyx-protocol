"use client";

import { useActionState, useState } from "react";
import { sendDossier, type SendDossierState } from "../actions";

type Props = {
  signupId: string;
  /** Only cast or sent guests (who have a slug) can be sent a dossier. */
  canSend: boolean;
  /** Server-formatted time of the last send, or null if never sent. */
  lastSent: string | null;
  /** The role was edited after the last send, so the guest's email is out of date. */
  editedSince: boolean;
};

const initialState: SendDossierState = {};

export function SendDossier({ signupId, canSend, lastSent, editedSince }: Props) {
  const [state, formAction, pending] = useActionState(sendDossier.bind(null, signupId), initialState);
  const [confirming, setConfirming] = useState(false);
  const alreadySent = lastSent !== null;

  return (
    <form action={formAction} onSubmit={() => setConfirming(false)}>
      {alreadySent && <p className="dim plain">Dossier last sent {lastSent}.</p>}
      {editedSince && (
        <p className="alert" role="status">
          ⚠ This role was edited after the dossier was sent. The guest&apos;s email may be out of date; re-send if the
          changes matter.
        </p>
      )}
      {!canSend && <p className="dim plain">Cast this guest before sending their dossier.</p>}

      {alreadySent && !confirming ? (
        <button type="button" disabled={!canSend || pending} onClick={() => setConfirming(true)}>
          Re-send dossier
        </button>
      ) : (
        <button type="submit" className={confirming ? "danger" : undefined} disabled={!canSend || pending}>
          {pending ? "Transmitting…" : confirming ? "Confirm re-send" : "Send dossier"}
        </button>
      )}
      {confirming && !pending && (
        <button type="button" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      )}

      {state.sent && !pending && (
        <p className="notice" role="status">
          Dossier transmitted.
        </p>
      )}
      {state.error && !pending && (
        <p className="alert" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
