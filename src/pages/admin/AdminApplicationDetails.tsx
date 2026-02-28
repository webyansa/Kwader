import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ExternalLink, FileText } from "lucide-react";

const statusLabel: Record<string, string> = {
  new: "جديد",
  reviewed: "قيد المراجعة",
  in_review: "قيد المراجعة",
  shortlisted: "قائمة مختصرة",
  interview: "مقابلة",
  offer: "عرض وظيفي",
  rejected: "مرفوض",
  hired: "تم التوظيف",
};

const progression: Record<string, string> = {
  new: "in_review",
  reviewed: "shortlisted",
  in_review: "shortlisted",
  shortlisted: "interview",
  interview: "offer",
  offer: "hired",
};

const AdminApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-application-details", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, status, created_at, updated_at, applicant_type, talent_user_id, created_by_user_id, source, cv_file_url, full_name, email, phone, city, guest_full_name, guest_email, guest_mobile, cover_message, screening_answers, job_id, organization_id, jobs:jobs!job_applications_job_id_fkey(title, slug_unique), organizations:organizations!job_applications_organization_id_fkey(name_ar)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: logs } = useQuery({
    queryKey: ["admin-application-logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, created_at, details, user_id")
        .eq("entity_type", "job_application")
        .eq("entity_id", id!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: status as any, updated_at: new Date().toISOString() })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-application-details", id] });
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "تم تحديث الحالة ✅" });
      setSelectedStatus("");
    },
    onError: (e: any) => toast({ title: "تعذر تحديث الحالة", description: e.message, variant: "destructive" }),
  });

  const nextStatus = useMemo(() => (data ? progression[data.status] : undefined), [data]);

  const openCv = async () => {
    if (!data?.cv_file_url) return;
    const { data: signed, error } = await supabase.storage.from("cvs").createSignedUrl(data.cv_file_url, 60 * 10);
    if (error || !signed?.signedUrl) {
      toast({ title: "تعذر فتح السيرة", description: error?.message || "حاول لاحقاً", variant: "destructive" });
      return;
    }
    window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">جارٍ تحميل الطلب...</div>;
  if (!data) return <div className="py-20 text-center text-muted-foreground">الطلب غير موجود</div>;

  const applicantName = data.applicant_type === "talent" ? data.full_name : (data.guest_full_name || data.full_name);
  const applicantEmail = data.applicant_type === "talent" ? data.email : (data.guest_email || data.email);
  const applicantMobile = data.applicant_type === "talent" ? data.phone : (data.guest_mobile || data.phone);
  const job = data.jobs as any;
  const org = data.organizations as any;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/applications"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">تفاصيل طلب التقديم</h1>
      </div>

      <Card>
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">الوظيفة</p>
            <h2 className="font-semibold text-foreground">{job?.title || "—"}</h2>
            <p className="text-sm text-muted-foreground mt-1">{org?.name_ar || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{statusLabel[data.status] || data.status}</Badge>
            {job?.slug_unique && (
              <Button size="sm" variant="outline" asChild className="gap-1">
                <a href={`/jobs/${job.slug_unique}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /> الإعلان</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground">بيانات المتقدم</h3>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">الاسم</p><p className="font-medium text-foreground">{applicantName || "—"}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">النوع</p><p className="font-medium text-foreground">{data.applicant_type === "talent" ? "كوادر" : "زائر"}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">البريد</p><p className="font-medium text-foreground">{applicantEmail || "—"}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">الجوال</p><p className="font-medium text-foreground">{applicantMobile || "—"}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">المدينة</p><p className="font-medium text-foreground">{data.city || "—"}</p></div>
              <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">المصدر</p><p className="font-medium text-foreground">{data.source === "portal" ? "PORTAL" : "WEB"}</p></div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={openCv} className="gap-2"><FileText className="h-4 w-4" /> فتح السيرة الذاتية</Button>
            </div>

            {Array.isArray(data.screening_answers) && data.screening_answers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">إجابات الفرز</h4>
                {(data.screening_answers as any[]).map((item, idx) => (
                  <div key={idx} className="rounded-lg border p-3">
                    <p className="text-xs font-semibold text-foreground">{item.question || `سؤال ${idx + 1}`}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.answer || "—"}</p>
                  </div>
                ))}
              </div>
            )}

            {data.cover_message && (
              <div className="rounded-lg border p-3">
                <p className="text-xs font-semibold text-foreground">رسالة التقديم</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{data.cover_message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground">إجراءات الحالة</h3>
              {nextStatus && data.status !== "rejected" && data.status !== "hired" && (
                <Button className="w-full" onClick={() => updateMutation.mutate(nextStatus)} disabled={updateMutation.isPending}>
                  نقل إلى: {statusLabel[nextStatus] || nextStatus}
                </Button>
              )}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="اختر حالة" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full" disabled={!selectedStatus || updateMutation.isPending} onClick={() => updateMutation.mutate(selectedStatus)}>تحديث الحالة</Button>
              <Button variant="destructive" className="w-full" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate("rejected")}>رفض</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-semibold text-foreground">Audit Logs</h3>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-2.5">
                    <p className="text-xs font-medium text-foreground">{log.action}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(log.created_at).toLocaleString("ar-SA")}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد سجلات.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetails;
