/** The fields that make up a role, shared by the library editor and the casting form. */
export const ROLE_FIELDS = [
  { name: "display_name", label: "Display name", required: true, long: false },
  { name: "codename", label: "Codename", required: true, long: false },
  { name: "archetype", label: "Archetype", required: false, long: true },
  { name: "cover_story", label: "Cover story", required: true, long: true },
  { name: "secret_motive", label: "Secret motive", required: true, long: true },
  { name: "ally", label: "Ally", required: false, long: false },
  { name: "rival", label: "Rival", required: false, long: false },
  { name: "storyline", label: "Storyline", required: false, long: true },
] as const;

export type RoleFieldName = (typeof ROLE_FIELDS)[number]["name"];
export type Role = Record<RoleFieldName, string | null>;

// Literal (not built from ROLE_FIELDS) so Supabase's select-string parser can type the result. Keep in sync.
export const ROLE_COLUMNS = "display_name, codename, archetype, cover_story, secret_motive, ally, rival, storyline";

export const EMPTY_ROLE = Object.fromEntries(ROLE_FIELDS.map((f) => [f.name, null])) as Role;

/** Copies just the role fields out of a larger row (a library role or a signup). */
export function toRole(row: Role): Role {
  return Object.fromEntries(ROLE_FIELDS.map((f) => [f.name, row[f.name]])) as Role;
}

const CODENAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHORT_MAX = 120;
const LONG_MAX = 4000;

/** Reads and validates role fields from a form. Codenames are lowercased before checking. */
export function parseRole(formData: FormData): { role: Role } | { error: string } {
  const role = { ...EMPTY_ROLE };

  for (const field of ROLE_FIELDS) {
    const raw = String(formData.get(field.name) ?? "").trim();
    const value = field.name === "codename" ? raw.toLowerCase() : raw;

    if (!value) {
      if (field.required) return { error: `${field.label} is required, agent.` };
      continue;
    }
    if (value.length > (field.long ? LONG_MAX : SHORT_MAX)) {
      return { error: `${field.label} is too long, agent.` };
    }
    role[field.name] = value;
  }

  if (!CODENAME_PATTERN.test(role.codename ?? "")) {
    return { error: "Codename must be lowercase letters, numbers and single hyphens, e.g. the-magpie." };
  }
  return { role };
}
