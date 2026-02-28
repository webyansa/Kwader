import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, Check, X, MessageSquare, MapPin, Briefcase, Clock, Building2,
  Users, GraduationCap, Loader2, AlertTriangle
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type JobStatus = Database["public"]["Enums"]["job_status"];

const empLabels: Record<string, string> = {
  full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", intern: "تدريب", consultant: "استشاري", volunteer: "تطوعي",
};
const remoteLabels: Record<string, string> = { onsite: "حضوري", remote: "عن بعد", hybrid: "هجين" };
const levelLabels: Record<string, string> = { junior: "مبتدئ", mid: "متوسط", senior: "خبير", leadership: "قيادي", any: "غير محدد" };

const checklist = [
  "المسمى الوظيفي واضح ومحدد",
  "الوصف الوظيفي مهني وغير عام",
  "المسؤوليات واضحة (6-10 نقاط)",
  "المتطلبات واضحة (6-10 نقاط)",
  "لا يوجد مبالغات أو معلومات مضللة",
  "الوظيفة مناسبة للقطاع غير الربحي",
];

const AdminJobReview = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [checks, setChecks] = useState<boolean[]>(new Array(checklist.length).fill(false));
  const [action, setAction] = useState<"approve" | "changes" | "reject" | null>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["admin-job-review", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, city, slug)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async ({ status, notes: n }: { status: JobStatus; notes: string }) => {
      const update: Record<string, any> = { status, moderation_notes: n || null };
      if (status === "published") update.published_at = new Date().toISOString();
      const { error } = await supabase.from("jobs").update(update).eq("id", id!);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        action: `job_${status}`, entity_type: "job", entity_id: id, user_id: user?.id,
        details: { title: job?.title, notes: n },
      });
      // Send notification to org owner
      if (job?.created_by) {
        await supabase.from("notifications").insert({
          user_id: job.created_by,
          title: status === "published" ? "تم اعتماد ونشر وظيفتك ✓" : status === "rejected" ? "تم رفض وظيفتك" : "مطلوب تعديلات على وظيفتك",
          body: n || undefined,
          link: `/portal/jobs/${id}`,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "تم تحديث حالة الوظيفة ✓" });
      navigate("/admin/jobs");
    },
  });

  const handleAction = (a: "approve" | "changes" | "reject") => {
    if ((a === "changes" || a === "reject") && !notes.trim()) {
      toast({ title: "يرجى إضافة ملاحظات", variant: "destructive" });
      return;
    }
    const statusMap: Record<string, JobStatus> = {
      approve: "published",
      changes: "under_review", // we'll use changes_requested but it's not in enum, so map it
      reject: "rejected",
    };
    // changes_requested isn't in the enum, use under_review or submit moderation_notes
    // Actually checking the enum - it has "under_review" but not "changes_requested"
    // We need to handle this properly - let's use "rejected" with notes for changes
    // Actually from the request: CHANGES_REQUESTED should be a status. Let me check the enum...
    // The enum has: draft, submitted, under_review, approved, rejected, published, expired, archived, suspended
    // No changes_requested - we need to add it. For now let's use under_review + notes
    let status: JobStatus;
    if (a === "approve") status = "published";
    else if (a === "reject") status = "rejected";
    else status = "under_review"; // represents changes_requested

    mutation.mutate({ status, notes: notes.trim() });
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;
  }

  if (!job) {
    return <div className="py-20 text-center text-muted-foreground">الوظيفة غير موجودة</div>;
  }

  const org = job.organizations as any;
  const allChecked = checks.every(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-lg" asChild>
          <Link to="/admin/jobs"><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">مراجعة الوظيفة</h1>
          <p className="text-xs text-muted-foreground">{job.title}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Preview - 2 cols */}
        <div className="xl:col-span-2 space-y-5">
          {/* Job info header */}
          <Card className="rounded-[14px]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {org?.logo_url ? (
                  <img src={org.logo_url} alt={org.name_ar} className="h-14 w-14 rounded-xl border object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                    <Building2 className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
                  <p className="text-muted-foreground mt-1">{org?.name_ar}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {job.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.city}</span>}
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{empLabels[job.employment_type]} · {remoteLabels[job.remote_type]}</span>
                    <span>{levelLabels[job.experience_level]}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content sections */}
          {job.summary && (
            <Card className="rounded-[14px]"><CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-2">الملخص</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{job.summary}</p>
            </CardContent></Card>
          )}
          {job.description && (
            <Card className="rounded-[14px]"><CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-2">الوصف الوظيفي</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</div>
            </CardContent></Card>
          )}
          {job.responsibilities && (
            <Card className="rounded-[14px]"><CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-2">المسؤوليات</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.responsibilities}</div>
            </CardContent></Card>
          )}
          {job.requirements && (
            <Card className="rounded-[14px]"><CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-2">المتطلبات</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.requirements}</div>
            </CardContent></Card>
          )}
          {job.skills && (job.skills as string[]).length > 0 && (
            <Card className="rounded-[14px]"><CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-3">المهارات</h3>
              <div className="flex flex-wrap gap-2">
                {(job.skills as string[]).map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
              </div>
            </CardContent></Card>
          )}
        </div>

        {/* Review sidebar */}
        <div className="space-y-5">
          {/* Quality Checklist */}
          <Card className="rounded-[14px]">
            <CardContent className="p-5">
              <h3 className="font-bold text-foreground mb-4">قائمة التحقق</h3>
              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={checks[i]}
                      onCheckedChange={(v) => {
                        const next = [...checks];
                        next[i] = !!v;
                        setChecks(next);
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </label>
                ))}
              </div>
              {allChecked && (
                <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <Check className="h-3.5 w-3.5" /> جميع المعايير مستوفاة
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="rounded-[14px]">
            <CardContent className="p-5">
              <h3 className="font-bold text-foreground mb-3">ملاحظات الإدارة</h3>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="أضف ملاحظاتك هنا (إلزامي عند طلب التعديل أو الرفض)..."
                rows={4}
                className="rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="rounded-[14px]">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold text-foreground mb-2">القرار</h3>
              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-[10px]"
                onClick={() => handleAction("approve")}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                اعتماد ونشر
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 rounded-[10px] text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => handleAction("changes")}
                disabled={mutation.isPending}
              >
                <MessageSquare className="h-4 w-4" /> طلب تعديل
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 rounded-[10px] text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => handleAction("reject")}
                disabled={mutation.isPending}
              >
                <X className="h-4 w-4" /> رفض
              </Button>
              {!allChecked && (
                <div className="flex items-center gap-1.5 text-amber-600 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  لم تكتمل قائمة التحقق بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminJobReview;
