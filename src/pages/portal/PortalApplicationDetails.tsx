import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

const PortalApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["portal-application-details", id, orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, status, created_at, cv_file_url, applicant_type, full_name, email, phone, city, guest_full_name, guest_email, guest_mobile, cover_message, screening_answers, jobs:jobs!job_applications_job_id_fkey(id, title, slug_unique)")
        .eq("id", id!)
        .eq("organization_id", orgId!)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id && !!orgId,
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
      qc.invalidateQueries({ queryKey: ["portal-application-details", id, orgId] });
      qc.invalidateQueries({ queryKey: ["portal-applications", orgId] });
      toast({ title: "تم تحديث حالة الطلب ✅" });
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

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/portal/applications"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">تفاصيل الطلب</h1>
      </div>

      <Card>
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">الوظيفة</p>
            <h2 className="font-semibold text-foreground">{job?.title || "—"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{statusLabel[data.status] || data.status}</Badge>
            {job?.slug_unique && (
              <Button variant="outline" size="sm" asChild className="gap-1">
                <a href={`/jobs/${job.slug_unique}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /> الإعلان</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground">معلومات المتقدم</h3>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">الاسم</p>
                <p className="font-medium text-foreground">{applicantName || "—"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">نوع المتقدم</p>
                <p className="font-medium text-foreground">{data.applicant_type === "talent" ? "كوادر" : "زائر"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">البريد</p>
                <p className="font-medium text-foreground">{applicantEmail || "—"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">الجوال</p>
                <p className="font-medium text-foreground">{applicantMobile || "—"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={openCv}><FileText className="h-4 w-4" /> فتح السيرة الذاتية</Button>
            </div>

            {Array.isArray(data.screening_answers) && data.screening_answers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">إجابات أسئلة الفرز</h4>
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

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">إدارة الحالة</h3>
            {nextStatus && data.status !== "rejected" && data.status !== "hired" && (
              <Button className="w-full" onClick={() => updateMutation.mutate(nextStatus)} disabled={updateMutation.isPending}>
                نقل إلى: {statusLabel[nextStatus] || nextStatus}
              </Button>
            )}

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="اختر حالة" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statusLabel).map((status) => (
                  <SelectItem key={status} value={status}>{statusLabel[status]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full" disabled={!selectedStatus || updateMutation.isPending} onClick={() => updateMutation.mutate(selectedStatus)}>
              تحديث الحالة
            </Button>
            <Button variant="destructive" className="w-full" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate("rejected")}>
              رفض
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortalApplicationDetails;
