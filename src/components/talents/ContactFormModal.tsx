import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, User, MessageSquare, Send, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSendContactMessage } from "@/hooks/useContactMessages";
import { useAuth } from "@/hooks/useAuth";

const contactSchema = z.object({
  sender_name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  sender_email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  sender_phone: z.string().max(20).optional().or(z.literal("")),
  message_type: z.string().min(1, "اختر نوع الرسالة"),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const messageTypes = [
  { value: "hiring", label: "توظيف" },
  { value: "consulting", label: "استشارة" },
  { value: "service", label: "خدمة" },
  { value: "collaboration", label: "تعاون" },
  { value: "other", label: "أخرى" },
];

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talentUserId: string;
  talentName: string;
}

const ContactFormModal = ({ open, onOpenChange, talentUserId, talentName }: ContactFormModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const sendMessage = useSendContactMessage();
  const [sent, setSent] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      sender_name: "",
      sender_email: "",
      sender_phone: "",
      message_type: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await sendMessage.mutateAsync({
        talent_user_id: talentUserId,
        sender_name: data.sender_name,
        sender_email: data.sender_email,
        sender_phone: data.sender_phone || undefined,
        subject: data.subject || undefined,
        message_type: data.message_type,
        message: data.message,
        sender_user_id: user?.id,
        sender_type: user ? "logged_in" : "visitor",
      });
      setSent(true);
      toast({ title: "تم إرسال رسالتك للكادر ✅", description: "بيرد عليك من داخل كوادر" });
      form.reset();
    } catch {
      toast({ title: "حدث خطأ", description: "لم نتمكن من إرسال الرسالة", variant: "destructive" });
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSent(false);
      form.reset();
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg sm:rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            تواصل مع {talentName}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">تم الإرسال بنجاح!</h3>
            <p className="text-sm text-muted-foreground">رسالتك وصلت للكادر وسيتم الرد عليك عبر كوادر.</p>
            <Button onClick={() => handleClose(false)} className="rounded-xl">إغلاق</Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sender_name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />الاسم الكامل *
                </Label>
                <Input id="sender_name" placeholder="اسمك الكامل" {...form.register("sender_name")} />
                {form.formState.errors.sender_name && (
                  <p className="text-xs text-destructive">{form.formState.errors.sender_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sender_email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />البريد الإلكتروني *
                </Label>
                <Input id="sender_email" type="email" placeholder="email@example.com" dir="ltr" {...form.register("sender_email")} />
                {form.formState.errors.sender_email && (
                  <p className="text-xs text-destructive">{form.formState.errors.sender_email.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sender_phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />الجوال (اختياري)
                </Label>
                <Input id="sender_phone" placeholder="05xxxxxxxx" dir="ltr" {...form.register("sender_phone")} />
              </div>
              <div className="space-y-1.5">
                <Label>نوع الرسالة *</Label>
                <Select
                  value={form.watch("message_type")}
                  onValueChange={(val) => form.setValue("message_type", val, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الرسالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.message_type && (
                  <p className="text-xs text-destructive">{form.formState.errors.message_type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject">عنوان مختصر (اختياري)</Label>
              <Input id="subject" placeholder="موضوع الرسالة" {...form.register("subject")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">نص الرسالة *</Label>
              <Textarea id="message" rows={4} placeholder="اكتب رسالتك هنا..." {...form.register("message")} />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t pt-4">
              <p className="text-[11px] text-muted-foreground">
                💡 المراسلات المباشرة تتطلب{" "}
                <Link to="/login" className="text-primary underline">تسجيل دخول</Link>
              </p>
              <Button type="submit" disabled={sendMessage.isPending} className="rounded-xl gap-2">
                <Send className="h-4 w-4" />
                {sendMessage.isPending ? "جاري الإرسال..." : "إرسال"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;
