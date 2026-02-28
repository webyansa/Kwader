import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Briefcase, Users, Edit, Send, AlertTriangle, CheckCircle2, Clock, Sparkles, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const profileStatusConfig: Record<string, { label: string; icon: any; className: string }> = {
  draft: { label: "مسودة – لم يُرسل بعد", icon: Edit, className: "text-muted-foreground bg-muted" },
  submitted: { label: "بانتظار مراجعة الإدارة", icon: Clock, className: "text-highlight bg-highlight/10" },
  changes_requested: { label: "مطلوب تعديلات", icon: AlertTriangle, className: "text-featured bg-featured/10" },
  approved: { label: "معتمد ✅", icon: CheckCircle2, className: "text-accent bg-accent/10" },
  rejected: { label: "مرفوض", icon: AlertTriangle, className: "text-destructive bg-destructive/10" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const PortalDashboard = () => {
  const { user, orgId } = useAuth();
  const [profileStatus, setProfileStatus] = useState("draft");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (!orgId) return;
    supabase.from("organizations").select("*").eq("id", orgId).single().then(({ data }) => {
      if (data) {
        setProfileStatus((data as any).profile_status || "draft");
        setProfileCompletion((data as any).profile_completion || 0);
        setOrgName(data.name_ar || "");
      }
    });
  }, [orgId]);

  const stats = [
    { label: "الوظائف المنشورة", value: "0", icon: Briefcase, color: "text-primary" },
    { label: "الطلبات الواردة", value: "0", icon: Users, color: "text-accent" },
    { label: "المشاهدات", value: "0", icon: Eye, color: "text-highlight" },
  ];

  const pCfg = profileStatusConfig[profileStatus] || profileStatusConfig.draft;
  const PIcon = pCfg.icon;

  const circumference = 2 * Math.PI * 42;

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Welcome */}
      <motion.div variants={item}>
        <div className="mb-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            أهلاً{orgName ? ` بـ${orgName}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة ملف الجمعية والوظائف من مكان واحد</p>
        </div>
      </motion.div>

      {/* Profile Status Widget */}
      <motion.div variants={item}>
        <Card className="border-border shadow-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pCfg.className}`}>
                    <PIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">حالة ملف الجمعية</p>
                    <p className="text-sm font-semibold text-foreground">{pCfg.label}</p>
                  </div>
                </div>

                {profileStatus !== "approved" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {profileStatus === "draft" ? "أكمل ملف الجمعية وأرسله للمراجعة عشان تظهر في دليل الجمعيات وتبدأ تنشر وظائف 🚀" :
                     profileStatus === "submitted" ? "ملفك قيد المراجعة. بنبلغك أول ما يصدر القرار ✨" :
                     profileStatus === "changes_requested" ? "الإدارة طلبت تعديلات. راجع الملاحظات وعدّل الملف 📝" :
                     "تم رفض الملف. تواصل مع الإدارة للتفاصيل."}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {(profileStatus === "draft" || profileStatus === "changes_requested" || profileStatus === "approved") && (
                    <Button size="sm" className="gap-1.5" asChild>
                      <Link to="/portal/profile"><Edit className="h-3.5 w-3.5" /> {profileStatus === "approved" ? "تحديث الملف" : "تعديل الملف"}</Link>
                    </Button>
                  )}
                  {(profileStatus === "submitted" || profileStatus === "changes_requested") && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/portal/profile/status">{profileStatus === "submitted" ? "تتبع المراجعة" : "عرض الملاحظات"}</Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Completion ring */}
              <div className="flex items-center justify-center p-6 sm:border-r border-t sm:border-t-0 border-border sm:min-w-[180px]">
                <div className="relative flex flex-col items-center gap-2">
                  <div className="relative h-24 w-24">
                    <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="hsl(var(--accent))"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={`${circumference * (1 - profileCompletion / 100)}`}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                      {profileCompletion}%
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">اكتمال الملف</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border shadow-card card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="border-dashed border-border shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-5">
              <Sparkles className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground">ابدأ بنشر أول وظيفة</h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-6 max-w-sm">أضف وظائف جمعيتك للوصول إلى أفضل الكوادر المؤهلة</p>
            <Button className="gap-2" asChild>
              <Link to="/portal/jobs/new">
                <Briefcase className="h-4 w-4" /> نشر وظيفة جديدة
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PortalDashboard;
