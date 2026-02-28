
-- Add job_seeker to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'job_seeker';

-- Add status column to profiles for account suspension
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Update has_any_admin_role to be consistent
-- (already correct, includes super_admin, admin, moderator)
