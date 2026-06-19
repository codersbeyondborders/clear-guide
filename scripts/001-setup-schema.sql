-- =============================================================================
-- ClearGuide - Full Database Schema
-- AWS Aurora PostgreSQL 16
-- Run once; safe to re-run (IF NOT EXISTS / IF NOT EXISTS guards throughout)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- ---------------------------------------------------------------------------
-- Enum Types
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE manual_status AS ENUM ('draft', 'processing', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE chat_role AS ENUM ('user', 'assistant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE view_mode AS ENUM ('web', 'ar', 'qr', 'direct');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- Better Auth Tables (public schema)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "user" (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL DEFAULT '',
  email           TEXT        NOT NULL,
  "emailVerified" BOOLEAN     NOT NULL DEFAULT false,
  image           TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS "session" (
  id            TEXT        PRIMARY KEY,
  "expiresAt"   TIMESTAMPTZ NOT NULL,
  token         TEXT        NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "userId"      TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT uq_session_token UNIQUE (token)
);

CREATE TABLE IF NOT EXISTS "account" (
  id                    TEXT        PRIMARY KEY,
  "accountId"           TEXT        NOT NULL,
  "providerId"          TEXT        NOT NULL,
  "userId"              TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken"         TEXT,
  "refreshToken"        TEXT,
  "idToken"             TEXT,
  "accessTokenExpiresAt"  TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope                 TEXT,
  password              TEXT,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_account_provider UNIQUE ("providerId", "accountId")
);

CREATE TABLE IF NOT EXISTS "verification" (
  id         TEXT        PRIMARY KEY,
  identifier TEXT        NOT NULL,
  value      TEXT        NOT NULL,
  "expiresAt"  TIMESTAMPTZ NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Better Auth indexes
CREATE INDEX IF NOT EXISTS idx_session_user_id   ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON "session"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_account_user_id    ON "account"("userId");
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);


-- ---------------------------------------------------------------------------
-- App: manuals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS manuals (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT          NOT NULL,           -- scoped to auth user; no FK (see GUIDE)
  product_name        VARCHAR(255)  NOT NULL,
  product_model       VARCHAR(255),
  brand               VARCHAR(255),
  description         TEXT,
  serial_number       VARCHAR(255),
  status              manual_status NOT NULL DEFAULT 'draft',
  languages           TEXT[]        NOT NULL DEFAULT '{}',
  cover_image         TEXT,                             -- alias: thumbnail_url in queries
  upload_method       VARCHAR(50),                      -- 'upload' | 'manual'
  original_file_url   TEXT,                             -- Blob pathname of the source file
  deleted_at          TIMESTAMPTZ,                      -- soft delete
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Composite indexes for common dashboard query patterns
CREATE INDEX IF NOT EXISTS idx_manuals_user_status
  ON manuals(user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_manuals_user_created
  ON manuals(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_manuals_status
  ON manuals(status)
  WHERE deleted_at IS NULL;

-- Partial index for full-text search on product name
CREATE INDEX IF NOT EXISTS idx_manuals_product_name_text
  ON manuals USING gin(to_tsvector('english', product_name))
  WHERE deleted_at IS NULL;


-- ---------------------------------------------------------------------------
-- App: manual_sections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS manual_sections (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id      UUID        NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  section_number SMALLINT    NOT NULL CHECK (section_number >= 0),
  title          VARCHAR(500) NOT NULL,
  content        TEXT,
  image_urls     TEXT[]      NOT NULL DEFAULT '{}',
  video_urls     TEXT[]      NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_section_order UNIQUE (manual_id, section_number)
);

CREATE INDEX IF NOT EXISTS idx_sections_manual_id
  ON manual_sections(manual_id);

CREATE INDEX IF NOT EXISTS idx_sections_manual_order
  ON manual_sections(manual_id, section_number ASC);


-- ---------------------------------------------------------------------------
-- App: translations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS translations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id           UUID        NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  section_id          UUID        NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  language            VARCHAR(10) NOT NULL,  -- BCP-47 (e.g. 'fr', 'es', 'zh-CN')
  translated_content  TEXT        NOT NULL,
  generated_at        TIMESTAMPTZ,                      -- set when AI translation completes
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_translation UNIQUE (manual_id, section_id, language)
);

CREATE INDEX IF NOT EXISTS idx_translations_manual_id
  ON translations(manual_id);

CREATE INDEX IF NOT EXISTS idx_translations_section_language
  ON translations(section_id, language);


-- ---------------------------------------------------------------------------
-- App: manual_knowledge_base  (AI RAG context; one row per manual)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS manual_knowledge_base (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id      UUID        NOT NULL,
  chunks         JSONB       NOT NULL DEFAULT '[]',   -- [{text, embedding_id, section_id}]
  model_version  VARCHAR(100),
  indexed_at     TIMESTAMPTZ,
  built_at       TIMESTAMPTZ,                         -- set when AI knowledge base is built
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_kb_manual UNIQUE (manual_id)
);

CREATE INDEX IF NOT EXISTS idx_kb_manual_id ON manual_knowledge_base(manual_id);


-- ---------------------------------------------------------------------------
-- App: analytics  (RANGE partitioned by viewed_at — monthly)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics (
  id                   UUID        NOT NULL DEFAULT gen_random_uuid(),
  manual_id            UUID        NOT NULL,
  user_session_id      TEXT        NOT NULL,
  mode                 view_mode   NOT NULL DEFAULT 'web',
  time_spent_seconds   INT         NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  viewed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (viewed_at);

-- Seed partitions: current quarter + next quarter
DO $$
DECLARE
  y INT := EXTRACT(YEAR FROM NOW())::INT;
  m INT;
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  FOR m IN 1..12 LOOP
    partition_name := format('analytics_%s_%s', y, LPAD(m::TEXT, 2, '0'));
    start_date := make_date(y, m, 1);
    end_date   := start_date + INTERVAL '1 month';
    IF NOT EXISTS (
      SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF analytics FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
      );
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_analytics_manual_viewed
  ON analytics(manual_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_session
  ON analytics(user_session_id);


-- ---------------------------------------------------------------------------
-- App: ai_chat_history  (RANGE partitioned by created_at — monthly)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id               UUID        NOT NULL DEFAULT gen_random_uuid(),
  manual_id        UUID        NOT NULL,
  user_session_id  TEXT        NOT NULL,
  role             chat_role   NOT NULL,
  message          TEXT        NOT NULL,
  token_count      INT         NOT NULL DEFAULT 0 CHECK (token_count >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Seed partitions for current year
DO $$
DECLARE
  y INT := EXTRACT(YEAR FROM NOW())::INT;
  m INT;
  partition_name TEXT;
  start_date DATE;
  end_date   DATE;
BEGIN
  FOR m IN 1..12 LOOP
    partition_name := format('ai_chat_history_%s_%s', y, LPAD(m::TEXT, 2, '0'));
    start_date := make_date(y, m, 1);
    end_date   := start_date + INTERVAL '1 month';
    IF NOT EXISTS (
      SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF ai_chat_history FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
      );
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_manual_session_time
  ON ai_chat_history(manual_id, user_session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_session
  ON ai_chat_history(user_session_id);


-- ---------------------------------------------------------------------------
-- updated_at auto-update trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_session_updated_at
    BEFORE UPDATE ON "session"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_account_updated_at
    BEFORE UPDATE ON "account"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_manuals_updated_at
    BEFORE UPDATE ON manuals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_sections_updated_at
    BEFORE UPDATE ON manual_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_translations_updated_at
    BEFORE UPDATE ON translations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_kb_updated_at
    BEFORE UPDATE ON manual_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- VACUUM ANALYZE (update planner statistics after schema creation)
-- ---------------------------------------------------------------------------
VACUUM ANALYZE;
