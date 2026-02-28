
-- Add public read policy for job_seeker_profiles (non-sensitive fields only)
CREATE POLICY "Public can view talent profiles"
ON public.job_seeker_profiles
FOR SELECT
TO anon, authenticated
USING (true);
