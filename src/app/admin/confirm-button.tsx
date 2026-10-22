"use client";

import { useState, useTransition } from "react";

type Props = { label: string; confirmLabel: string; action: () => Promise<void> };

/** A destructive button that asks for a second click before running its action. */
export function ConfirmButton({ label, confirmLabel, action }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className="danger" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }

  return (
    <>
      <button type="button" className="danger" disabled={pending} onClick={() => startTransition(action)}>
        {pending ? "Working…" : confirmLabel}
      </button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </>
  );
}
