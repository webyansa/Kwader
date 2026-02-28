
-- Add new columns to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vacancies integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS experience_years_min integer,
  ADD COLUMN IF NOT EXISTS experience_years_max integer,
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS salary_display text DEFAULT 'hidden',
  ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS screening_questions jsonb DEFAULT '[]';

-- Add new values to employment_type enum
ALTER TYPE public.employment_type ADD VALUE IF NOT EXISTS 'consultant';
ALTER TYPE public.employment_type ADD VALUE IF NOT EXISTS 'volunteer';

-- Add new value to experience_level enum
ALTER TYPE public.experience_level ADD VALUE IF NOT EXISTS 'leadership';
