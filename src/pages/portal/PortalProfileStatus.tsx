import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertTriangle, XCircle, Edit, Send, ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<string, { icon: any; label: string; textClass: string; bgClass: string; dotClass: string }> = {
  draft: { icon: Edit, label: "مسودة", textClass: "text-muted-foreground", bgClass: "bg-muted/60", dotClass: "bg-muted-foreground" },
  submitted: { icon: Clock, label: "بانتظار المراجعة", textClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-50 dark:bg-blue-950/30", dotClass: "bg-blue-500" },
  changes_requested: { icon: AlertTriangle, label: "مطلوب تعديلات", textClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-950/30", dotClass: "bg-amber-500" },
  approved: { icon: CheckCircle2, label: "معتمد", textClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-950/30", dotClass: "bg-emerald-500" },
  rejected: { icon: XCircle, label: "مرفوض", textClass: "text-red-600 dark:text-red-400", bgClass: "bg-red-50 dark:bg-red-950/30", dotClass: "bg-red-500" },
};

const PortalProfileStatus = () => {
  const { orgId } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    const fetch = async () => {
      const [orgRes, reviewsRes] = await Promise.all([
        supabase.from("organizations").select("*").eq("id", orgId).single(),
        supabase.from("profile_reviews").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
      ]);
      setOrg(orgRes.data);
      setReviews(reviewsRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [orgId]);

  if (loading || !org) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const status = org.profile_status || "draft";
  const cfg = statusConfig[status] || statusConfig.draft;
  const Icon = cfg.icon;

  return (
    <motion.div className="space-y-6 max-w-2xl mx-auto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">حالة مراجعة الملف</h1>
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5" asChild>
          <Link to="/portal/profile"><ArrowLeft className="h-3.5 w-3.5" /> العودة للملف</Link>
        </Button>
      </div>

      {/* Status Card */}
      <Card className={`border ${status === "approved" ? "border-emerald-200 dark:border-emerald-800" : status === "changes_requested" ? "border-amber-200 dark:border-amber-800" : status === "submitted" ? "border-blue-200 dark:border-blue-800" : "border-border/60"}`}>
        <CardContent className="py-10 text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${cfg.bgClass} mb-4`}>
            <Icon className={`h-8 w-8 ${cfg.textClass}`} />
          </div>
          <Badge className={`${cfg.bgClass} ${cfg.textClass} border-0 text-sm px-4 py-1.5 rounded-full font-medium`}>
            {cfg.label}
          </Badge>

          <div className="mt-5 max-w-sm mx-auto">
            {status === "draft" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">لم يتم إرسال الملف بعد. أكمل البيانات المطلوبة وأرسله للمراجعة</p>
                <Button className="rounded-lg" asChild><Link to="/portal/profile">تعديل وإكمال الملف</Link></Button>
              </>
            )}
            {status === "submitted" && (
              <p className="text-sm text-muted-foreground">ملفك قيد المراجعة من إدارة المنصة ⏳ بنبلغك أول ما يصدر القرار</p>
            )}
            {status === "changes_requested" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">الإدارة طلبت بعض التعديلات 📝 راجع الملاحظات أدناه وعدّل الملف</p>
                <div className="flex justify-center gap-2">
                  <Button className="rounded-lg gap-1.5" asChild><Link to="/portal/profile"><Edit className="h-4 w-4" /> تعديل الملف</Link></Button>
                  <Button variant="outline" className="rounded-lg gap-1.5" asChild><Link to="/portal/profile/submission"><Send className="h-4 w-4" /> إعادة الإرسال</Link></Button>
                </div>
              </>
            )}
            {status === "approved" && (
              <p className="text-sm text-muted-foreground">✅ ملفك معتمد ومنشور في دليل الجمعيات. يمكنك الآن نشر الوظائف</p>
            )}
            {status === "rejected" && (
              <p className="text-sm text-red-600 dark:text-red-400">تم رفض الملف. تواصل مع إدارة المنصة لمزيد من التفاصيل</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {reviews.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">سجل المراجعات</h3>
            </div>
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute right-[11px] top-2 bottom-2 w-px bg-border" />

              {reviews.map((r, idx) => {
                const rc = statusConfig[r.status] || statusConfig.draft;
                return (
                  <div key={r.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Dot */}
                    <div className={`relative z-10 mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full ${rc.dotClass} ring-4 ring-background`} />
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${rc.bgClass} ${rc.textClass} border-0 text-[11px] px-2.5 py-0.5 rounded-full`}>
                          {rc.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {r.notes && (
                        <div className="mt-2 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground leading-relaxed">
                          {r.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default PortalProfileStatus;
