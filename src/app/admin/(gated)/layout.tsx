import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { signOut } from "../actions";

// Reads the session cookie, so render on request.
export const instant = false;

export const metadata: Metadata = {
  title: "Handler Terminal — The Onyx Protocol",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!session.isAdmin) {
    return (
      <main>
        <section className="step show">
          <span className="tag">DENIED</span>
          <p className="dim">{"// Handler terminal"}</p>
          <h2>
            Clearance <span>Revoked</span>
          </h2>
          <p>This terminal is not authorised.</p>
          <SignOut email={session.email} />
        </section>
      </main>
    );
  }

  return (
    <main className="wide">
      {children}
      <SignOut email={session.email} />
    </main>
  );
}

function SignOut({ email }: { email: string | null }) {
  return (
    <form action={signOut}>
      {email && <p className="dim plain">Signed in as {email}</p>}
      <button type="submit">Sign out</button>
    </form>
  );
}
