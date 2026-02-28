import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Briefcase, Users, Edit, Send, AlertTriangle, CheckCircle2, Clock, Sparkles, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const profileStatusConfig: Record<string, { label: string; icon: any; bgClass: string; textClass: string; borderClass: string }> = {
  draft: { label: "مسودة – لم يُرسل بعد", icon: Edit, bgClass: "bg-secondary", textClass: "text-muted-foreground", borderClass: "border-border/60" },
  submitted: { label: "بانتظار مراجعة الإدارة", icon: Clock, bgClass: "bg-highlight/10", textClass: "text-highlight", borderClass: "border-highlight/20" },
  changes_requested: { label: "مطلوب تعديلات", icon: AlertTriangle, bgClass: "bg-featured/10", textClass: "text-featured", borderClass: "border-featured/20" },
  approved: { label: "معتمد ✅", icon: CheckCircle2, bgClass: "bg-accent/10", textClass: "text-accent", borderClass: "border-accent/20" },
  rejected: { label: "مرفوض", icon: AlertTriangle, bgClass: "bg-destructive/10", textClass: "text-destructive", borderClass: "border-destructive/20" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

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
    { label: "الوظائف المنشورة", value: "0", icon: Briefcase, iconBg: "bg-primary/8", iconColor: "text-primary" },
    { label: "الطلبات الواردة", value: "0", icon: Users, iconBg: "bg-accent/8", iconColor: "text-accent" },
    { label: "المشاهدات", value: "0", icon: Eye, iconBg: "bg-highlight/8", iconColor: "text-highlight" },
  ];

  const pCfg = profileStatusConfig[profileStatus] || profileStatusConfig.draft;
  const PIcon = pCfg.icon;

  const completionRing = (size: number, strokeW: number, radius: number) => (
    <svg className={`h-${size} w-${size} -rotate-90`} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeW} />
      <circle
        cx="50" cy="50" r={radius} fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={`${2 * Math.PI * radius}`}
        strokeDashoffset={`${2 * Math.PI * radius * (1 - profileCompletion / 100)}`}
        className="transition-all duration-700"
      />
    </svg>
  );

  return (
    <motion.div className="space-y-7" variants={container} initial="hidden" animate="show">
      {/* Welcome */}
      <motion.div variants={item}>
        <Card className="border-border/60 shadow-card overflow-hidden">
          <CardContent className="relative p-6 md:p-7">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-accent to-highlight" />
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              أهلاً{orgName ? ` بـ${orgName}` : ""} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">لوحة تحكم لإدارة ملف الجمعية والوظائف بخطوات واضحة وسريعة</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Status Widget */}
      <motion.div variants={item}>
        <Card className={`${pCfg.borderClass} border shadow-card overflow-hidden`}>
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
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
                  {(profileStatus === "draft" || profileStatus === "changes_requested" || profileStatus === "approved") && (
                    <Button size="sm" className="rounded-xl gap-1.5" asChild>
                      <Link to="/portal/profile"><Edit className="h-3.5 w-3.5" /> {profileStatus === "approved" ? "تحديث الملف" : "تعديل الملف"}</Link>
                    </Button>
                  )}
                  {profileStatus === "changes_requested" && (
                    <Button size="sm" variant="outline" className="rounded-xl" asChild>
                      <Link to="/portal/profile/status">عرض الملاحظات</Link>
                    </Button>
                  )}
                  {profileStatus === "submitted" && (
                    <Button size="sm" variant="outline" className="rounded-xl" asChild>
                      <Link to="/portal/profile/status">تتبع المراجعة</Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Completion ring */}
              <div className="flex items-center justify-center p-6 sm:border-r border-t sm:border-t-0 border-border/40 sm:min-w-[180px]">
                <div className="relative flex flex-col items-center gap-2">
                  <div className="h-24 w-24">
                    {completionRing(24, 5, 42)}
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-accent">
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
          <Card key={stat.label} className="group border-border/60 shadow-card card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground/20" />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="border-dashed border-border/60 shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/8 mb-5">
              <Sparkles className="h-7 w-7 text-accent/60" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">ابدأ بنشر أول وظيفة</h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-6 max-w-sm">أضف وظائف جمعيتك للوصول إلى أفضل الكوادر المؤهلة في القطاع غير الربحي</p>
            <Button className="rounded-xl gap-2" asChild>
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
