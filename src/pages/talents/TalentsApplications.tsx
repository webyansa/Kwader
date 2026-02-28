import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Briefcase, Building2, CalendarDays, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const TalentsApplications = () => {
  const { user } = useAuth();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["talent-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, status, created_at, job_id, jobs:jobs!job_applications_job_id_fkey(id, title, slug_unique, organizations(name_ar, logo_url))")
        .eq("talent_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">جارٍ تحميل الطلبات...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">طلباتي</h1>
          <p className="text-sm text-muted-foreground">تابع حالة الطلبات التي أرسلتها</p>
        </div>
      </div>

      {rows && rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((app) => {
            const job = app.jobs;
            const org = job?.organizations;
            return (
              <Card key={app.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{statusLabel[app.status] || app.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{job?.title || "وظيفة"}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{org?.name_ar || "—"}</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(app.created_at).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/talent/applications/${app.id}`}>
                        <Eye className="h-4 w-4 ml-1" /> عرض التفاصيل
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground">ما عندك طلبات حتى الآن</h3>
            <p className="text-sm text-muted-foreground mt-1">قدّم على أول وظيفة من وظائف القطاع</p>
            <Button className="mt-5" asChild>
              <Link to="/sector-jobs">تصفح وظائف القطاع</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TalentsApplications;
