-- =============================================================================
-- Migration 007: Company accounts, roles, output formats, review workflow
-- Safe to re-run (IF NOT EXISTS guards throughout)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUM: company member roles
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE company_role AS ENUM ('owner','admin','manager','creator','viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('pending','active','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id TEXT        NOT NULL,
  name          VARCHAR(200) NOT NULL,
  slug          VARCHAR(100) NOT NULL,
  logo_url      TEXT,
  industry      VARCHAR(100),
  website       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_company_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_user_id);

-- ---------------------------------------------------------------------------
-- company_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_members (
  company_id  UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     TEXT          NOT NULL,
  role        company_role  NOT NULL DEFAULT 'viewer',
  status      member_status NOT NULL DEFAULT 'pending',
  invited_by  TEXT,
  invited_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  PRIMARY KEY (company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_members_user_id ON company_members(user_id);

-- ---------------------------------------------------------------------------
-- company_invitations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_invitations (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email       TEXT          NOT NULL,
  role        company_role  NOT NULL DEFAULT 'creator',
  token       UUID          NOT NULL DEFAULT gen_random_uuid(),
  invited_by  TEXT          NOT NULL,
  expires_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  CONSTRAINT uq_invitation_token UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_invitations_company ON company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email   ON company_invitations(email);

-- ---------------------------------------------------------------------------
-- manuals: add company_id + output_formats + review fields
-- ---------------------------------------------------------------------------
ALTER TABLE manuals
  ADD COLUMN IF NOT EXISTS company_id      UUID REFERENCES companies(id),
  ADD COLUMN IF NOT EXISTS output_formats  TEXT[] NOT NULL DEFAULT '{web}',
  ADD COLUMN IF NOT EXISTS review_notes    TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by     TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at     TIMESTAMPTZ;

-- Extend the manual_status enum to include 'review'
DO $$ BEGIN
  ALTER TYPE manual_status ADD VALUE IF NOT EXISTS 'review';
EXCEPTION WHEN others THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_manuals_company ON manuals(company_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Trigger for companies.updated_at
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
