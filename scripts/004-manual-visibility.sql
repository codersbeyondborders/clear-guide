-- =============================================================================
-- ClearGuide - Migration 004: Manual public/private visibility flag
-- Adds an explicit is_public flag so manufacturers can list a published manual
-- in the public Products Forum (true) or keep it reachable only via its direct
-- QR link (false). Safe to re-run.
-- =============================================================================

ALTER TABLE manuals
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- Index to speed up the public listing query (published + public + not deleted)
CREATE INDEX IF NOT EXISTS idx_manuals_public_listing
  ON manuals(is_public, status, updated_at DESC)
  WHERE deleted_at IS NULL;
