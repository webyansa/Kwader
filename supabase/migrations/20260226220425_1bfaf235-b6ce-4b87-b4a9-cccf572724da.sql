
CREATE OR REPLACE FUNCTION public.register_organization(
  _name_ar TEXT,
  _city TEXT DEFAULT NULL,
  _email TEXT DEFAULT NULL,
  _phone TEXT DEFAULT NULL,
  _license_number TEXT DEFAULT NULL,
  _website TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  INSERT INTO public.organizations (name_ar, city, email, phone, license_number, website, owner_user_id, status, subscription_status)
  VALUES (_name_ar, _city, _email, _phone, _license_number, _website, _user_id, 'pending', 'pending')
  RETURNING id INTO _org_id;

  INSERT INTO public.user_roles (user_id, role, org_id)
  VALUES (_user_id, 'org_owner', _org_id);

  RETURN _org_id;
END;
$$;
