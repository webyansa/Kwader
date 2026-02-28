-- 1) Rename source-of-truth table to JobApplications style
ALTER TABLE public.applications RENAME TO job_applications;

-- 2) Extend status enum to support full workflow
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'application_status' AND e.enumlabel = 'in_review'
  ) THEN
    ALTER TYPE public.application_status ADD VALUE 'in_review';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'application_status' AND e.enumlabel = 'interview'
  ) THEN
    ALTER TYPE public.application_status ADD VALUE 'interview';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'application_status' AND e.enumlabel = 'offer'
  ) THEN
    ALTER TYPE public.application_status ADD VALUE 'offer';
  END IF;
END $$;

-- 3) Add unified fields required by new flow
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS guest_full_name text,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_mobile text,
  ADD COLUMN IF NOT EXISTS cover_message text,
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 4) Backfill data from legacy fields
UPDATE public.job_applications ja
SET
  organization_id = COALESCE(ja.organization_id, j.org_id),
  guest_full_name = COALESCE(ja.guest_full_name, CASE WHEN ja.applicant_type = 'guest' THEN ja.full_name ELSE NULL END),
  guest_email = COALESCE(ja.guest_email, CASE WHEN ja.applicant_type = 'guest' THEN ja.email ELSE NULL END),
  guest_mobile = COALESCE(ja.guest_mobile, CASE WHEN ja.applicant_type = 'guest' THEN ja.phone ELSE NULL END),
  cover_message = COALESCE(ja.cover_message, ja.cover_letter),
  created_by_user_id = COALESCE(ja.created_by_user_id, ja.talent_user_id)
FROM public.jobs j
WHERE ja.job_id = j.id;

-- Fill missing actor IDs for historical guest records
UPDATE public.job_applications
SET created_by_user_id = gen_random_uuid()
WHERE created_by_user_id IS NULL;

-- Make organization mandatory after backfill
ALTER TABLE public.job_applications
  ALTER COLUMN organization_id SET NOT NULL,
  ALTER COLUMN created_by_user_id SET NOT NULL,
  ALTER COLUMN cv_file_url SET NOT NULL;

-- 5) Data integrity constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_applications_applicant_type_chk'
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_applicant_type_chk
      CHECK (applicant_type IN ('talent', 'guest'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_applications_source_chk'
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_source_chk
      CHECK (source IN ('web', 'portal'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_applications_talent_integrity_chk'
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_talent_integrity_chk
      CHECK (
        (applicant_type = 'talent' AND talent_user_id IS NOT NULL)
        OR
        (
          applicant_type = 'guest'
          AND guest_full_name IS NOT NULL
          AND btrim(guest_full_name) <> ''
          AND (
            (guest_email IS NOT NULL AND btrim(guest_email) <> '')
            OR
            (guest_mobile IS NOT NULL AND btrim(guest_mobile) <> '')
          )
        )
      );
  END IF;
END $$;

-- 6) Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_job_id_fkey'
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_job_id_fkey
      FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_organization_id_fkey'
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_applications_talent_user_id ON public.job_applications(talent_user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_organization_id ON public.job_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at DESC);

-- 7) Triggers for consistency and audit
CREATE OR REPLACE FUNCTION public.job_applications_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _job_org_id uuid;
BEGIN
  SELECT j.org_id INTO _job_org_id
  FROM public.jobs j
  WHERE j.id = NEW.job_id
  LIMIT 1;

  IF _job_org_id IS NULL THEN
    RAISE EXCEPTION 'Invalid job_id';
  END IF;

  -- enforce org_id copy from job
  NEW.organization_id := _job_org_id;

  -- actor id
  IF NEW.created_by_user_id IS NULL THEN
    NEW.created_by_user_id := COALESCE(auth.uid(), gen_random_uuid());
  END IF;

  -- normalize source
  IF NEW.source IS NULL OR btrim(NEW.source) = '' THEN
    NEW.source := 'web';
  END IF;

  -- normalize guest mirrored legacy fields
  IF NEW.applicant_type = 'guest' THEN
    NEW.full_name := COALESCE(NEW.full_name, NEW.guest_full_name);
    NEW.email := COALESCE(NEW.email, NEW.guest_email);
    NEW.phone := COALESCE(NEW.phone, NEW.guest_mobile);
  END IF;

  -- normalize talent actor
  IF NEW.applicant_type = 'talent' AND NEW.talent_user_id IS NULL THEN
    NEW.talent_user_id := auth.uid();
  END IF;

  -- keep cover fields in sync
  NEW.cover_message := COALESCE(NEW.cover_message, NEW.cover_letter);

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_applications_before_write ON public.job_applications;
CREATE TRIGGER trg_job_applications_before_write
BEFORE INSERT OR UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.job_applications_before_write();

CREATE OR REPLACE FUNCTION public.log_job_application_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, details)
  VALUES (
    'application_created',
    'job_application',
    NEW.id,
    NEW.talent_user_id,
    jsonb_build_object(
      'application_id', NEW.id,
      'job_id', NEW.job_id,
      'organization_id', NEW.organization_id,
      'talent_user_id', NEW.talent_user_id,
      'applicant_type', NEW.applicant_type,
      'source', NEW.source
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_applications_audit_insert ON public.job_applications;
CREATE TRIGGER trg_job_applications_audit_insert
AFTER INSERT ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.log_job_application_created();

-- 8) Rebuild RLS policies for clear visibility rules
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can apply" ON public.job_applications;
DROP POLICY IF EXISTS "Org members view own job apps" ON public.job_applications;
DROP POLICY IF EXISTS "Org members update app status" ON public.job_applications;
DROP POLICY IF EXISTS "Admins manage applications" ON public.job_applications;
DROP POLICY IF EXISTS "Talents view own applications" ON public.job_applications;

CREATE POLICY "Public can insert job applications"
ON public.job_applications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = job_applications.job_id
      AND j.status = 'published'
      AND j.org_id = job_applications.organization_id
  )
  AND cv_file_url IS NOT NULL
  AND (
    (applicant_type = 'talent' AND auth.uid() IS NOT NULL AND auth.uid() = talent_user_id)
    OR
    (applicant_type = 'guest' AND guest_full_name IS NOT NULL AND ((guest_email IS NOT NULL) OR (guest_mobile IS NOT NULL)))
  )
);

CREATE POLICY "Talents can view own applications"
ON public.job_applications
FOR SELECT
USING (auth.uid() = talent_user_id);

CREATE POLICY "Org members can view own organization applications"
ON public.job_applications
FOR SELECT
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Org members can update own organization applications"
ON public.job_applications
FOR UPDATE
USING (organization_id = public.get_user_org_id(auth.uid()))
WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can manage all job applications"
ON public.job_applications
FOR ALL
USING (public.has_any_admin_role(auth.uid()))
WITH CHECK (public.has_any_admin_role(auth.uid()));