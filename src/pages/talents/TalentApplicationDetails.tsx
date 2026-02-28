import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, Building2, CalendarDays, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const TalentApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [openingCv, setOpeningCv] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["talent-application-details", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, status, created_at, cv_file_url, cover_message, screening_answers, jobs:jobs!job_applications_job_id_fkey(id, title, slug_unique, city, remote_type, employment_type, summary, description, organizations(name_ar, logo_url))")
        .eq("id", id!)
        .eq("talent_user_id", user!.id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id && !!user?.id,
  });

  const openCv = async () => {
    if (!data?.cv_file_url) return;
    setOpeningCv(true);
    const { data: signed, error } = await supabase.storage.from("cvs").createSignedUrl(data.cv_file_url, 60 * 10);
    setOpeningCv(false);
    if (error || !signed?.signedUrl) {
      toast({ title: "تعذر فتح السيرة", description: error?.message || "حاول لاحقاً", variant: "destructive" });
      return;
    }
    window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">جارٍ تحميل الطلب...</div>;
  }

  if (!data) {
    return <div className="py-20 text-center text-muted-foreground">الطلب غير موجود</div>;
  }

  const job = data.jobs as any;
  const org = job?.organizations as any;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/talents/applications"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">تفاصيل الطلب</h1>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-foreground text-lg">{job?.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{org?.name_ar}</p>
            </div>
            <Badge variant="secondary">{statusLabel[data.status] || data.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(data.created_at).toLocaleDateString("ar-SA")}</span>
            {job?.city && <span>{job.city}</span>}
            {job?.remote_type && <span>{job.remote_type}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-foreground">معاينة الوظيفة</h3>
          {job?.summary && <p className="text-sm text-muted-foreground leading-relaxed">{job.summary}</p>}
          {job?.description && <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</p>}
          {!job?.summary && !job?.description && <p className="text-sm text-muted-foreground">لا توجد تفاصيل إضافية.</p>}
          <Button variant="outline" className="gap-2" asChild>
            <Link to={`/jobs/${job?.slug_unique || job?.id}`}>
              <ExternalLink className="h-4 w-4" /> فتح إعلان الوظيفة
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-foreground">ملفات وإجابات التقديم</h3>
          <Button onClick={openCv} disabled={openingCv || !data.cv_file_url} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> {openingCv ? "جارٍ الفتح..." : "فتح السيرة الذاتية"}
          </Button>

          {Array.isArray(data.screening_answers) && data.screening_answers.length > 0 ? (
            <div className="space-y-2">
              {(data.screening_answers as any[]).map((item, idx) => (
                <div key={idx} className="rounded-lg border bg-card p-3">
                  <p className="text-xs font-semibold text-foreground">{item.question || `سؤال ${idx + 1}`}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.answer || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد أسئلة فرز لهذا الطلب.</p>
          )}

          {data.cover_message && (
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-semibold text-foreground">رسالتك</p>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{data.cover_message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          حالة الطلب تتحدّث تلقائياً من جهة التوظيف.
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentApplicationDetails;
