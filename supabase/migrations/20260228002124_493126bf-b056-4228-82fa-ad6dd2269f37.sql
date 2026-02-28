
-- 1. Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'pending',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL USING (has_any_admin_role(auth.uid()));
CREATE POLICY "Org view own subscription" ON public.subscriptions FOR SELECT USING (org_id = get_user_org_id(auth.uid()));
CREATE POLICY "Authenticated insert subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Create job_seeker_profiles table
CREATE TABLE public.job_seeker_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  city text,
  nationality text,
  experience_level text,
  skills text[] DEFAULT '{}',
  cv_file_url text,
  linkedin_url text,
  portfolio_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own js profile" ON public.job_seeker_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own js profile" ON public.job_seeker_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own js profile" ON public.job_seeker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage js profiles" ON public.job_seeker_profiles FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE TRIGGER update_job_seeker_profiles_updated_at
  BEFORE UPDATE ON public.job_seeker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Function to register job seeker
CREATE OR REPLACE FUNCTION public.register_job_seeker(_full_name text DEFAULT NULL, _city text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (_user_id, COALESCE(_full_name, ''))
  ON CONFLICT (user_id) DO UPDATE SET full_name = COALESCE(_full_name, profiles.full_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'job_seeker')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.job_seeker_profiles (user_id, full_name, city)
  VALUES (_user_id, _full_name, _city)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- 4. Update register_organization to accept plan_id and create subscription
DROP FUNCTION IF EXISTS public.register_organization(text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.register_organization(
  _name_ar text,
  _plan_id uuid,
  _city text DEFAULT NULL,
  _email text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _license_number text DEFAULT NULL,
  _website text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _org_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'org_owner') THEN
    RAISE EXCEPTION 'User already owns an organization';
  END IF;

  INSERT INTO public.profiles (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.organizations (name_ar, city, email, phone, license_number, website, owner_user_id, status, subscription_status)
  VALUES (_name_ar, _city, _email, _phone, _license_number, _website, _user_id, 'pending', 'pending')
  RETURNING id INTO _org_id;

  INSERT INTO public.user_roles (user_id, role, org_id)
  VALUES (_user_id, 'org_owner', _org_id);

  INSERT INTO public.subscriptions (org_id, plan_id, status)
  VALUES (_org_id, _plan_id, 'pending');

  RETURN _org_id;
END;
$$;

-- 5. Admin function to approve org subscription
CREATE OR REPLACE FUNCTION public.approve_organization(_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_any_admin_role(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.organizations
  SET status = 'active', subscription_status = 'active'
  WHERE id = _org_id;

  UPDATE public.subscriptions
  SET status = 'active', start_date = now(), end_date = now() + interval '1 year'
  WHERE org_id = _org_id AND status = 'pending';
END;
$$;

-- 6. Admin function to reject org
CREATE OR REPLACE FUNCTION public.reject_organization(_org_id uuid, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_any_admin_role(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.organizations
  SET status = 'suspended', subscription_status = 'suspended'
  WHERE id = _org_id;

  UPDATE public.subscriptions
  SET status = 'cancelled'
  WHERE org_id = _org_id AND status = 'pending';
END;
$$;
