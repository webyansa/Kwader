import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Briefcase, Users, BarChart3, Edit, Send, AlertTriangle, CheckCircle2, Clock, ArrowLeft, Sparkles, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const profileStatusConfig: Record<string, { label: string; icon: any; bgClass: string; textClass: string; borderClass: string }> = {
  draft: { label: "مسودة – لم يُرسل بعد", icon: Edit, bgClass: "bg-muted/60", textClass: "text-muted-foreground", borderClass: "border-border" },
  submitted: { label: "بانتظار مراجعة الإدارة", icon: Clock, bgClass: "bg-blue-50 dark:bg-blue-950/30", textClass: "text-blue-600 dark:text-blue-400", borderClass: "border-blue-200 dark:border-blue-800" },
  changes_requested: { label: "مطلوب تعديلات", icon: AlertTriangle, bgClass: "bg-amber-50 dark:bg-amber-950/30", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-200 dark:border-amber-800" },
  approved: { label: "معتمد ✅", icon: CheckCircle2, bgClass: "bg-emerald-50 dark:bg-emerald-950/30", textClass: "text-emerald-600 dark:text-emerald-400", borderClass: "border-emerald-200 dark:border-emerald-800" },
  rejected: { label: "مرفوض", icon: AlertTriangle, bgClass: "bg-red-50 dark:bg-red-950/30", textClass: "text-red-600 dark:text-red-400", borderClass: "border-red-200 dark:border-red-800" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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
    { label: "الوظائف المنشورة", value: "0", icon: Briefcase, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "الطلبات الواردة", value: "0", icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent" },
    { label: "المشاهدات", value: "0", icon: Eye, iconBg: "bg-muted", iconColor: "text-muted-foreground" },
  ];

  const pCfg = profileStatusConfig[profileStatus] || profileStatusConfig.draft;
  const PIcon = pCfg.icon;

  const completionColor = profileCompletion >= 80 ? "text-emerald-500" : profileCompletion >= 50 ? "text-amber-500" : "text-primary";

  return (
    <motion.div className="space-y-8" variants={container} initial="hidden" animate="show">
      {/* Welcome */}
      <motion.div variants={item} className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          أهلاً{orgName ? ` بـ${orgName}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">هنا تقدر تدير ملف جمعيتك وتنشر وظائفك وتتابع الطلبات</p>
      </motion.div>

      {/* Profile Status Widget */}
      <motion.div variants={item}>
        <Card className={`${pCfg.borderClass} border overflow-hidden`}>
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Left: Status info */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pCfg.bgClass}`}>
                    <PIcon className={`h-5 w-5 ${pCfg.textClass}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">حالة ملف الجمعية</p>
                    <p className={`text-sm font-semibold ${pCfg.textClass}`}>{pCfg.label}</p>
                  </div>
                </div>

                {profileStatus !== "approved" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {profileStatus === "draft" ? "أكمل ملف الجمعية وأرسله للمراجعة عشان تظهر في دليل الجمعيات وتبدأ تنشر وظائف 🚀" :
                     profileStatus === "submitted" ? "ملفك قيد المراجعة من إدارة المنصة. بنبلغك أول ما يصدر القرار ✨" :
                     profileStatus === "changes_requested" ? "الإدارة طلبت بعض التعديلات. راجع الملاحظات وعدّل الملف عشان نكمل الاعتماد 📝" :
                     "تم رفض الملف. تواصل مع الإدارة للتفاصيل."}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {(profileStatus === "draft" || profileStatus === "changes_requested") && (
                    <Button size="sm" className="rounded-lg gap-1.5" asChild>
                      <Link to="/portal/profile"><Edit className="h-3.5 w-3.5" /> تعديل الملف</Link>
                    </Button>
                  )}
                  {profileStatus === "changes_requested" && (
                    <Button size="sm" variant="outline" className="rounded-lg" asChild>
                      <Link to="/portal/profile/status">عرض الملاحظات</Link>
                    </Button>
                  )}
                  {profileStatus === "submitted" && (
                    <Button size="sm" variant="outline" className="rounded-lg" asChild>
                      <Link to="/portal/profile/status">تتبع المراجعة</Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: Completion ring */}
              <div className="flex items-center justify-center p-6 sm:border-r border-t sm:border-t-0 border-border/50 sm:min-w-[180px]">
                <div className="relative flex flex-col items-center gap-2">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - profileCompletion / 100)}`}
                      className={`${completionColor} transition-all duration-700`}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${completionColor}`}>
                    {profileCompletion}%
                  </span>
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
          <Card key={stat.label} className="group hover:shadow-md transition-shadow duration-300 border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 mb-5">
              <Sparkles className="h-7 w-7 text-primary/60" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">ابدأ بنشر أول وظيفة</h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-6 max-w-sm">أضف وظائف جمعيتك للوصول إلى أفضل الكوادر المؤهلة في القطاع غير الربحي</p>
            <Button className="rounded-lg gap-2" asChild>
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
