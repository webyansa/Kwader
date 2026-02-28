
-- Add username to job_seeker_profiles
ALTER TABLE public.job_seeker_profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS experiences jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS volunteering jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS hide_contact boolean NOT NULL DEFAULT true;

-- Create index on username for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_jsp_username ON public.job_seeker_profiles (username) WHERE username IS NOT NULL;

-- CV exports table
CREATE TABLE IF NOT EXISTS public.cv_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id text NOT NULL DEFAULT 'classic',
  file_url text,
  file_type text NOT NULL DEFAULT 'pdf',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cv_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cv exports"
  ON public.cv_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cv exports"
  ON public.cv_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all cv exports"
  ON public.cv_exports FOR SELECT
  USING (has_any_admin_role(auth.uid()));

-- Function to generate unique username from name
CREATE OR REPLACE FUNCTION public.generate_username(_full_name text, _user_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _base text;
  _candidate text;
  _counter int := 0;
BEGIN
  -- clean: lowercase, keep letters/numbers/hyphens
  _base := lower(trim(COALESCE(_full_name, '')));
  _base := regexp_replace(_base, '\s+', '-', 'g');
  _base := regexp_replace(_base, '[^a-z0-9\u0621-\u064a\-]', '', 'g');
  _base := trim(both '-' from _base);
  
  IF length(_base) < 2 THEN
    _base := 'user';
  END IF;
  
  _candidate := _base;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.job_seeker_profiles WHERE username = _candidate AND user_id != _user_id) THEN
      RETURN _candidate;
    END IF;
    _counter := _counter + 1;
    _candidate := _base || _counter::text;
  END LOOP;
END;
$$;
