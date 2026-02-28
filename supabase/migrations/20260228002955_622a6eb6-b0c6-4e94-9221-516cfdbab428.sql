
ALTER TABLE public.job_seeker_profiles
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS certifications text,
  ADD COLUMN IF NOT EXISTS job_preferences jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;
