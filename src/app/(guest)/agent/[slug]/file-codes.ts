// Deterministic flavour derived from a codename: the same agent always gets the same values.
// Decorative only; nothing here is stored or entered.

/** 32-bit FNV-1a hash. Stable across runs and platforms. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A file number like "ONX-30-4821". */
export function fileNumber(codename: string): string {
  return `ONX-30-${String(hash(`file:${codename}`) % 10000).padStart(4, "0")}`;
}

export const TRAITS = ["Cunning", "Loyalty", "Deception", "Influence", "Threat level"] as const;
export const TRAIT_MAX = 5;

/** Each trait's level, 2–5 out of 5, seeded by the codename and the trait name. */
export function traitLevels(codename: string): { trait: (typeof TRAITS)[number]; level: number }[] {
  return TRAITS.map((trait) => ({ trait, level: 2 + (hash(`${trait}:${codename}`) % 4) }));
}
