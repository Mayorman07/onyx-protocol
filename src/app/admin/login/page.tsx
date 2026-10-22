import type { Metadata } from "next";
import { LoginForm } from "./login-form";

// Reads searchParams on the server, so render on request.
export const instant = false;

export const metadata: Metadata = {
  title: "Handler Access — The Onyx Protocol",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;

  return (
    <main>
      <section className="step show">
        <span className="tag">RESTRICTED</span>
        <p className="dim">{"// Handler terminal"}</p>
        <LoginForm linkFailed={error === "link"} />
      </section>
    </main>
  );
}
