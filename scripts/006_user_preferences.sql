-- 006_user_preferences.sql
-- Add personalisation columns to the user table for end-user onboarding

ALTER TABLE public."user"
  ADD COLUMN IF NOT EXISTS age_group            TEXT,            -- 'under_18' | '18_34' | '35_54' | '55_64' | '65_plus'
  ADD COLUMN IF NOT EXISTS font_size_pref       TEXT DEFAULT 'medium',  -- 'small' | 'medium' | 'large' | 'xlarge'
  ADD COLUMN IF NOT EXISTS high_contrast        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reduced_motion       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS screen_reader        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS color_blind_mode     TEXT DEFAULT 'none';    -- 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'

COMMENT ON COLUMN public."user".age_group        IS 'Self-reported age bracket for layout personalisation';
COMMENT ON COLUMN public."user".font_size_pref   IS 'Preferred reading font size';
COMMENT ON COLUMN public."user".high_contrast    IS 'User prefers high-contrast UI';
COMMENT ON COLUMN public."user".reduced_motion   IS 'User prefers reduced motion / no animations';
COMMENT ON COLUMN public."user".screen_reader    IS 'User indicates they use a screen reader';
COMMENT ON COLUMN public."user".color_blind_mode IS 'Colour-blindness accommodation mode';
