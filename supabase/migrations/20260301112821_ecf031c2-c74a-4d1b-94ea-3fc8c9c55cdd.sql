-- Normalize privacy values to canonical lowercase
UPDATE public.job_seeker_profiles
SET privacy = CASE
  WHEN lower(privacy) IN ('public') THEN 'public'
  WHEN lower(privacy) IN ('unlisted', 'link_only') THEN 'link_only'
  WHEN lower(privacy) IN ('private', 'hidden') THEN 'hidden'
  ELSE 'public'
END;

-- Keep only URL-safe usernames (invalid ones become null until user picks one)
UPDATE public.job_seeker_profiles
SET username = NULL
WHERE username IS NOT NULL
  AND username !~ '^[a-z0-9_]{3,30}$';

-- Case-insensitive unique username (only for non-empty usernames)
CREATE UNIQUE INDEX IF NOT EXISTS job_seeker_profiles_username_unique_idx
ON public.job_seeker_profiles (lower(username))
WHERE username IS NOT NULL AND username <> '';

-- Validate username format for future writes
ALTER TABLE public.job_seeker_profiles
DROP CONSTRAINT IF EXISTS job_seeker_profiles_username_format_check;

ALTER TABLE public.job_seeker_profiles
ADD CONSTRAINT job_seeker_profiles_username_format_check
CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,30}$');

-- Validate privacy values for future writes
ALTER TABLE public.job_seeker_profiles
DROP CONSTRAINT IF EXISTS job_seeker_profiles_privacy_values_check;

ALTER TABLE public.job_seeker_profiles
ADD CONSTRAINT job_seeker_profiles_privacy_values_check
CHECK (privacy IN ('public', 'link_only', 'hidden'));