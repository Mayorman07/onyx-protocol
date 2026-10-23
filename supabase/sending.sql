-- Dossier sending: records when each cast guest was last emailed their dossier.
-- Run after casting.sql. Upgrades an existing database in place without losing rows. Safe to re-run.

alter table signups
  add column if not exists sent_at timestamptz;

-- Covered by the existing admin-only signups policies in admins.sql; no policy change needed.
