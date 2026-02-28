import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2, XCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PortalProfileSubmission = () => {
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    supabase.from("organizations").select("*").eq("id", orgId).single().then(({ data }) => {
      setOrg(data);
      setLoading(false);
    });
  }, [orgId]);

  if (loading || !org) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const checks = [
    { label: "شعار الجمعية", ok: !!org.logo_url },
    { label: "نبذة مختصرة (50 حرف+)", ok: org.short_description?.length >= 50 },
    { label: "نبذة موسعة", ok: !!org.long_description && org.long_description.length >= 50 },
    { label: "الرؤية", ok: !!org.vision },
    { label: "الرسالة", ok: !!org.mission },
    { label: "المنطقة والمدينة", ok: !!org.region && !!org.city },
    { label: "البريد الرسمي", ok: !!org.email },
  ];

  const allReady = checks.every(c => c.ok);
  const readyCount = checks.filter(c => c.ok).length;
  const canSubmit = allReady && ["draft", "changes_requested", "approved"].includes(org.profile_status);
  const submitLabel = org.profile_status === "approved" ? "إرسال التحديث للمراجعة" : "إرسال الملف للمراجعة";

  const handleSubmit = async () => {
    if (!canSubmit || !orgId) return;
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.from("organizations").update({ profile_status: "submitted" } as any).eq("id", orgId);
      if (updateError) throw updateError;
      const { error: reviewError } = await supabase.from("profile_reviews").insert({ organization_id: orgId, status: "submitted" } as any);
      if (reviewError) throw reviewError;
      toast.success(org.profile_status === "approved" ? "تم إرسال التحديث للمراجعة بنجاح 🎉" : "تم إرسال الملف للمراجعة بنجاح 🎉");
      navigate("/portal/profile/status");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="space-y-6 max-w-xl mx-auto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">إرسال الملف للمراجعة</h1>
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5" asChild>
          <Link to="/portal/profile"><ArrowLeft className="h-3.5 w-3.5" /> العودة</Link>
        </Button>
      </div>

      {/* Readiness Checklist */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">التحقق من جاهزية الملف</p>
              <p className="text-xs text-muted-foreground">{readyCount}/{checks.length} متطلبات مكتملة</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {checks.map((c) => (
              <div key={c.label} className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${c.ok ? "bg-emerald-50/60 dark:bg-emerald-950/20" : "bg-red-50/60 dark:bg-red-950/20"}`}>
                {c.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                <span className={`text-sm ${c.ok ? "text-foreground" : "text-red-600 dark:text-red-400"}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!allReady && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-300">
            أكمل جميع المتطلبات قبل الإرسال 📝{" "}
            <Link to="/portal/profile" className="underline font-medium">تعديل الملف</Link>
          </CardContent>
        </Card>
      )}

      {org.profile_status === "submitted" && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4 text-sm text-blue-700 dark:text-blue-300">
            الملف مرسل بالفعل وقيد المراجعة ⏳{" "}
            <Link to="/portal/profile/status" className="underline font-medium">تتبع الحالة</Link>
          </CardContent>
        </Card>
      )}

      {canSubmit && allReady && (
        <div className="text-center pt-2">
          <p className="mb-5 text-sm text-muted-foreground">
            {org.profile_status === "approved"
              ? "بعد الإرسال، يتم اعتماد النسخة الحالية لحين مراجعة التحديث الجديد من الإدارة"
              : "بعد الإرسال، ستقوم إدارة المنصة بمراجعة الملف واعتماده أو طلب تعديلات"}
          </p>
          <Button onClick={handleSubmit} disabled={submitting} size="lg" className="rounded-xl gap-2 px-8">
            <Send className="h-4 w-4" /> {submitLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default PortalProfileSubmission;
