
-- Enums for organization employees
CREATE TYPE public.employee_status AS ENUM ('invited', 'pending_acceptance', 'active', 'inactive', 'terminated');
CREATE TYPE public.org_employee_type AS ENUM ('full_time', 'part_time', 'contract', 'intern', 'volunteer');
CREATE TYPE public.org_work_mode AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE public.invite_status AS ENUM ('sent', 'opened', 'accepted', 'expired', 'canceled');
CREATE TYPE public.org_member_role AS ENUM ('employee', 'hr', 'manager');

-- Organization Employees table
CREATE TABLE public.organization_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid, -- nullable, linked later
  talent_profile_id uuid, -- nullable, linked later
  full_name text NOT NULL,
  email text,
  phone text,
  national_id_or_iqama text,
  employee_number text,
  job_title text NOT NULL DEFAULT '',
  department text,
  manager_employee_id uuid REFERENCES public.organization_employees(id) ON DELETE SET NULL,
  employment_type public.org_employee_type NOT NULL DEFAULT 'full_time',
  work_mode public.org_work_mode NOT NULL DEFAULT 'onsite',
  start_date date,
  status public.employee_status NOT NULL DEFAULT 'active',
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-generate employee number
CREATE OR REPLACE FUNCTION public.generate_employee_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
    SELECT COUNT(*) + 1 INTO _count
    FROM public.organization_employees
    WHERE organization_id = NEW.organization_id;
    NEW.employee_number := 'EMP-' || lpad(_count::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_employee_number
  BEFORE INSERT ON public.organization_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_employee_number();

-- Updated_at trigger
CREATE TRIGGER trg_org_employees_updated_at
  BEFORE UPDATE ON public.organization_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Employee Invites table
CREATE TABLE public.employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  invitee_phone text,
  invitee_name text NOT NULL,
  role_in_org public.org_member_role NOT NULL DEFAULT 'employee',
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  status public.invite_status NOT NULL DEFAULT 'sent',
  employee_id uuid REFERENCES public.organization_employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for organization_employees
ALTER TABLE public.organization_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members view own employees"
  ON public.organization_employees FOR SELECT
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org owner/hr insert employees"
  ON public.organization_employees FOR INSERT
  WITH CHECK (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org owner/hr update employees"
  ON public.organization_employees FOR UPDATE
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org owner/hr delete employees"
  ON public.organization_employees FOR DELETE
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Admins manage all employees"
  ON public.organization_employees FOR ALL
  USING (has_any_admin_role(auth.uid()));

-- Talent can see their own employment record
CREATE POLICY "Talent view own employment"
  ON public.organization_employees FOR SELECT
  USING (user_id = auth.uid());

-- RLS for employee_invites
ALTER TABLE public.employee_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members view own invites"
  ON public.employee_invites FOR SELECT
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org owner/hr insert invites"
  ON public.employee_invites FOR INSERT
  WITH CHECK (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org owner/hr update invites"
  ON public.employee_invites FOR UPDATE
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Admins manage all invites"
  ON public.employee_invites FOR ALL
  USING (has_any_admin_role(auth.uid()));
