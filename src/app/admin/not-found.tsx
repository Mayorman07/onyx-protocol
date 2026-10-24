import Link from "next/link";

// Admin keeps its plain dark look: no guest theme toggle or document chrome.
export default function AdminNotFound() {
  return (
    <main>
      <section className="step show">
        <span className="tag">REDACTED</span>
        <p className="dim">{"// Error 404 · File not found"}</p>
        <h2>
          No such <span>record</span>
        </h2>
        <p>That record doesn&apos;t exist, or it has been deleted.</p>
        <Link className="btn" href="/admin">
          Back to signups
        </Link>
      </section>
    </main>
  );
}
