import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

/** Frame for every guest-facing page: the theme stamp and the classified-document chrome. Never used in admin. */
export function GuestShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="doc-bar">
        <ThemeToggle />
      </header>
      {children}
    </>
  );
}
