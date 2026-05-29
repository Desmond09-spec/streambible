-- ==============================================================================
-- STREAMBIBLE DUAL: Onboarding Modal Update
-- Adds 'has_onboarded' to track if a user has seen the New User welcome tour
-- ==============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT FALSE;

ALTER TABLE public.bible_cache
ADD COLUMN IF NOT EXISTS fums TEXT;
