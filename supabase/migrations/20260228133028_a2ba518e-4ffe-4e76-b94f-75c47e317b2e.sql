
-- Add slug columns to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug_ar text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS short_id text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug_unique text;

-- Create unique index on short_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_short_id ON public.jobs(short_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_slug_unique ON public.jobs(slug_unique);

-- Function to generate Arabic slug
CREATE OR REPLACE FUNCTION public.generate_arabic_slug(_title text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  _slug text;
BEGIN
  _slug := _title;
  -- Remove tashkeel (Arabic diacritics)
  _slug := regexp_replace(_slug, '[\u064B-\u065F\u0670]', '', 'g');
  -- Keep only Arabic letters, numbers, spaces
  _slug := regexp_replace(_slug, '[^\u0621-\u064A\u0660-\u06690-9a-zA-Z\s]', '', 'g');
  -- Trim and replace spaces with hyphens
  _slug := trim(_slug);
  _slug := regexp_replace(_slug, '\s+', '-', 'g');
  -- Remove leading/trailing hyphens
  _slug := trim(both '-' from _slug);
  RETURN _slug;
END;
$function$;

-- Function to generate short_id (4-6 digit number)
CREATE OR REPLACE FUNCTION public.generate_job_short_id()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  _short_id text;
  _exists boolean;
BEGIN
  LOOP
    _short_id := lpad((floor(random() * 90000 + 10000))::text, 5, '0');
    SELECT EXISTS(SELECT 1 FROM public.jobs WHERE short_id = _short_id) INTO _exists;
    EXIT WHEN NOT _exists;
  END LOOP;
  RETURN _short_id;
END;
$function$;

-- Trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.set_job_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Generate short_id if not set
  IF NEW.short_id IS NULL OR NEW.short_id = '' THEN
    NEW.short_id := generate_job_short_id();
  END IF;
  -- Always regenerate slug from title
  NEW.slug_ar := generate_arabic_slug(NEW.title);
  NEW.slug_unique := NEW.slug_ar || '-' || NEW.short_id;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_set_job_slug
BEFORE INSERT OR UPDATE OF title ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_job_slug();

-- Backfill existing jobs
UPDATE public.jobs SET title = title WHERE short_id IS NULL;
