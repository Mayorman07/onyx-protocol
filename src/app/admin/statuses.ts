export const SIGNUP_STATUSES = ["enlisted", "cast", "sent"] as const;

export type SignupStatus = (typeof SIGNUP_STATUSES)[number];

/** A guest who holds a role can only move between these; going back to enlisted is the Un-cast action. */
export const CAST_STATUSES = ["cast", "sent"] as const satisfies readonly SignupStatus[];

export function isSignupStatus(value: string): value is SignupStatus {
  return (SIGNUP_STATUSES as readonly string[]).includes(value);
}
