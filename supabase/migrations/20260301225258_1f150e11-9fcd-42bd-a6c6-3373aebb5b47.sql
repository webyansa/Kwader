
-- Messages threads table
CREATE TABLE public.messages_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one_id uuid NOT NULL,
  participant_two_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  is_archived boolean NOT NULL DEFAULT false,
  CONSTRAINT unique_thread_pair UNIQUE (participant_one_id, participant_two_id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.messages_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message_text text NOT NULL,
  attachment_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_created_at ON public.messages(thread_id, created_at DESC);
CREATE INDEX idx_threads_participant_one ON public.messages_threads(participant_one_id);
CREATE INDEX idx_threads_participant_two ON public.messages_threads(participant_two_id);

-- Enable RLS
ALTER TABLE public.messages_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view threads they participate in
CREATE POLICY "Users view own threads"
ON public.messages_threads FOR SELECT
TO authenticated
USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- RLS: Authenticated users can create threads
CREATE POLICY "Authenticated create threads"
ON public.messages_threads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- RLS: Users can update their own threads (archive)
CREATE POLICY "Users update own threads"
ON public.messages_threads FOR UPDATE
TO authenticated
USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- RLS: Users can view messages in their threads
CREATE POLICY "Users view own messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages_threads t
    WHERE t.id = messages.thread_id
    AND (t.participant_one_id = auth.uid() OR t.participant_two_id = auth.uid())
  )
);

-- RLS: Users can send messages in their threads
CREATE POLICY "Users send messages in own threads"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.messages_threads t
    WHERE t.id = messages.thread_id
    AND (t.participant_one_id = auth.uid() OR t.participant_two_id = auth.uid())
  )
);

-- RLS: Recipients can mark messages as read
CREATE POLICY "Recipients mark messages read"
ON public.messages FOR UPDATE
TO authenticated
USING (
  sender_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.messages_threads t
    WHERE t.id = messages.thread_id
    AND (t.participant_one_id = auth.uid() OR t.participant_two_id = auth.uid())
  )
);

-- Admins full access
CREATE POLICY "Admins manage threads"
ON public.messages_threads FOR ALL
TO authenticated
USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Admins manage messages"
ON public.messages FOR ALL
TO authenticated
USING (has_any_admin_role(auth.uid()));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Function to get or create thread between two users
CREATE OR REPLACE FUNCTION public.get_or_create_thread(_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _thread_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF _user_id = _other_user_id THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;

  -- Find existing thread
  SELECT id INTO _thread_id
  FROM public.messages_threads
  WHERE (participant_one_id = _user_id AND participant_two_id = _other_user_id)
     OR (participant_one_id = _other_user_id AND participant_two_id = _user_id)
  LIMIT 1;

  -- Create if not exists
  IF _thread_id IS NULL THEN
    INSERT INTO public.messages_threads (participant_one_id, participant_two_id)
    VALUES (_user_id, _other_user_id)
    RETURNING id INTO _thread_id;
  END IF;

  RETURN _thread_id;
END;
$$;

-- Trigger to update last_message_at on new message
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_thread_last_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_thread_last_message();

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at > now() - interval '10 minutes';
  
  IF _count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more messages.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_message_rate_limit
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.check_message_rate_limit();
