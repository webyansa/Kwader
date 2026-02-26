import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reasons = ["محتوى مخالف", "وظيفة وهمية", "معلومات خاطئة", "أخرى"];

const ReportDialog = ({ entityId, entityType = "job" }: { entityId: string; entityType?: string }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      entity_id: entityId,
      entity_type: entityType,
      reason,
      details: details.trim() || null,
      reporter_email: email.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم إرسال البلاغ بنجاح" });
      setOpen(false);
      setReason("");
      setDetails("");
      setEmail("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
          <Flag className="h-3.5 w-3.5" />إبلاغ
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-display">الإبلاغ عن مخالفة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>السبب *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="اختر السبب" /></SelectTrigger>
              <SelectContent>
                {reasons.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>بريدك الإلكتروني *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label>تفاصيل إضافية</Label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} rows={3} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جارٍ الإرسال..." : "إرسال البلاغ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
