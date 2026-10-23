/** True when a guest's role was edited after their dossier was last sent, so their email is out of date. */
export function editedSinceSent(sentAt: string | null, roleEditedAt: string | null): boolean {
  if (!sentAt || !roleEditedAt) return false;
  return new Date(roleEditedAt).getTime() > new Date(sentAt).getTime();
}
