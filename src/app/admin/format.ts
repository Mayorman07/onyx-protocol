const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});

/** Formats a timestamp for the admin screens, in UK time. Format on the server to avoid hydration mismatches. */
export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}
