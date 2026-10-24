import Link from "next/link";
import { GuestShell } from "./guest-shell";

// Unknown URLs and unknown dossier slugs land here, so it wears the guest theme.
export default function NotFound() {
  return (
    <GuestShell>
      <main>
        <section className="step show">
          <span className="tag">REDACTED</span>
          <p className="dim">{"// Error 404 · File not found"}</p>
          <h2>
            No such <span>operative</span>
          </h2>
          <p>This dossier does not exist — or it has already been burned. Check your codename with your handler.</p>
          <Link className="btn" href="/">
            Return to briefing
          </Link>
        </section>
      </main>
    </GuestShell>
  );
}
