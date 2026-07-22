-- =============================================================================
-- Migration 003: Community — Product Reviews & Forum Threads
-- =============================================================================

-- Add user_type to end-user records (manufacturers already exist; default 'end_user' for new rows)
ALTER TABLE public."user"
  ADD COLUMN IF NOT EXISTS user_type text NOT NULL DEFAULT 'end_user';

-- Mark all existing users as manufacturers (they signed up via the manufacturer flow)
UPDATE public."user"
  SET user_type = 'manufacturer'
  WHERE user_type = 'end_user';

-- Product reviews (one per user per manual)
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id     uuid        NOT NULL REFERENCES public.manuals(id) ON DELETE CASCADE,
  user_id       text        NOT NULL,
  rating        smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         text,
  body          text        NOT NULL,
  helpful_count int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_manual_id ON public.product_reviews(manual_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reviews_user_manual ON public.product_reviews(manual_id, user_id);

-- Forum threads
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id   uuid        NOT NULL REFERENCES public.manuals(id) ON DELETE CASCADE,
  user_id     text        NOT NULL,
  title       text        NOT NULL,
  body        text        NOT NULL,
  is_pinned   boolean     NOT NULL DEFAULT false,
  is_solved   boolean     NOT NULL DEFAULT false,
  reply_count int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_manual_id ON public.forum_threads(manual_id);

-- Forum replies
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid        NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id     text        NOT NULL,
  body        text        NOT NULL,
  is_solution boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON public.forum_replies(thread_id);
