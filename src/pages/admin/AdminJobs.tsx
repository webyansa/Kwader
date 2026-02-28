import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Star, Zap, MapPin, Calendar, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type JobStatus = Database["public"]["Enums"]["job_status"];

const statusLabels: Record<string, string> = {
  draft: "مسودة", submitted: "مقدمة", under_review: "قيد المراجعة",
  approved: "معتمدة", rejected: "مرفوضة", published: "منشورة",
  expired: "منتهية", archived: "مؤرشفة", suspended: "موقوفة",
};

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-100 text-amber-700",
  under_review: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  published: "bg-primary/10 text-primary",
  expired: "bg-slate-100 text-slate-500",
  archived: "bg-slate-100 text-slate-500",
  suspended: "bg-red-100 text-red-700",
};

const AdminJobs = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, city)")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter as JobStatus);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: JobStatus; notes?: string }) => {
      const update: Record<string, any> = { status, moderation_notes: notes || null };
      if (status === "published") update.published_at = new Date().toISOString();
      const { error } = await supabase.from("jobs").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "✅ تم تحديث حالة الوظيفة بنجاح" });
      setSelectedJob(null);
      setModerationNotes("");
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase.from("jobs").update({ [field]: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });

  const pendingCount = jobs?.filter((j) => j.status === "submitted" || j.status === "under_review").length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">إدارة الوظائف</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {jobs?.length ?? 0} وظيفة
            {pendingCount > 0 && <span className="text-amber-600 font-medium"> · {pendingCount} بانتظار المراجعة</span>}
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="فلترة حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">الوظيفة</TableHead>
                <TableHead className="font-bold">الجمعية</TableHead>
                <TableHead className="font-bold">الحالة</TableHead>
                <TableHead className="font-bold text-center">مميزة</TableHead>
                <TableHead className="font-bold text-center">عاجلة</TableHead>
                <TableHead className="font-bold text-center">المشاهدات</TableHead>
                <TableHead className="font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : jobs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    لا توجد وظائف مطابقة
                  </TableCell>
                </TableRow>
              ) : jobs?.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="max-w-[220px]">
                      <p className="font-medium text-sm text-foreground truncate">{job.title}</p>
                      {job.city && (
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />{job.city}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(job.organizations as any)?.logo_url ? (
                        <img src={(job.organizations as any).logo_url} className="h-7 w-7 rounded border object-cover shrink-0" alt="" />
                      ) : (
                        <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                        {(job.organizations as any)?.name_ar}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border-0 ${statusStyles[job.status] || "bg-muted"}`}>
                      {statusLabels[job.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 ${job.is_featured ? "text-amber-500" : "text-muted-foreground/40"}`}
                      onClick={() => toggleFlag.mutate({ id: job.id, field: "is_featured", value: !job.is_featured })}
                    >
                      <Star className="h-4 w-4" fill={job.is_featured ? "currentColor" : "none"} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 ${job.is_urgent ? "text-red-500" : "text-muted-foreground/40"}`}
                      onClick={() => toggleFlag.mutate({ id: job.id, field: "is_urgent", value: !job.is_urgent })}
                    >
                      <Zap className="h-4 w-4" fill={job.is_urgent ? "currentColor" : "none"} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs text-muted-foreground">{job.views_count}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        asChild
                        title="مراجعة"
                      >
                        <Link to={`/admin/jobs/reviews/${job.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      {(job.status === "submitted" || job.status === "under_review") && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => updateStatus.mutate({ id: job.id, status: "published" })}
                            title="اعتماد ونشر"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => { setSelectedJob(job); setModerationNotes(""); }}
                            title="رفض"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Job Review Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(o) => { if (!o) setSelectedJob(null); }}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>مراجعة الوظيفة</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">المسمى الوظيفي</p>
                  <p className="font-bold text-foreground">{selectedJob.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">الجمعية</p>
                    <p className="text-sm font-medium">{(selectedJob.organizations as any)?.name_ar}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">المدينة</p>
                    <p className="text-sm font-medium">{selectedJob.city || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">الحالة الحالية</p>
                  <Badge className={`text-[10px] mt-1 ${statusStyles[selectedJob.status]}`}>
                    {statusLabels[selectedJob.status]}
                  </Badge>
                </div>
              </div>

              {selectedJob.description && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">الوصف</p>
                  <div className="text-sm whitespace-pre-line max-h-32 overflow-auto rounded-lg border p-3 bg-card">
                    {selectedJob.description}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] text-muted-foreground mb-1">ملاحظات الإدارة</p>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="أضف ملاحظاتك هنا..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateStatus.mutate({ id: selectedJob.id, status: "published", notes: moderationNotes })}
                  disabled={updateStatus.isPending}
                >
                  <Check className="ml-1.5 h-4 w-4" />اعتماد ونشر
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updateStatus.mutate({ id: selectedJob.id, status: "rejected", notes: moderationNotes })}
                  disabled={updateStatus.isPending}
                >
                  <X className="ml-1.5 h-4 w-4" />رفض
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobs;
