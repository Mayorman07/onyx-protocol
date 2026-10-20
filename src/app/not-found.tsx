import Link from "next/link";

export default function NotFound() {
  return (
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
  );
}
