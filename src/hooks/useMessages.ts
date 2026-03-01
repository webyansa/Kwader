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
    user_type: "talent" | "org";
    org_name: string | null;
    org_logo: string | null;
    org_slug: string | null;
    profile_link: string | null;
  } | null;
  last_message: string | null;
  unread_count: number;
}

async function resolveUserIdentity(userIds: string[]) {
  if (!userIds.length) return new Map<string, ThreadWithDetails["other_user"]>();

  // Fetch all data sources in parallel
  const [seekerRes, profilesRes, rolesRes] = await Promise.all([
    supabase.from("job_seeker_profiles").select("user_id, full_name, avatar_url, username").in("user_id", userIds),
    supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds),
    supabase.from("user_roles").select("user_id, role, org_id").in("user_id", userIds),
  ]);

  // Collect org_ids to fetch org details
  const orgIds = (rolesRes.data || [])
    .filter((r: any) => r.org_id && ["org_owner", "org_hr_manager", "org_viewer"].includes(r.role))
    .map((r: any) => r.org_id);

  let orgMap = new Map<string, any>();
  if (orgIds.length) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name_ar, logo_url, slug")
      .in("id", orgIds);
    orgs?.forEach((o: any) => orgMap.set(o.id, o));
  }

  // Build role lookup: userId → { isOrg, orgId }
  const roleMap = new Map<string, { isOrg: boolean; orgId: string | null }>();
  (rolesRes.data || []).forEach((r: any) => {
    if (["org_owner", "org_hr_manager", "org_viewer"].includes(r.role)) {
      roleMap.set(r.user_id, { isOrg: true, orgId: r.org_id });
    } else if (!roleMap.has(r.user_id)) {
      roleMap.set(r.user_id, { isOrg: false, orgId: null });
    }
  });

  // Build seeker profile lookup
  const seekerMap = new Map<string, any>();
  (seekerRes.data || []).forEach((p: any) => seekerMap.set(p.user_id, p));

  const generalMap = new Map<string, any>();
  (profilesRes.data || []).forEach((p: any) => generalMap.set(p.user_id, p));

  // Resolve each user
  const result = new Map<string, ThreadWithDetails["other_user"]>();
  for (const uid of userIds) {
    const role = roleMap.get(uid);
    const isOrg = role?.isOrg ?? false;
    const org = isOrg && role?.orgId ? orgMap.get(role.orgId) : null;
    const seeker = seekerMap.get(uid);
    const general = generalMap.get(uid);

    if (isOrg && org) {
      result.set(uid, {
        user_id: uid,
        full_name: org.name_ar,
        avatar_url: org.logo_url,
        username: null,
        user_type: "org",
        org_name: org.name_ar,
        org_logo: org.logo_url,
        org_slug: org.slug,
        profile_link: org.slug ? `/ngos/${org.slug}` : null,
      });
    } else if (seeker) {
      result.set(uid, {
        user_id: uid,
        full_name: seeker.full_name,
        avatar_url: seeker.avatar_url,
        username: seeker.username,
        user_type: "talent",
        org_name: null,
        org_logo: null,
        org_slug: null,
        profile_link: seeker.username ? `/talent/${seeker.username}` : null,
      });
    } else {
      result.set(uid, {
        user_id: uid,
        full_name: general?.full_name || "مستخدم",
        avatar_url: general?.avatar_url || null,
        username: null,
        user_type: "talent",
        org_name: null,
        org_logo: null,
        org_slug: null,
        profile_link: null,
      });
    }
  }
  return result;
}

export function useThreads() {
  const { user } = useAuth();

  return useQuery({
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

      const otherIds = [...new Set(threads.map((t: any) =>
        t.participant_one_id === user.id ? t.participant_two_id : t.participant_one_id
      ))];

      const profileMap = await resolveUserIdentity(otherIds);

      // Get last message and unread count
      const threadIds = threads.map((t: any) => t.id);
      const [lastMsgRes, unreadRes] = await Promise.all([
        supabase.from("messages").select("thread_id, message_text, created_at").in("thread_id", threadIds).order("created_at", { ascending: false }),
        supabase.from("messages").select("thread_id").in("thread_id", threadIds).neq("sender_id", user.id).eq("is_read", false),
      ]);

      const lastMsgMap = new Map<string, string>();
      lastMsgRes.data?.forEach((m: any) => { if (!lastMsgMap.has(m.thread_id)) lastMsgMap.set(m.thread_id, m.message_text); });

      const unreadMap = new Map<string, number>();
      unreadRes.data?.forEach((m: any) => { unreadMap.set(m.thread_id, (unreadMap.get(m.thread_id) || 0) + 1); });

      return threads.map((t: any): ThreadWithDetails => {
        const otherId = t.participant_one_id === user.id ? t.participant_two_id : t.participant_one_id;
        return {
          ...t,
          other_user: profileMap.get(otherId) || { full_name: "مستخدم", avatar_url: null, username: null, user_id: otherId, user_type: "talent", org_name: null, org_logo: null, org_slug: null, profile_link: null },
          last_message: lastMsgMap.get(t.id) || null,
          unread_count: unreadMap.get(t.id) || 0,
        };
      });
    },
    enabled: !!user,
  });
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

  useEffect(() => {
    if (!threadId || !user || !query.data?.length) return;
    const unread = query.data.filter((m) => !m.is_read && m.sender_id !== user.id);
    if (!unread.length) return;
    supabase.from("messages").update({ is_read: true }).in("id", unread.map((m) => m.id)).then(() => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    });
  }, [threadId, query.data, user]);

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
        thread_id: threadId, sender_id: user.id, message_text: text.trim(),
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["message-threads"] }); },
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
