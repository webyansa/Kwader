import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  ArrowRight, Pencil, Eye, Send, XCircle, ExternalLink, MapPin, Briefcase, Clock,
  Calendar, Users, GraduationCap, DollarSign, CheckCircle2, Loader2
} from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "مسودة", submitted: "بانتظار الاعتماد", under_review: "قيد المراجعة",
  approved: "معتمدة", rejected: "مرفوضة", published: "منشورة",
  expired: "مغلقة", archived: "مؤرشفة", changes_requested: "مطلوب تعديل",
};
const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  published: "bg-primary/10 text-primary",
  changes_requested: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  under_review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  expired: "bg-muted text-muted-foreground", archived: "bg-muted text-muted-foreground",
};
const empLabels: Record<string, string> = {
  full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", intern: "تدريب", consultant: "استشاري", volunteer: "تطوعي",
};
const remoteLabels: Record<string, string> = { onsite: "حضوري", remote: "عن بعد", hybrid: "هجين" };
const levelLabels: Record<string, string> = { junior: "مبتدئ", mid: "متوسط", senior: "خبير", leadership: "قيادي", any: "غير محدد" };

const PortalJobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["portal-job", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, city, slug), categories!jobs_category_id_fkey(name_ar)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("jobs").update({ status: "submitted" as any }).eq("id", id!);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        action: "job_submitted", entity_type: "job", entity_id: id, user_id: user?.id,
        details: { title: job?.title },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-job", id] });
      toast({ title: "تم إرسال الوظيفة للاعتماد ✓" });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("jobs").update({ status: "archived" as any }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-job", id] });
      toast({ title: "تم إغلاق الإعلان" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-[14px]" />
      </div>
    );
  }

  if (!job) {
    return <div className="py-20 text-center text-muted-foreground">الوظيفة غير موجودة</div>;
  }

  const canEdit = ["draft", "changes_requested"].includes(job.status as string);
  const canSubmit = ["draft", "changes_requested"].includes(job.status as string);
  const canClose = job.status === "published";

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-lg" asChild>
            <Link to="/portal/jobs"><ArrowRight className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
              <Badge className={`text-[10px] border-0 ${statusStyles[job.status]}`}>
                {statusLabels[job.status] || job.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              أُنشئت {new Date(job.created_at).toLocaleDateString("ar-SA")}
              {job.published_at && ` · نُشرت ${new Date(job.published_at).toLocaleDateString("ar-SA")}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]" asChild>
              <Link to={`/portal/jobs/${job.id}/edit`}><Pencil className="h-3.5 w-3.5" /> تعديل</Link>
            </Button>
          )}
          {canSubmit && (
            <Button size="sm" className="gap-1.5 rounded-[10px]" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              إرسال للاعتماد
            </Button>
          )}
          {canClose && (
            <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px] text-destructive" onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending}>
              <XCircle className="h-3.5 w-3.5" /> إغلاق الإعلان
            </Button>
          )}
          {job.status === "published" && job.slug_unique && (
            <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]" asChild>
              <a href={`/jobs/${job.slug_unique}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> فتح الرابط
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Moderation notes */}
      {job.moderation_notes && ((job.status as string) === "changes_requested" || job.status === "rejected") && (
        <div className={`rounded-[14px] border px-5 py-4 ${
          job.status === "rejected" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40" : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40"
        }`}>
          <p className="text-sm font-medium text-foreground mb-1">{job.status === "rejected" ? "سبب الرفض:" : "ملاحظات الإدارة:"}</p>
          <p className="text-sm text-muted-foreground">{job.moderation_notes}</p>
        </div>
      )}

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {job.summary && (
            <Card className="rounded-[14px]">
              <CardContent className="p-6">
                <h2 className="font-bold text-foreground mb-2">ملخص الوظيفة</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{job.summary}</p>
              </CardContent>
            </Card>
          )}
          {job.description && (
            <Card className="rounded-[14px]">
              <CardContent className="p-6">
                <h2 className="font-bold text-foreground mb-2">الوصف الوظيفي</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</div>
              </CardContent>
            </Card>
          )}
          {job.responsibilities && (
            <Card className="rounded-[14px]">
              <CardContent className="p-6">
                <h2 className="font-bold text-foreground mb-2">المسؤوليات</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.responsibilities}</div>
              </CardContent>
            </Card>
          )}
          {job.requirements && (
            <Card className="rounded-[14px]">
              <CardContent className="p-6">
                <h2 className="font-bold text-foreground mb-2">المتطلبات</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.requirements}</div>
              </CardContent>
            </Card>
          )}
          {job.skills && (job.skills as string[]).length > 0 && (
            <Card className="rounded-[14px]">
              <CardContent className="p-6">
                <h2 className="font-bold text-foreground mb-3">المهارات</h2>
                <div className="flex flex-wrap gap-2">
                  {(job.skills as string[]).map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="rounded-[14px]">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-foreground text-sm">تفاصيل الوظيفة</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" /><span>{job.city || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>{empLabels[job.employment_type] || job.employment_type} · {remoteLabels[job.remote_type] || job.remote_type}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>المستوى: {levelLabels[job.experience_level] || job.experience_level}</span>
                </div>
                {job.vacancies && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" /><span>{job.vacancies} شاغر</span>
                  </div>
                )}
                {job.education && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4 shrink-0" /><span>{job.education}</span>
                  </div>
                )}
                {job.closing_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>يُغلق: {new Date(job.closing_date).toLocaleDateString("ar-SA")}</span>
                  </div>
                )}
                {job.salary_display !== "hidden" && (job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span>
                      {job.salary_min && Number(job.salary_min).toLocaleString("ar-SA")}
                      {job.salary_min && job.salary_max && " - "}
                      {job.salary_max && Number(job.salary_max).toLocaleString("ar-SA")} ر.س
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {job.benefits && (job.benefits as string[]).length > 0 && (
            <Card className="rounded-[14px]">
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground text-sm mb-3">المزايا</h3>
                <div className="flex flex-wrap gap-2">
                  {(job.benefits as string[]).map((b, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{b}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PortalJobDetails;
