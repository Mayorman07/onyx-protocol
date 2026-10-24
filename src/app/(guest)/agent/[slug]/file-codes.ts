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

/** Small seeded PRNG (mulberry32): a repeatable stream of numbers in [0, 1) for a given seed. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TRAITS = ["Cunning", "Loyalty", "Deception", "Influence", "Threat level"] as const;
export const TRAIT_MAX = 5;

/**
 * Profile shapes an agent can have: at most one 5, always a low (1 or 2), and at most one
 * repeated value, so every readout has a clear strength and a clear weakness.
 */
const PROFILES = [
  [5, 4, 3, 2, 1],
  [5, 4, 3, 1, 1],
  [5, 3, 3, 2, 1],
  [5, 4, 2, 2, 1],
  [4, 4, 3, 2, 1],
] as const;

/**
 * Each trait's level out of 5. The codename picks a profile shape and then deals its values
 * across the traits in a shuffled order, so agents differ in both shape and which trait leads.
 */
export function traitLevels(codename: string): { trait: (typeof TRAITS)[number]; level: number }[] {
  const random = seededRandom(hash(`traits:${codename}`));
  const levels: number[] = [...PROFILES[Math.floor(random() * PROFILES.length)]];

  // Fisher–Yates shuffle driven by the seeded stream.
  for (let i = levels.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [levels[i], levels[j]] = [levels[j], levels[i]];
  }
  return TRAITS.map((trait, i) => ({ trait, level: levels[i] }));
}
