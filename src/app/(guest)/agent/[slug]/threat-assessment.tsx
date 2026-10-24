import { TRAIT_MAX, traitLevels } from "./file-codes";

/** Decorative segmented readout of spy traits, derived from the codename. Flavour, not data. */
export function ThreatAssessment({ codename }: { codename: string }) {
  return (
    <section className="pf-threat" aria-label="Threat assessment (decorative)">
      <header className="pf-threat-head">
        <h2 className="pf-heading">
          Threat assessment
        </h2>
        <span>Analyst estimate · unverified</span>
      </header>
      <ul className="pf-meters">
        {traitLevels(codename).map(({ trait, level }) => (
          <li key={trait} className={trait === "Threat level" ? "is-threat" : undefined}>
            <span className="pf-meter-label">{trait}</span>
            <span className="pf-meter" role="img" aria-label={`${trait}: ${level} of ${TRAIT_MAX}`}>
              {Array.from({ length: TRAIT_MAX }, (_, i) => (
                <i key={i} className={i < level ? "on" : undefined} />
              ))}
            </span>
            <span className="pf-meter-value" aria-hidden="true">
              {level}/{TRAIT_MAX}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
