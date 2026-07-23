-- =============================================================================
-- Migration 008: Extended analytics events table
-- Safe to re-run (IF NOT EXISTS guards)
-- =============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id           UUID        NOT NULL DEFAULT gen_random_uuid(),
  manual_id    UUID        NOT NULL,
  session_id   TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,   -- scroll | section_view | ai_chat | link_click | download | share
  section_id   UUID,                   -- nullable FK to manual_sections
  payload      JSONB       NOT NULL DEFAULT '{}',
  -- demography (nullable — guests have no profile data)
  user_id      TEXT,
  age_group    TEXT,
  country_code TEXT,
  device_type  TEXT,                   -- mobile | tablet | desktop
  lang         TEXT,
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (viewed_at);

-- Seed monthly partitions for current year
DO $$
DECLARE
  y INT := EXTRACT(YEAR FROM NOW())::INT;
  m INT;
  partition_name TEXT;
  start_date DATE;
  end_date   DATE;
BEGIN
  FOR m IN 1..12 LOOP
    partition_name := format('analytics_events_%s_%s', y, LPAD(m::TEXT, 2, '0'));
    start_date := make_date(y, m, 1);
    end_date   := start_date + INTERVAL '1 month';
    IF NOT EXISTS (
      SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF analytics_events FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
      );
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_ae_manual_viewed
  ON analytics_events(manual_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ae_session
  ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_ae_event_type
  ON analytics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_ae_device
  ON analytics_events(device_type);

CREATE INDEX IF NOT EXISTS idx_ae_country
  ON analytics_events(country_code);
