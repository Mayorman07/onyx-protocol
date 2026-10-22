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

export const ROLE_COLUMNS = ROLE_FIELDS.map((f) => f.name).join(", ");

export const EMPTY_ROLE = Object.fromEntries(ROLE_FIELDS.map((f) => [f.name, null])) as Role;

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
