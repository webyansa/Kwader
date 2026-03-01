
-- Create contact_messages table for visitor/logged-in contact form submissions
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_user_id uuid NOT NULL,
  sender_type text NOT NULL DEFAULT 'visitor',
  sender_user_id uuid,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  sender_phone text,
  subject text,
  message_type text NOT NULL DEFAULT 'other',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message (no auth required)
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Talent can view their own received messages
CREATE POLICY "Talent can view own contact messages"
ON public.contact_messages
FOR SELECT
USING (auth.uid() = talent_user_id);

-- Talent can update status of their own messages
CREATE POLICY "Talent can update own contact messages"
ON public.contact_messages
FOR UPDATE
USING (auth.uid() = talent_user_id);

-- Admins can manage all
CREATE POLICY "Admins manage contact messages"
ON public.contact_messages
FOR ALL
USING (has_any_admin_role(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
