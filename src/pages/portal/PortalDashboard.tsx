import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Briefcase, Users, BarChart3, Edit, Send, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const profileStatusConfig: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  draft: { label: "مسودة – لم يُرسل بعد", icon: Edit, variant: "secondary", color: "text-muted-foreground" },
  submitted: { label: "بانتظار مراجعة الإدارة", icon: Clock, variant: "default", color: "text-amber-600" },
  changes_requested: { label: "مطلوب تعديلات", icon: AlertTriangle, variant: "destructive", color: "text-destructive" },
  approved: { label: "معتمد ✅", icon: CheckCircle2, variant: "default", color: "text-green-600" },
  rejected: { label: "مرفوض", icon: AlertTriangle, variant: "destructive", color: "text-destructive" },
};

const PortalDashboard = () => {
  const { user, orgId } = useAuth();
  const [profileStatus, setProfileStatus] = useState("draft");
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (!orgId) return;
    supabase.from("organizations").select("*").eq("id", orgId).single().then(({ data }) => {
      if (data) {
        setProfileStatus((data as any).profile_status || "draft");
        setProfileCompletion((data as any).profile_completion || 0);
      }
    });
  }, [orgId]);

  const stats = [
    { label: "الوظائف المنشورة", value: "0", icon: Briefcase, color: "text-primary" },
    { label: "الطلبات الواردة", value: "0", icon: Users, color: "text-accent" },
    { label: "المشاهدات", value: "0", icon: BarChart3, color: "text-muted-foreground" },
  ];

  const pCfg = profileStatusConfig[profileStatus] || profileStatusConfig.draft;
  const PIcon = pCfg.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">لوحة تحكم الكيان</h1>
          <p className="text-sm text-muted-foreground">مرحباً بك في بوابة إدارة التوظيف</p>
        </div>
      </div>

      {/* Profile Status Widget */}
      <Card className={profileStatus === "changes_requested" ? "border-destructive/30" : profileStatus === "approved" ? "border-green-300" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PIcon className={`h-5 w-5 ${pCfg.color}`} />
            حالة ملف الجمعية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={pCfg.variant}>{pCfg.label}</Badge>
            <span className="text-xs text-muted-foreground">اكتمال {profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />

          {profileStatus !== "approved" && (
            <p className="text-xs text-muted-foreground">
              {profileStatus === "draft" ? "أكمل ملف الجمعية وأرسله للمراجعة ليظهر في دليل الجمعيات." :
               profileStatus === "submitted" ? "ملف الجمعية قيد المراجعة من إدارة المنصة." :
               profileStatus === "changes_requested" ? "طلبت الإدارة بعض التعديلات. راجع الملاحظات وعدّل الملف." :
               "تم رفض الملف. تواصل مع الإدارة."}
            </p>
          )}

          <div className="flex gap-2">
            {(profileStatus === "draft" || profileStatus === "changes_requested") && (
              <Button size="sm" asChild>
                <Link to="/portal/profile"><Edit className="ml-1.5 h-3.5 w-3.5" /> تعديل الملف</Link>
              </Button>
            )}
            {profileStatus === "changes_requested" && (
              <Button size="sm" variant="outline" asChild>
                <Link to="/portal/profile/status">عرض الملاحظات</Link>
              </Button>
            )}
            {profileStatus === "submitted" && (
              <Button size="sm" variant="outline" asChild>
                <Link to="/portal/profile/status">تتبع المراجعة</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">ابدأ بنشر أول وظيفة</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">أضف وظائف كيانك للوصول إلى أفضل الكوادر</p>
          <Button asChild>
            <Link to="/portal/jobs/new">نشر وظيفة جديدة</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalDashboard;
