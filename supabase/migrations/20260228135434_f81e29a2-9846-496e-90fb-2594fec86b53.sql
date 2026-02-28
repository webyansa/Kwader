
-- Add missing columns to applications table for talent/guest apply support
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS applicant_type text NOT NULL DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS talent_user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS city text NULL,
  ADD COLUMN IF NOT EXISTS screening_answers jsonb NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS organization_id uuid NULL;

-- Backfill organization_id from jobs for existing applications
UPDATE public.applications a
SET organization_id = j.org_id
FROM public.jobs j
WHERE a.job_id = j.id AND a.organization_id IS NULL;

-- Add RLS policy: Talents can view their own applications
CREATE POLICY "Talents view own applications"
ON public.applications
FOR SELECT
USING (auth.uid() = talent_user_id);
