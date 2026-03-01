import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface Thread {
  id: string;
  participant_one_id: string;
  participant_two_id: string;
  created_at: string;
  last_message_at: string;
  is_archived: boolean;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  message_text: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ThreadWithDetails extends Thread {
  other_user: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
    user_id: string;
  } | null;
  last_message: string | null;
  unread_count: number;
}

export function useThreads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["message-threads", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: threads, error } = await supabase
        .from("messages_threads")
        .select("*")
        .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
        .eq("is_archived", false)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      if (!threads?.length) return [];

      // Get other participant details
      const otherIds = threads.map((t: any) =>
        t.participant_one_id === user.id ? t.participant_two_id : t.participant_one_id
      );

      const { data: profiles } = await supabase
        .from("job_seeker_profiles")
        .select("user_id, full_name, avatar_url, username")
        .in("user_id", otherIds);

      const { data: orgProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", otherIds);

      // Get last message and unread count for each thread
      const threadIds = threads.map((t: any) => t.id);

      const { data: lastMessages } = await supabase
        .from("messages")
        .select("thread_id, message_text, created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: false });

      const { data: unreadCounts } = await supabase
        .from("messages")
        .select("thread_id")
        .in("thread_id", threadIds)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      const profileMap = new Map<string, any>();
      profiles?.forEach((p: any) => profileMap.set(p.user_id, p));
      orgProfiles?.forEach((p: any) => {
        if (!profileMap.has(p.user_id)) {
          profileMap.set(p.user_id, { ...p, username: null });
        }
      });

      const lastMsgMap = new Map<string, string>();
      lastMessages?.forEach((m: any) => {
        if (!lastMsgMap.has(m.thread_id)) lastMsgMap.set(m.thread_id, m.message_text);
      });

      const unreadMap = new Map<string, number>();
      unreadCounts?.forEach((m: any) => {
        unreadMap.set(m.thread_id, (unreadMap.get(m.thread_id) || 0) + 1);
      });

      return threads.map((t: any): ThreadWithDetails => {
        const otherId = t.participant_one_id === user.id ? t.participant_two_id : t.participant_one_id;
        return {
          ...t,
          other_user: profileMap.get(otherId) || { full_name: "مستخدم", avatar_url: null, username: null, user_id: otherId },
          last_message: lastMsgMap.get(t.id) || null,
          unread_count: unreadMap.get(t.id) || 0,
        };
      });
    },
    enabled: !!user,
  });

  return query;
}

export function useMessages(threadId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!threadId,
  });

  // Mark messages as read
  useEffect(() => {
    if (!threadId || !user || !query.data?.length) return;
    const unread = query.data.filter((m) => !m.is_read && m.sender_id !== user.id);
    if (!unread.length) return;

    supabase
      .from("messages")
      .update({ is_read: true })
      .in("id", unread.map((m) => m.id))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      });
  }, [threadId, query.data, user]);

  // Realtime subscription
  useEffect(() => {
    if (!threadId) return;
    const channel = supabase
      .channel(`messages-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
        queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [threadId]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, text }: { threadId: string; text: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        message_text: text.trim(),
      });
      if (error) throw error;
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
}

export function useGetOrCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc("get_or_create_thread", { _other_user_id: otherUserId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
}

export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unread-messages-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .eq("is_read", false);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}
