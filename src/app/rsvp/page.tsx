import type { Metadata } from "next";
import Link from "next/link";
import { RsvpForm } from "./rsvp-form";

export const metadata: Metadata = {
  title: "Accept the Mission — The Onyx Protocol",
};

export default function RsvpPage() {
  return (
    <main>
      <section className="step show">
        <span className="tag">TOP SECRET</span>
        <p className="dim">{"// Confirmation of attendance"}</p>
        <h2>
          Accept the <span>Mission</span>
        </h2>
        <p>State your name and a secure line. Your cover identity and dossier will be issued immediately.</p>
        <RsvpForm />
        <p className="dim" style={{ marginTop: 22 }}>
          <Link className="inline" href="/">
            ← Return to briefing
          </Link>
        </p>
      </section>
    </main>
  );
}
