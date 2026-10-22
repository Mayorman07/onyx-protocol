export const SIGNUP_STATUSES = ["enlisted", "cast", "sent"] as const;

export type SignupStatus = (typeof SIGNUP_STATUSES)[number];

export function isSignupStatus(value: string): value is SignupStatus {
  return (SIGNUP_STATUSES as readonly string[]).includes(value);
}
