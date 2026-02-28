import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const PortalApplications = () => {
  const { orgId } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");

  const { data: jobs } = useQuery({
    queryKey: ["portal-applications-jobs", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });

  const { data: rows, isLoading } = useQuery({
    queryKey: ["portal-applications", orgId, statusFilter, jobFilter],
    queryFn: async () => {
      let q = supabase
        .from("job_applications")
        .select("id, applicant_type, status, created_at, full_name, guest_full_name, job_id, jobs:jobs!job_applications_job_id_fkey(title)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") q = q.eq("status", statusFilter as any);
      if (jobFilter !== "all") q = q.eq("job_id", jobFilter);

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!orgId,
  });

  const hasRows = (rows?.length || 0) > 0;

  const summary = useMemo(() => ({
    total: rows?.length || 0,
    newOnes: (rows || []).filter((r) => r.status === "new").length,
  }), [rows]);

  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">الطلبات الواردة</h1>
        <p className="text-sm text-muted-foreground mt-0.5">تابع طلبات التقديم على وظائفك</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
          <p className="text-sm text-muted-foreground">إجمالي الطلبات: <span className="font-semibold text-foreground">{summary.total}</span> · الجديدة: <span className="font-semibold text-foreground">{summary.newOnes}</span></p>
          <div className="flex gap-2">
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="فلترة حسب الوظيفة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الوظائف</SelectItem>
                {(jobs || []).map((job) => <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="فلترة حسب الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">جارٍ تحميل الطلبات...</CardContent></Card>
      ) : hasRows ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المتقدم</TableHead>
                  <TableHead>الوظيفة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows!.map((row) => {
                  const applicantName = row.applicant_type === "talent" ? row.full_name : (row.guest_full_name || row.full_name || "زائر");
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{applicantName}</p>
                          <p className="text-xs text-muted-foreground">{row.applicant_type === "talent" ? "كوادر" : "زائر"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{(row.jobs as any)?.title || "—"}</TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell><Badge variant="secondary">{statusLabel[row.status] || row.status}</Badge></TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/portal/applications/${row.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground">ما وصلتك طلبات</h3>
            <p className="text-sm text-muted-foreground mt-1">تأكد أن لديك وظائف منشورة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortalApplications;
