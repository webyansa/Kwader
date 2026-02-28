import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertTriangle, XCircle, Edit, Send } from "lucide-react";

const statusConfig: Record<string, { icon: any; label: string; color: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { icon: Edit, label: "مسودة", color: "text-muted-foreground", variant: "secondary" },
  submitted: { icon: Clock, label: "بانتظار المراجعة", color: "text-amber-600", variant: "default" },
  changes_requested: { icon: AlertTriangle, label: "مطلوب تعديلات", color: "text-destructive", variant: "destructive" },
  approved: { icon: CheckCircle2, label: "معتمد ✅", color: "text-green-600", variant: "default" },
  rejected: { icon: XCircle, label: "مرفوض", color: "text-destructive", variant: "destructive" },
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-foreground">حالة مراجعة الملف</h1>

      <Card>
        <CardContent className="py-8 text-center">
          <Icon className={`mx-auto h-12 w-12 ${cfg.color} mb-3`} />
          <Badge variant={cfg.variant} className="text-sm px-4 py-1">{cfg.label}</Badge>
          
          {status === "draft" && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-3">لم يتم إرسال الملف بعد</p>
              <Button asChild><Link to="/portal/profile">تعديل وإكمال الملف</Link></Button>
            </div>
          )}
          {status === "submitted" && (
            <p className="mt-4 text-sm text-muted-foreground">ملف الجمعية قيد المراجعة من إدارة المنصة. سنبلغك فور صدور القرار.</p>
          )}
          {status === "changes_requested" && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-3">طلبت الإدارة بعض التعديلات. يرجى مراجعة الملاحظات أدناه وتحديث الملف.</p>
              <div className="flex justify-center gap-2">
                <Button asChild><Link to="/portal/profile"><Edit className="ml-1.5 h-4 w-4" /> تعديل الملف</Link></Button>
                <Button variant="outline" asChild><Link to="/portal/profile/submission"><Send className="ml-1.5 h-4 w-4" /> إعادة الإرسال</Link></Button>
              </div>
            </div>
          )}
          {status === "approved" && (
            <p className="mt-4 text-sm text-muted-foreground">ملفك معتمد ومنشور في دليل الجمعيات. يمكنك الآن نشر الوظائف.</p>
          )}
          {status === "rejected" && (
            <p className="mt-4 text-sm text-destructive/80">تم رفض الملف. تواصل مع إدارة المنصة لمزيد من التفاصيل.</p>
          )}
        </CardContent>
      </Card>

      {/* Review history */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">سجل المراجعات</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((r) => {
              const rc = statusConfig[r.status] || statusConfig.draft;
              return (
                <div key={r.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={rc.variant} className="text-xs">{rc.label}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-SA")}</span>
                  </div>
                  {r.notes && (
                    <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded p-2">{r.notes}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortalProfileStatus;
