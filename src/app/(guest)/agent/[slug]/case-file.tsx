import { Barcode } from "../../../barcode";
import { fileNumber } from "./file-codes";
import { ThreatAssessment } from "./threat-assessment";

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
    <svg className="pf-silhouette" viewBox="0 0 80 100" aria-hidden="true">
      <circle cx="40" cy="36" r="17" fill="currentColor" />
      <path d="M8 100c0-25 14-36 32-36s32 11 32 36z" fill="currentColor" />
    </svg>
  );
}

/** Faint concentric ridges, like a lifted print. Purely decorative. */
function Fingerprint() {
  const ridges = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg className="pf-fingerprint" viewBox="0 0 120 150" aria-hidden="true">
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

function Section({ label, children }: { label: string; children: string }) {
  return (
    <section className="pf-section">
      <h2 className="pf-heading">{label}</h2>
      <p>{children}</p>
    </section>
  );
}

/**
 * The dossier as a classified PERSONAL FILE. Decoration lives in the frame and margins;
 * the guest's real role text is never covered, redacted or obscured.
 */
export function CaseFile({ dossier, slug }: { dossier: Dossier; slug: string }) {
  const codename = dossier.codename ?? slug;
  const fileNo = fileNumber(codename);

  return (
    <article className="step show personal-file">
      <header className="pf-band">
        <div className="pf-band-text">
          <span className="tag">TOP SECRET</span>
          <p className="pf-label">
            <b>Personal file</b>
            <span>
              Operative dossier · <span className="nowrap">File no. {fileNo}</span>
            </span>
          </p>
        </div>
        <span className="pf-stamp" aria-hidden="true">
          Classified
        </span>
      </header>

      <div className="pf-top">
        <figure className="pf-photo">
          <div className="pf-frame">
            <Silhouette />
            <Fingerprint />
            <span className="pf-withheld" aria-hidden="true">
              Withheld
            </span>
          </div>
          <figcaption>Subject photograph · withheld</figcaption>
        </figure>

        <div className="pf-data">
          <p className="pf-key">Codename</p>
          <h1 className="pf-codename">{codename}</h1>
          <dl className="pf-meta">
            {dossier.display_name && (
              <div>
                <dt>Alias</dt>
                <dd>{dossier.display_name}</dd>
              </div>
            )}
            {dossier.archetype && (
              <div>
                <dt>Archetype</dt>
                <dd>{dossier.archetype}</dd>
              </div>
            )}
            <div>
              <dt>File no.</dt>
              <dd>{fileNo}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Active</dd>
            </div>
            <div>
              {/* Flavour only: a permanently redacted line, never real role content. */}
              <dt>Handler</dt>
              <dd>
                <span className="redact-bar" role="img" aria-label="Redacted" />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ThreatAssessment codename={codename} />

      {/* The real role content. Empty optional fields are omitted. */}
      <div className="pf-body">
        {dossier.cover_story && <Section label="Cover story">{dossier.cover_story}</Section>}
        {dossier.secret_motive && <Section label="Secret motive">{dossier.secret_motive}</Section>}
        {(dossier.ally || dossier.rival) && (
          <div className="pf-pair">
            {dossier.ally && <Section label="Ally">{dossier.ally}</Section>}
            {dossier.rival && <Section label="Rival">{dossier.rival}</Section>}
          </div>
        )}
        {dossier.storyline && <Section label="Storyline">{dossier.storyline}</Section>}
      </div>

      <p className="stamp pf-sign-off">Commit this to memory. Trust no one.</p>

      <footer className="pf-foot">
        <Barcode value={slug} />
        <p className="pf-foot-text">
          <span>File no. {fileNo}</span>
          <span>Do not duplicate</span>
        </p>
      </footer>
    </article>
  );
}
