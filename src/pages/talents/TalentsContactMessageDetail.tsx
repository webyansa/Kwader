import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Phone, Copy, Archive, Eye, ExternalLink, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useContactMessageDetail, useUpdateContactStatus } from "@/hooks/useContactMessages";
import { useGetOrCreateThread } from "@/hooks/useMessages";

const messageTypeLabels: Record<string, string> = {
  hiring: "توظيف",
  consulting: "استشارة",
  service: "خدمة",
  collaboration: "تعاون",
  other: "أخرى",
};

const statusLabels: Record<string, string> = {
  new: "جديد",
  read: "مقروء",
  replied: "تم الرد",
  archived: "مؤرشف",
};

const TalentsContactMessageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: msg, isLoading } = useContactMessageDetail(id);
  const updateStatus = useUpdateContactStatus();
  const getOrCreateThread = useGetOrCreateThread();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!msg) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-muted-foreground">الرسالة غير موجودة</p>
        <Button variant="outline" onClick={() => navigate("/talents/messages?tab=inbox")}>
          العودة للرسائل
        </Button>
      </div>
    );
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(msg.sender_email);
    toast({ title: "تم نسخ البريد ✅" });
  };

  const handleOpenChat = () => {
    if (!msg.sender_user_id) return;
    getOrCreateThread.mutate(msg.sender_user_id, {
      onSuccess: () => {
        navigate("/talents/messages?tab=chats");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/talents/messages?tab=inbox")}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">تفاصيل الرسالة</h1>
          <p className="text-sm text-muted-foreground">من {msg.sender_name}</p>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{messageTypeLabels[msg.message_type] || msg.message_type}</Badge>
            <Badge className={msg.status === "new" ? "bg-primary/10 text-primary hover:bg-primary/10" : "bg-secondary text-secondary-foreground hover:bg-secondary"}>
              {statusLabels[msg.status] || msg.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(msg.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">الاسم</p>
              <p className="font-medium text-foreground">{msg.sender_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">البريد</p>
              <p className="font-medium text-foreground" dir="ltr">{msg.sender_email}</p>
            </div>
            {msg.sender_phone && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">الجوال</p>
                <p className="font-medium text-foreground" dir="ltr">{msg.sender_phone}</p>
              </div>
            )}
            {msg.subject && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">الموضوع</p>
                <p className="font-medium text-foreground">{msg.subject}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">نص الرسالة</p>
            <p className="whitespace-pre-line leading-[1.9] text-foreground">{msg.message}</p>
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            {msg.status === "new" && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => { updateStatus.mutate({ id: msg.id, status: "read" }); toast({ title: "تم التعليم كمقروء ✅" }); }}
              >
                <Eye className="h-4 w-4" />تعليم كمقروء
              </Button>
            )}
            {msg.status !== "archived" && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => { updateStatus.mutate({ id: msg.id, status: "archived" }); toast({ title: "تم الأرشفة ✅" }); }}
              >
                <Archive className="h-4 w-4" />أرشفة
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={handleCopyEmail}>
              <Copy className="h-4 w-4" />نسخ البريد
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
              <a href={`mailto:${msg.sender_email}`}>
                <Mail className="h-4 w-4" />رد بالبريد
              </a>
            </Button>
            {msg.sender_user_id && (
              <Button
                size="sm"
                className="rounded-xl gap-2"
                onClick={handleOpenChat}
                disabled={getOrCreateThread.isPending}
              >
                <MessageSquare className="h-4 w-4" />فتح محادثة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentsContactMessageDetail;
