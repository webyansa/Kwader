import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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
  const canSubmit = allReady && (org.profile_status === "draft" || org.profile_status === "changes_requested");

  const handleSubmit = async () => {
    if (!canSubmit || !orgId) return;
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from("organizations")
        .update({ profile_status: "submitted" } as any)
        .eq("id", orgId);
      if (updateError) throw updateError;

      const { error: reviewError } = await supabase
        .from("profile_reviews")
        .insert({ organization_id: orgId, status: "submitted" } as any);
      if (reviewError) throw reviewError;

      toast.success("تم إرسال الملف للمراجعة بنجاح");
      navigate("/portal/profile/status");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">إرسال الملف للمراجعة</h1>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/portal/profile"><ArrowRight className="ml-1.5 h-3.5 w-3.5" /> العودة</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">التحقق من جاهزية الملف</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              {c.ok ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
              <span className={`text-sm ${c.ok ? "text-foreground" : "text-destructive"}`}>{c.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {!allReady && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            يرجى إكمال جميع المتطلبات قبل الإرسال. <Link to="/portal/profile" className="underline font-medium">تعديل الملف</Link>
          </CardContent>
        </Card>
      )}

      {org.profile_status === "submitted" && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="py-4 text-sm text-amber-800 dark:text-amber-200">
            الملف مرسل بالفعل وقيد المراجعة. <Link to="/portal/profile/status" className="underline font-medium">تتبع الحالة</Link>
          </CardContent>
        </Card>
      )}

      {canSubmit && allReady && (
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">بعد الإرسال، ستقوم إدارة المنصة بمراجعة الملف واعتماده أو طلب تعديلات.</p>
          <Button onClick={handleSubmit} disabled={submitting} size="lg">
            <Send className="ml-2 h-4 w-4" /> إرسال الملف للمراجعة
          </Button>
        </div>
      )}
    </div>
  );
};

export default PortalProfileSubmission;
