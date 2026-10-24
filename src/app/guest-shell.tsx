import type { ReactNode } from "react";
import { Barcode } from "./barcode";
import { ThemeToggle } from "./theme-toggle";

const DOCUMENT_ID = "ONX-30/1107";

/** Frame for every guest-facing page: the theme stamp and the classified-document chrome. Never used in admin. */
export function GuestShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="doc-bar">
        <p className="doc-class">
          <span>Top secret // Noforn</span> <span>Eyes only — do not copy</span>
        </p>
        <ThemeToggle />
      </header>

      {children}

      <footer className="doc-foot">
        <div className="clearance" aria-label="Security clearance: level 30 access">
          <span>Clearance</span>
          <b>Level 30</b>
          <span>Access</span>
        </div>
        <div className="doc-id">
          <Barcode value={DOCUMENT_ID} />
          <span>Doc {DOCUMENT_ID}</span>
        </div>
        <p className="doc-class">
          <span>Top secret // Noforn</span> <span>Handle via Onyx channels only</span>
        </p>
      </footer>
    </>
  );
}
