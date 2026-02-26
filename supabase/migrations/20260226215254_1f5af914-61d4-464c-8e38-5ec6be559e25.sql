
-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM (
  'super_admin', 'admin', 'moderator', 'finance', 'support',
  'org_owner', 'org_hr_manager', 'org_viewer'
);

CREATE TYPE public.org_status AS ENUM ('pending', 'active', 'suspended');

CREATE TYPE public.job_status AS ENUM (
  'draft', 'submitted', 'under_review', 'approved', 'rejected',
  'published', 'expired', 'archived', 'suspended'
);

CREATE TYPE public.application_status AS ENUM (
  'new', 'reviewed', 'shortlisted', 'rejected', 'hired'
);

CREATE TYPE public.employment_type AS ENUM (
  'full_time', 'part_time', 'contract', 'intern'
);

CREATE TYPE public.remote_type AS ENUM ('onsite', 'remote', 'hybrid');

CREATE TYPE public.experience_level AS ENUM ('junior', 'mid', 'senior', 'any');

CREATE TYPE public.application_method AS ENUM ('internal_form', 'external_url', 'email');

-- =============================================
-- 2. PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. USER ROLES TABLE (RBAC)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  org_id UUID, -- will be referenced after orgs table is created
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, org_id)
);

-- =============================================
-- 4. CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 5. PLANS TABLE
-- =============================================
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  jobs_per_month INT NOT NULL DEFAULT 5,
  featured_count INT NOT NULL DEFAULT 0,
  urgent_count INT NOT NULL DEFAULT 0,
  seats INT NOT NULL DEFAULT 1,
  ad_duration_days INT NOT NULL DEFAULT 30,
  show_logo_on_card BOOLEAN NOT NULL DEFAULT false,
  advanced_reports BOOLEAN NOT NULL DEFAULT false,
  boost_available BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6. ORGANIZATIONS TABLE
-- =============================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE,
  logo_url TEXT,
  city TEXT,
  region TEXT,
  address TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  description TEXT,
  license_number TEXT,
  social_links JSONB DEFAULT '{}',
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  subscription_status public.org_status NOT NULL DEFAULT 'pending',
  subscription_end_date TIMESTAMPTZ,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.org_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for user_roles.org_id
ALTER TABLE public.user_roles
  ADD CONSTRAINT fk_user_roles_org
  FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- =============================================
-- 7. JOBS TABLE
-- =============================================
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  city TEXT,
  remote_type public.remote_type NOT NULL DEFAULT 'onsite',
  employment_type public.employment_type NOT NULL DEFAULT 'full_time',
  experience_level public.experience_level NOT NULL DEFAULT 'any',
  salary_min NUMERIC(10,2),
  salary_max NUMERIC(10,2),
  salary_visible BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  application_method public.application_method NOT NULL DEFAULT 'internal_form',
  application_url TEXT,
  application_email TEXT,
  closing_date TIMESTAMPTZ,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  boost_until TIMESTAMPTZ,
  status public.job_status NOT NULL DEFAULT 'draft',
  moderation_notes TEXT,
  views_count INT NOT NULL DEFAULT 0,
  clicks_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 8. APPLICATIONS TABLE
-- =============================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cv_file_url TEXT,
  portfolio_url TEXT,
  cover_letter TEXT,
  status public.application_status NOT NULL DEFAULT 'new',
  notes_internal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 9. AUDIT LOGS
-- =============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 10. NOTIFICATIONS
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 11. REPORTS (بلاغات)
-- =============================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_email TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'job' or 'organization'
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending/reviewed/dismissed/actioned
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 12. SECURITY DEFINER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_admin_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'moderator')
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.user_roles
  WHERE user_id = _user_id AND role IN ('org_owner', 'org_hr_manager', 'org_viewer')
  LIMIT 1
$$;

-- =============================================
-- 13. TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 14. RLS POLICIES
-- =============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_any_admin_role(auth.uid()));

-- USER ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- CATEGORIES (public read)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_any_admin_role(auth.uid()));

-- PLANS (public read)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL USING (public.has_any_admin_role(auth.uid()));

-- ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active orgs" ON public.organizations FOR SELECT USING (status = 'active');
CREATE POLICY "Org members can view own org" ON public.organizations FOR SELECT USING (id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org owner can update own org" ON public.organizations FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Admins manage orgs" ON public.organizations FOR ALL USING (public.has_any_admin_role(auth.uid()));
CREATE POLICY "Anyone can insert org (signup)" ON public.organizations FOR INSERT WITH CHECK (true);

-- JOBS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published jobs" ON public.jobs FOR SELECT USING (status = 'published');
CREATE POLICY "Org members can view own jobs" ON public.jobs FOR SELECT USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org HR can insert jobs" ON public.jobs FOR INSERT WITH CHECK (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org HR can update own jobs" ON public.jobs FOR UPDATE USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins manage all jobs" ON public.jobs FOR ALL USING (public.has_any_admin_role(auth.uid()));

-- APPLICATIONS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Org members view own job apps" ON public.applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.org_id = public.get_user_org_id(auth.uid())));
CREATE POLICY "Org members update app status" ON public.applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.org_id = public.get_user_org_id(auth.uid())));
CREATE POLICY "Admins manage applications" ON public.applications FOR ALL USING (public.has_any_admin_role(auth.uid()));

-- AUDIT LOGS (admin only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_any_admin_role(auth.uid()));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- REPORTS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit report" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage reports" ON public.reports FOR ALL USING (public.has_any_admin_role(auth.uid()));

-- =============================================
-- 15. STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', false);

-- Logos: public read, org owners upload
CREATE POLICY "Public can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Authenticated can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- CVs: applicants upload, org members + admins download
CREATE POLICY "Authenticated can upload CVs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cvs');
CREATE POLICY "Org members and admins can view CVs" ON storage.objects FOR SELECT
  USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- =============================================
-- 16. INDEXES
-- =============================================
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_org_id ON public.jobs(org_id);
CREATE INDEX idx_jobs_category ON public.jobs(category_id);
CREATE INDEX idx_jobs_city ON public.jobs(city);
CREATE INDEX idx_jobs_published_at ON public.jobs(published_at DESC);
CREATE INDEX idx_jobs_is_featured ON public.jobs(is_featured) WHERE is_featured = true;
CREATE INDEX idx_jobs_is_urgent ON public.jobs(is_urgent) WHERE is_urgent = true;
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_organizations_status ON public.organizations(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- =============================================
-- 17. SEED DATA: Categories
-- =============================================
INSERT INTO public.categories (name_ar, name_en, slug, sort_order) VALUES
  ('الإدارة والقيادة', 'Management & Leadership', 'management', 1),
  ('التعليم والتدريب', 'Education & Training', 'education', 2),
  ('التنمية الاجتماعية', 'Social Development', 'social-development', 3),
  ('الصحة والرعاية', 'Health & Care', 'health', 4),
  ('التقنية والمعلومات', 'Technology & IT', 'technology', 5),
  ('المالية والمحاسبة', 'Finance & Accounting', 'finance', 6),
  ('التسويق والاتصال', 'Marketing & Communications', 'marketing', 7),
  ('الموارد البشرية', 'Human Resources', 'hr', 8),
  ('القانون والحوكمة', 'Legal & Governance', 'legal', 9),
  ('التطوع وخدمة المجتمع', 'Volunteering & Community', 'volunteering', 10);

-- =============================================
-- 18. SEED DATA: Plans
-- =============================================
INSERT INTO public.plans (name_ar, name_en, price_monthly, price_yearly, jobs_per_month, featured_count, urgent_count, seats, ad_duration_days, show_logo_on_card, advanced_reports, boost_available, sort_order) VALUES
  ('الباقة المجانية', 'Free Plan', 0, 0, 2, 0, 0, 1, 15, false, false, false, 1),
  ('الباقة الأساسية', 'Basic Plan', 199, 1990, 10, 2, 1, 3, 30, true, false, false, 2),
  ('الباقة الاحترافية', 'Pro Plan', 499, 4990, 30, 5, 3, 10, 45, true, true, true, 3),
  ('الباقة المؤسسية', 'Enterprise Plan', 999, 9990, 100, 20, 10, 50, 60, true, true, true, 4);
