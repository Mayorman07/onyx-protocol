import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { ConfirmButton } from "../../../confirm-button";
import { ROLE_COLUMNS, toRole, type Role } from "../../../role-fields";
import type { SignupStatus } from "../../../statuses";
import { uncastSignup } from "../actions";
import { CastForm, type LibraryRole } from "./cast-form";

// Reads the session cookie, so render on request.
export const instant = false;

type CastSignup = Role & { id: string; name: string; email: string; status: SignupStatus; slug: string | null };

export default async function CastPage({ params }: PageProps<"/admin/cast/[id]">) {
  const session = await getAdminSession();
  if (!session?.isAdmin) return null;

  const { id } = await params;
  if (!isUuid(id)) notFound();

  // Authenticated client throughout: RLS limits every query to admins.
  const supabase = await createClient();
  const [signupResult, libraryResult, takenResult] = await Promise.all([
    supabase.from("signups").select(`id, name, email, status, slug, ${ROLE_COLUMNS}`).eq("id", id).maybeSingle(),
    supabase.from("dossiers").select(`id, ${ROLE_COLUMNS}`).order("display_name"),
    supabase.from("signups").select("codename").in("status", ["cast", "sent"]).neq("id", id),
  ]);

  const failure = signupResult.error ?? libraryResult.error ?? takenResult.error;
  if (failure) throw new Error(`Casting lookup failed: ${failure.message}`);

  const signup = signupResult.data as CastSignup | null;
  if (!signup) notFound();

  const library = (libraryResult.data ?? []) as LibraryRole[];
  const taken = ((takenResult.data ?? []) as { codename: string | null }[]).flatMap((r) => r.codename ?? []);
  const isCast = signup.status !== "enlisted";

  return (
    <section className="step show">
      <span className="tag">TOP SECRET</span>
      <p className="dim">{"// Casting"}</p>
      <h2>
        Cast <span>{signup.name}</span>
      </h2>

      <div className="row">
        <b>Email</b>
        <span>{signup.email}</span>
      </div>
      <div className="row">
        <b>Status</b>
        <span>{signup.status}</span>
      </div>
      <div className="row">
        <b>Role</b>
        <span>{signup.codename ?? "Not yet cast"}</span>
      </div>
      {signup.slug && (
        <div className="row">
          <b>Dossier</b>
          <a className="inline" href={`/agent/${signup.slug}`} target="_blank" rel="noopener">
            /agent/{signup.slug}
          </a>
        </div>
      )}

      {/* Remount the form when the saved role changes (cast, re-cast, un-cast) so it shows the stored values. */}
      <CastForm
        key={`${signup.status}:${signup.slug ?? ""}`}
        signupId={signup.id}
        initialValues={toRole(signup)}
        library={library}
        taken={taken}
      />

      <hr className="divider" />
      {/* TODO(resend): send dossier email — this button will email the guest their /agent/[slug] link. */}
      <button type="button" disabled title="Coming next: email sending">
        Send dossier (coming next)
      </button>
      {isCast && (
        <ConfirmButton label="Un-cast guest" confirmLabel="Confirm un-cast" action={uncastSignup.bind(null, signup.id)} />
      )}
      <p className="dim plain">
        Un-casting returns the guest to enlisted, clears their role, frees the codename and retires their dossier
        link.
      </p>
      <Link className="btn" href="/admin">
        ← Back to signups
      </Link>
    </section>
  );
}
