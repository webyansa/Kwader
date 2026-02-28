import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Briefcase, Plus, Eye, Pencil, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const statusTabs = [
  { key: "all", label: "الكل" },
  { key: "draft", label: "مسودات" },
  { key: "submitted", label: "بانتظار الاعتماد" },
  { key: "under_review", label: "قيد المراجعة" },
  { key: "approved", label: "معتمدة" },
  { key: "published", label: "منشورة" },
  { key: "rejected", label: "مرفوضة" },
  { key: "expired", label: "مغلقة" },
  { key: "archived", label: "مؤرشفة" },
];

const statusLabels: Record<string, string> = {
  draft: "مسودة", submitted: "بانتظار الاعتماد", under_review: "قيد المراجعة",
  approved: "معتمدة", rejected: "مرفوضة", published: "منشورة",
  expired: "مغلقة", archived: "مؤرشفة", suspended: "موقوفة",
  changes_requested: "مطلوب تعديل",
};

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  under_review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  published: "bg-primary/10 text-primary",
  expired: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  suspended: "bg-red-100 text-red-700",
  changes_requested: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const PortalJobs = () => {
  const { orgId } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["portal-jobs", orgId, activeTab],
    queryFn: async () => {
      if (!orgId) return [];
      let q = supabase
        .from("jobs")
        .select("id, title, status, city, employment_type, created_at, updated_at, published_at, views_count, slug_unique, is_urgent, is_featured, moderation_notes")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (activeTab !== "all") q = q.eq("status", activeTab as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const empLabels: Record<string, string> = {
    full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد",
    intern: "تدريب", consultant: "استشاري", volunteer: "تطوعي",
  };

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      {/* Banner */}
      <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20 px-4 py-3">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">جميع الوظائف تمر باعتماد الإدارة قبل النشر في الموقع العام</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">الوظائف</h1>
          <p className="text-sm text-muted-foreground mt-0.5">أنشئ وأدر إعلانات التوظيف الخاصة بجمعيتك</p>
        </div>
        <Button className="gap-1.5 rounded-[10px]" asChild>
          <Link to="/portal/jobs/new"><Plus className="h-4 w-4" /> نشر وظيفة جديدة</Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
            {jobs && tab.key !== "all" && (
              <span className="mr-1 text-[10px] opacity-70">
                ({jobs.filter(j => j.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-[14px]" />)}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="border-border/60 rounded-[14px] shadow-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={`text-[10px] border-0 ${statusStyles[job.status] || "bg-muted"}`}>
                        {statusLabels[job.status] || job.status}
                      </Badge>
                      {job.is_urgent && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] border-0">عاجلة</Badge>}
                      {job.is_featured && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] border-0">مميزة</Badge>}
                    </div>
                    <h3 className="font-bold text-foreground truncate">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {job.city && <span>{job.city}</span>}
                      <span>{empLabels[job.employment_type] || job.employment_type}</span>
                      <span>{new Date(job.updated_at || job.created_at).toLocaleDateString("ar-SA")}</span>
                      {job.views_count > 0 && <span>{job.views_count} مشاهدة</span>}
                    </div>
                    {(job.status as string) === "changes_requested" && job.moderation_notes && (
                      <div className="mt-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 px-3 py-2">
                        <p className="text-xs text-orange-700 dark:text-orange-400">ملاحظات الإدارة: {job.moderation_notes}</p>
                      </div>
                    )}
                    {(job.status as string) === "rejected" && job.moderation_notes && (
                      <div className="mt-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-3 py-2">
                        <p className="text-xs text-red-700 dark:text-red-400">سبب الرفض: {job.moderation_notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild title="عرض">
                      <Link to={`/portal/jobs/${job.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    {["draft", "changes_requested"].includes(job.status as string) && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild title="تعديل">
                        <Link to={`/portal/jobs/${job.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                    )}
                    {job.status === "published" && job.slug_unique && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild title="فتح الرابط">
                        <a href={`/jobs/${job.slug_unique}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border shadow-card rounded-[14px]">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">لا توجد وظائف {activeTab !== "all" ? "بهذه الحالة" : "بعد"}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">ابدأ بنشر أول وظيفة للوصول إلى الكوادر المؤهلة</p>
            {activeTab === "all" && (
              <Button className="mt-5 gap-1.5 rounded-[10px]" asChild>
                <Link to="/portal/jobs/new"><Plus className="h-4 w-4" /> نشر وظيفة جديدة</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default PortalJobs;
