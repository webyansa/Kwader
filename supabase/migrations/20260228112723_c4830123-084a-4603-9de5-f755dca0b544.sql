
-- Create profile_status enum
CREATE TYPE public.profile_status AS ENUM ('draft', 'submitted', 'changes_requested', 'approved', 'rejected');

-- Add profile fields to organizations
ALTER TABLE public.organizations
  ADD COLUMN profile_status public.profile_status NOT NULL DEFAULT 'draft',
  ADD COLUMN short_description text,
  ADD COLUMN long_description text,
  ADD COLUMN vision text,
  ADD COLUMN mission text,
  ADD COLUMN org_values text[] DEFAULT '{}',
  ADD COLUMN programs text[] DEFAULT '{}',
  ADD COLUMN why_work_with_us text,
  ADD COLUMN work_environment text,
  ADD COLUMN benefits text[] DEFAULT '{}',
  ADD COLUMN supervisor_entity text,
  ADD COLUMN founding_year integer,
  ADD COLUMN work_scope text,
  ADD COLUMN media_images text[] DEFAULT '{}',
  ADD COLUMN video_url text,
  ADD COLUMN profile_completion integer NOT NULL DEFAULT 0,
  ADD COLUMN subcategories text[] DEFAULT '{}';

-- Create profile_reviews table
CREATE TABLE public.profile_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_id uuid,
  notes text,
  status public.profile_status NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Admins manage all reviews
CREATE POLICY "Admins manage profile reviews"
  ON public.profile_reviews FOR ALL
  USING (has_any_admin_role(auth.uid()));

-- RLS: Org members can view their own reviews
CREATE POLICY "Org members view own reviews"
  ON public.profile_reviews FOR SELECT
  USING (organization_id = get_user_org_id(auth.uid()));

-- RLS: Org members can insert reviews (submit)
CREATE POLICY "Org members submit reviews"
  ON public.profile_reviews FOR INSERT
  WITH CHECK (organization_id = get_user_org_id(auth.uid()));
