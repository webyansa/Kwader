import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";

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

const AdminApplications = () => {
  const [orgFilter, setOrgFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-applications", orgFilter, jobFilter, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("job_applications")
        .select("id, applicant_type, status, created_at, full_name, guest_full_name, organization_id, job_id, jobs:jobs!job_applications_job_id_fkey(title), organizations:organizations!job_applications_organization_id_fkey(name_ar)")
        .order("created_at", { ascending: false });

      if (orgFilter !== "all") q = q.eq("organization_id", orgFilter);
      if (jobFilter !== "all") q = q.eq("job_id", jobFilter);
      if (statusFilter !== "all") q = q.eq("status", statusFilter as any);

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: organizations } = useQuery({
    queryKey: ["admin-applications-org-filters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("id, name_ar").order("name_ar");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ["admin-applications-job-filters", orgFilter],
    queryFn: async () => {
      let q = supabase.from("jobs").select("id, title").order("created_at", { ascending: false }).limit(300);
      if (orgFilter !== "all") q = q.eq("org_id", orgFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (!applications) return [];
    if (!search.trim()) return applications;
    const s = search.trim().toLowerCase();
    return applications.filter((row) => {
      const applicantName = row.applicant_type === "talent" ? row.full_name : (row.guest_full_name || row.full_name);
      return (
        applicantName?.toLowerCase().includes(s) ||
        row.jobs?.title?.toLowerCase().includes(s) ||
        row.organizations?.name_ar?.toLowerCase().includes(s)
      );
    });
  }, [applications, search]);

  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">طلبات التقديم</h1>
        <p className="text-sm text-muted-foreground mt-1">عرض شامل لجميع طلبات التقديم مع الفلاتر</p>
      </div>

      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-4">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالمتقدم/الوظيفة/الجمعية" />
          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger><SelectValue placeholder="الجمعية" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الجمعيات</SelectItem>
              {(organizations || []).map((org) => <SelectItem key={org.id} value={org.id}>{org.name_ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger><SelectValue placeholder="الوظيفة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الوظائف</SelectItem>
              {(jobs || []).map((job) => <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المتقدم</TableHead>
                <TableHead>الوظيفة</TableHead>
                <TableHead>الجمعية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">جارٍ التحميل...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">لا توجد طلبات مطابقة</TableCell></TableRow>
              ) : (
                filtered.map((row) => {
                  const applicantName = row.applicant_type === "talent" ? row.full_name : (row.guest_full_name || row.full_name);
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{applicantName || "بدون اسم"}</p>
                          <p className="text-xs text-muted-foreground">{row.applicant_type === "talent" ? "كوادر" : "زائر"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{row.jobs?.title || "—"}</TableCell>
                      <TableCell>{row.organizations?.name_ar || "—"}</TableCell>
                      <TableCell><Badge variant="secondary">{statusLabel[row.status] || row.status}</Badge></TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/applications/${row.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">إجمالي النتائج: {filtered.length}</p>
    </div>
  );
};

export default AdminApplications;
