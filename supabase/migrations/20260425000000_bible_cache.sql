-- Create bible_cache table
CREATE TABLE IF NOT EXISTS public.bible_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reference text NOT NULL,
  version_id text NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours') NOT NULL,
  UNIQUE(reference, version_id)
);

-- Enable RLS (Row Level Security) but allow our Edge Function (Service Role) to bypass it
ALTER TABLE public.bible_cache ENABLE ROW LEVEL SECURITY;

-- Optional: Allow public read access if needed, but we recommend fetching through the Edge Function
-- CREATE POLICY "Allow public read access on bible_cache" ON public.bible_cache FOR SELECT USING (true);
