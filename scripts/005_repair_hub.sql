-- =============================================================================
-- Migration 005: Repair Hub Social Network
-- Adds: user profile fields, hub_posts, hub_comments, hub_likes,
--       hub_follows, hub_bookmarks, media columns on forum tables.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extend user table with profile fields
-- ---------------------------------------------------------------------------
ALTER TABLE public."user"
  ADD COLUMN IF NOT EXISTS username         TEXT,
  ADD COLUMN IF NOT EXISTS display_name     TEXT,
  ADD COLUMN IF NOT EXISTS bio              TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url       TEXT,
  ADD COLUMN IF NOT EXISTS location         TEXT,
  ADD COLUMN IF NOT EXISTS website_url      TEXT,
  ADD COLUMN IF NOT EXISTS repair_specialty TEXT[];   -- e.g. ['electronics', 'appliances']

-- Unique username index (sparse — allows NULL, only enforces uniqueness on non-null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON public."user"(username)
  WHERE username IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Hub posts (global feed)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hub_posts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT        NOT NULL,
  manual_id    UUID        REFERENCES public.manuals(id) ON DELETE SET NULL,  -- optional product tag
  body         TEXT        NOT NULL,
  media        JSONB       NOT NULL DEFAULT '[]',    -- [{type, url, name, size, mimeType}]
  link_url     TEXT,
  link_meta    JSONB,                                -- {title, description, image, domain}
  like_count   INT         NOT NULL DEFAULT 0,
  comment_count INT        NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_posts_user    ON public.hub_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_posts_manual  ON public.hub_posts(manual_id) WHERE manual_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hub_posts_created ON public.hub_posts(created_at DESC);

-- ---------------------------------------------------------------------------
-- Hub comments (nested: parent_id = NULL → top-level; parent_id set → reply)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hub_comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID        NOT NULL REFERENCES public.hub_posts(id) ON DELETE CASCADE,
  parent_id  UUID        REFERENCES public.hub_comments(id) ON DELETE CASCADE,
  user_id    TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  media      JSONB       NOT NULL DEFAULT '[]',
  like_count INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_comments_post   ON public.hub_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_hub_comments_parent ON public.hub_comments(parent_id) WHERE parent_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Hub likes  (posts + comments; polymorphic via target_type)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hub_likes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  target_type TEXT        NOT NULL CHECK (target_type IN ('post', 'comment', 'thread_reply')),
  target_id   UUID        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_hub_likes UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_likes_target ON public.hub_likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_hub_likes_user   ON public.hub_likes(user_id);

-- ---------------------------------------------------------------------------
-- Hub follows  (user → user)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hub_follows (
  follower_id   TEXT NOT NULL,
  following_id  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_follows_follower  ON public.hub_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_hub_follows_following ON public.hub_follows(following_id);

-- ---------------------------------------------------------------------------
-- Hub bookmarks  (posts only for now)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hub_bookmarks (
  user_id    TEXT NOT NULL,
  post_id    UUID NOT NULL REFERENCES public.hub_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_bookmarks_user ON public.hub_bookmarks(user_id);

-- ---------------------------------------------------------------------------
-- Extend forum_threads and forum_replies with media column
-- ---------------------------------------------------------------------------
ALTER TABLE public.forum_threads
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]';

ALTER TABLE public.forum_replies
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]';

-- ---------------------------------------------------------------------------
-- updated_at triggers for new tables
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TRIGGER trg_hub_posts_updated_at
    BEFORE UPDATE ON public.hub_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_hub_comments_updated_at
    BEFORE UPDATE ON public.hub_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

VACUUM ANALYZE;
