
-- Tighten audit_logs: only authenticated users can insert
DROP POLICY "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tighten notifications: only authenticated users can insert
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tighten org signup: require authenticated
DROP POLICY "Anyone can insert org (signup)" ON public.organizations;
CREATE POLICY "Authenticated can create org" ON public.organizations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
