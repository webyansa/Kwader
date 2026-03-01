
-- Add privacy settings columns to job_seeker_profiles
ALTER TABLE public.job_seeker_profiles
  ADD COLUMN IF NOT EXISTS allow_cv_public_view boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_cv_download boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_contact_requests boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS available_for_work boolean NOT NULL DEFAULT false;
