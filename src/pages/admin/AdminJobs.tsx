import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Building2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type JobStatus = Database["public"]["Enums"]["job_status"];

const statusLabels: Record<string, string> = {
  draft: "مسودة", submitted: "مقدمة", under_review: "قيد المراجعة",
  approved: "معتمدة", rejected: "مرفوضة", published: "منشورة",
  expired: "منتهية", archived: "مؤرشفة", suspended: "موقوفة",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground", submitted: "bg-accent/20 text-accent-foreground",
  under_review: "bg-accent/20 text-accent-foreground", approved: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive", published: "bg-primary/20 text-primary",
  expired: "bg-muted text-muted-foreground", archived: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/20 text-destructive",
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
        .select("*, organizations(name_ar, logo_url)")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter as JobStatus);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: JobStatus; notes?: string }) => {
      const update: any = { status, moderation_notes: notes || null };
      if (status === "published") update.published_at = new Date().toISOString();
      const { error } = await supabase.from("jobs").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "تم تحديث حالة الوظيفة" });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">إدارة الوظائف</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الوظيفة</TableHead>
              <TableHead>الجمعية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>مميزة</TableHead>
              <TableHead>عاجلة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">جارٍ التحميل...</TableCell></TableRow>
            ) : jobs?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد وظائف</TableCell></TableRow>
            ) : jobs?.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{job.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{(job.organizations as any)?.name_ar}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${statusColors[job.status] || ""}`}>{statusLabels[job.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant={job.is_featured ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => toggleFlag.mutate({ id: job.id, field: "is_featured", value: !job.is_featured })}
                  >
                    {job.is_featured ? "✓" : "—"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant={job.is_urgent ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => toggleFlag.mutate({ id: job.id, field: "is_urgent", value: !job.is_urgent })}
                  >
                    {job.is_urgent ? "✓" : "—"}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedJob(job); setModerationNotes(job.moderation_notes || ""); }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {(job.status === "submitted" || job.status === "under_review") && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => updateStatus.mutate({ id: job.id, status: "published" })}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setSelectedJob(job); setModerationNotes(""); }}>
                          <X className="h-3.5 w-3.5" />
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

      {/* Job review dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(o) => { if (!o) setSelectedJob(null); }}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">مراجعة الوظيفة</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">المسمى</p>
                <p className="font-medium">{selectedJob.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الجمعية</p>
                <p className="font-medium">{(selectedJob.organizations as any)?.name_ar}</p>
              </div>
              {selectedJob.description && (
                <div>
                  <p className="text-sm text-muted-foreground">الوصف</p>
                  <p className="text-sm whitespace-pre-line max-h-32 overflow-auto">{selectedJob.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">ملاحظات الإدارة</p>
                <Textarea value={moderationNotes} onChange={(e) => setModerationNotes(e.target.value)} rows={3} maxLength={500} />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => updateStatus.mutate({ id: selectedJob.id, status: "published", notes: moderationNotes })}
                >
                  <Check className="ml-1 h-4 w-4" />اعتماد ونشر
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updateStatus.mutate({ id: selectedJob.id, status: "rejected", notes: moderationNotes })}
                >
                  <X className="ml-1 h-4 w-4" />رفض
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
