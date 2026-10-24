import { Barcode } from "../../../barcode";

// A cast guest's own copy of their role, stored on their signup row.
export type Dossier = {
  codename: string | null;
  display_name: string | null;
  archetype: string | null;
  cover_story: string | null;
  secret_motive: string | null;
  ally: string | null;
  rival: string | null;
  storyline: string | null;
};

function Silhouette() {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <circle cx="40" cy="36" r="17" fill="currentColor" />
      <path d="M8 100c0-25 14-36 32-36s32 11 32 36z" fill="currentColor" />
    </svg>
  );
}

/** Faint concentric ridges, like a lifted print. Purely decorative. */
function Fingerprint() {
  const ridges = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg className="fingerprint" viewBox="0 0 120 150" aria-hidden="true">
      {ridges.map((i) => (
        <ellipse
          key={i}
          cx="60"
          cy={78 - i * 1.5}
          rx={8 + i * 6}
          ry={11 + i * 7.5}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeDasharray={i % 3 === 0 ? "none" : `${18 + i * 4} ${3 + (i % 2) * 4}`}
        />
      ))}
    </svg>
  );
}

/** The dossier as a case file. Decoration sits around the content and never covers it. */
export function CaseFile({ dossier, slug }: { dossier: Dossier; slug: string }) {
  // Only show what the host has filled in.
  const fields = (
    [
      ["Archetype", dossier.archetype],
      ["Cover story", dossier.cover_story],
      ["Secret motive", dossier.secret_motive],
      ["Ally", dossier.ally],
      ["Rival", dossier.rival],
      ["Storyline", dossier.storyline],
    ] satisfies [string, string | null][]
  ).filter((field): field is [string, string] => Boolean(field[1]));

  return (
    <section className="step show case-file">
      <Fingerprint />

      <div className="case-head">
        <figure className="subject-photo">
          <div className="subject-frame">
            <Silhouette />
          </div>
          <span className="case-stamp" aria-hidden="true">
            Classified
          </span>
          <figcaption>Subject · photo withheld</figcaption>
        </figure>
        <div className="case-meta">
          <span className="tag">TOP SECRET</span>
          <p className="dim">{"// Operative dossier"}</p>
          {dossier.codename && (
            <p className="case-ref">
              File <b>{dossier.codename}</b>
            </p>
          )}
          <p className="case-ref">
            Status <b>Active</b>
          </p>
        </div>
      </div>

      <h1 className="case-name">{dossier.display_name ?? "Classified"}</h1>

      {fields.map(([label, value]) => (
        <div className="row stacked" key={label}>
          <b>{label}</b>
          <span>{value}</span>
        </div>
      ))}

      <div className="case-foot">
        <div className="doc-id">
          <Barcode value={slug} />
          <span>File ref {dossier.codename ?? "classified"}</span>
        </div>
      </div>

      <p className="stamp case-sign-off">Commit this to memory. Trust no one.</p>
    </section>
  );
}
