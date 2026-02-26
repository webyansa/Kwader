import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Building2, Eye, Globe, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type OrgStatus = Database["public"]["Enums"]["org_status"];

const statusLabels: Record<string, string> = { pending: "قيد المراجعة", active: "مفعّلة", suspended: "موقوفة" };
const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
};

const AdminOrganizations = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["admin-orgs", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("organizations")
        .select("*, plans(name_ar)")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter as OrgStatus);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrgStatus }) => {
      const update: Record<string, any> = { status };
      if (status === "active") update.subscription_status = "active";
      if (status === "suspended") update.subscription_status = "suspended";
      const { error } = await supabase.from("organizations").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orgs"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "✅ تم تحديث حالة الجمعية بنجاح" });
      setSelectedOrg(null);
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const pendingCount = orgs?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">إدارة الجمعيات</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {orgs?.length ?? 0} جمعية
            {pendingCount > 0 && <span className="text-amber-600 font-medium"> · {pendingCount} بانتظار التفعيل</span>}
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="فلترة" />
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
                <TableHead className="font-bold">الجمعية</TableHead>
                <TableHead className="font-bold">المدينة</TableHead>
                <TableHead className="font-bold">الباقة</TableHead>
                <TableHead className="font-bold">الحالة</TableHead>
                <TableHead className="font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orgs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    لا توجد جمعيات مطابقة
                  </TableCell>
                </TableRow>
              ) : orgs?.map((org) => (
                <TableRow key={org.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img src={org.logo_url} className="h-9 w-9 rounded-lg border object-cover shrink-0" alt="" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{org.name_ar}</p>
                        {org.email && <p className="text-[10px] text-muted-foreground truncate">{org.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{org.city || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{(org.plans as any)?.name_ar || "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border-0 ${statusStyles[org.status]}`}>
                      {statusLabels[org.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setSelectedOrg(org)}
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {org.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => updateStatus.mutate({ id: org.id, status: "active" })}
                            title="تفعيل"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => updateStatus.mutate({ id: org.id, status: "suspended" })}
                            title="رفض"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {org.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                          onClick={() => updateStatus.mutate({ id: org.id, status: "suspended" })}
                        >
                          إيقاف
                        </Button>
                      )}
                      {org.status === "suspended" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] text-emerald-600 hover:bg-emerald-50"
                          onClick={() => updateStatus.mutate({ id: org.id, status: "active" })}
                        >
                          تفعيل
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Org Details Dialog */}
      <Dialog open={!!selectedOrg} onOpenChange={(o) => { if (!o) setSelectedOrg(null); }}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الجمعية</DialogTitle>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selectedOrg.logo_url ? (
                  <img src={selectedOrg.logo_url} className="h-14 w-14 rounded-xl border object-cover" alt="" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-foreground">{selectedOrg.name_ar}</h3>
                  <Badge className={`text-[10px] mt-1 ${statusStyles[selectedOrg.status]}`}>
                    {statusLabels[selectedOrg.status]}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border divide-y">
                {selectedOrg.city && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{selectedOrg.city}{selectedOrg.region ? ` - ${selectedOrg.region}` : ""}</span>
                  </div>
                )}
                {selectedOrg.email && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span dir="ltr">{selectedOrg.email}</span>
                  </div>
                )}
                {selectedOrg.phone && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span dir="ltr">{selectedOrg.phone}</span>
                  </div>
                )}
                {selectedOrg.website && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" dir="ltr">
                      {selectedOrg.website}
                    </a>
                  </div>
                )}
                {selectedOrg.license_number && (
                  <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>رقم الترخيص: {selectedOrg.license_number}</span>
                  </div>
                )}
              </div>

              {selectedOrg.description && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">الوصف</p>
                  <p className="text-sm text-foreground">{selectedOrg.description}</p>
                </div>
              )}

              {selectedOrg.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => updateStatus.mutate({ id: selectedOrg.id, status: "active" })}
                    disabled={updateStatus.isPending}
                  >
                    <Check className="ml-1.5 h-4 w-4" />تفعيل الجمعية
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => updateStatus.mutate({ id: selectedOrg.id, status: "suspended" })}
                    disabled={updateStatus.isPending}
                  >
                    <X className="ml-1.5 h-4 w-4" />رفض
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrganizations;
