import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ContactMessage {
  id: string;
  talent_user_id: string;
  sender_type: string;
  sender_user_id: string | null;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  subject: string | null;
  message_type: string;
  message: string;
  status: string;
  created_at: string;
}

export function useContactMessages(statusFilter?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contact-messages", user?.id, statusFilter],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("contact_messages")
        .select("*")
        .eq("talent_user_id", user.id)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ContactMessage[];
    },
    enabled: !!user,
  });
}

export function useContactMessageDetail(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contact-message-detail", id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("id", id)
        .eq("talent_user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as ContactMessage | null;
    },
    enabled: !!id && !!user,
  });
}

export function useNewContactCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["new-contact-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("talent_user_id", user.id)
        .eq("status", "new");
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

export function useSendContactMessage() {
  return useMutation({
    mutationFn: async (payload: {
      talent_user_id: string;
      sender_name: string;
      sender_email: string;
      sender_phone?: string;
      subject?: string;
      message_type: string;
      message: string;
      sender_user_id?: string;
      sender_type?: string;
    }) => {
      // Normalize phone: convert 05 to +966
      let phone = payload.sender_phone?.trim() || null;
      if (phone && phone.startsWith("05")) {
        phone = "+966" + phone.slice(1);
      }

      const { error } = await supabase.from("contact_messages").insert({
        talent_user_id: payload.talent_user_id,
        sender_name: payload.sender_name.trim(),
        sender_email: payload.sender_email.trim(),
        sender_phone: phone,
        subject: payload.subject?.trim() || null,
        message_type: payload.message_type,
        message: payload.message.trim(),
        sender_user_id: payload.sender_user_id || null,
        sender_type: payload.sender_type || "visitor",
        status: "new",
      });
      if (error) throw error;
    },
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["new-contact-count"] });
      queryClient.invalidateQueries({ queryKey: ["contact-message-detail"] });
    },
  });
}
