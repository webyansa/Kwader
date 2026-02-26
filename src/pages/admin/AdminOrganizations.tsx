import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Building2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type OrgStatus = Database["public"]["Enums"]["org_status"];

const statusLabels: Record<string, string> = { pending: "قيد المراجعة", active: "مفعّلة", suspended: "موقوفة" };
const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  active: "bg-success/20 text-success",
  suspended: "bg-destructive/20 text-destructive",
};

const AdminOrganizations = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*, plans(name_ar)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrgStatus }) => {
      const update: any = { status };
      if (status === "active") update.subscription_status = "active";
      const { error } = await supabase.from("organizations").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orgs"] });
      toast({ title: "تم تحديث حالة الجمعية" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground">إدارة الجمعيات</h2>
      <div className="rounded-xl border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الجمعية</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>الباقة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">جارٍ التحميل...</TableCell></TableRow>
            ) : orgs?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد جمعيات</TableCell></TableRow>
            ) : orgs?.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {org.logo_url ? (
                      <img src={org.logo_url} className="h-8 w-8 rounded border object-cover" alt="" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{org.name_ar}</p>
                      {org.email && <p className="text-[10px] text-muted-foreground">{org.email}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{org.city || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{(org.plans as any)?.name_ar || "—"}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${statusColors[org.status]}`}>{statusLabels[org.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {org.status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => updateStatus.mutate({ id: org.id, status: "active" })}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => updateStatus.mutate({ id: org.id, status: "suspended" })}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {org.status === "active" && (
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive" onClick={() => updateStatus.mutate({ id: org.id, status: "suspended" })}>
                        إيقاف
                      </Button>
                    )}
                    {org.status === "suspended" && (
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-success" onClick={() => updateStatus.mutate({ id: org.id, status: "active" })}>
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
    </div>
  );
};

export default AdminOrganizations;
