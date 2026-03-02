-- Allow authenticated users to read user_roles for identity resolution in messaging
-- This only exposes the role type and org_id, not sensitive data
CREATE POLICY "Authenticated users can view roles for messaging"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive policy since the new one covers it
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
