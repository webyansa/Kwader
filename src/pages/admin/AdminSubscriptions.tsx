import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubRow {
  id: string;
  org_id: string;
  org_name: string;
  plan_name: string;
  status: string;
  created_at: string;
}

const AdminSubscriptions = () => {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("subscriptions")
      .select("id, org_id, status, created_at, plan_id, organizations(name_ar), plans(name_ar)")
      .order("created_at", { ascending: false });

    if (data) {
      const rows: SubRow[] = data.map((s: any) => ({
        id: s.id,
        org_id: s.org_id,
        org_name: s.organizations?.name_ar || "—",
        plan_name: s.plans?.name_ar || "—",
        status: s.status,
        created_at: s.created_at,
      }));
      setSubs(rows);
    }
    setLoading(false);
  };

  const handleApprove = async (orgId: string) => {
    setActionLoading(orgId);
    const { error } = await supabase.rpc("approve_organization", { _org_id: orgId });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم التفعيل", description: "تم تفعيل اشتراك الجمعية بنجاح" });
      fetchSubs();
    }
    setActionLoading(null);
  };

  const handleReject = async (orgId: string) => {
    setActionLoading(orgId);
    const { error } = await supabase.rpc("reject_organization", { _org_id: orgId });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الرفض", description: "تم رفض طلب الجمعية" });
      fetchSubs();
    }
    setActionLoading(null);
  };

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مفعّل</Badge>;
    if (status === "pending") return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">قيد المراجعة</Badge>;
    if (status === "cancelled") return <Badge variant="destructive">مرفوض</Badge>;
    if (status === "expired") return <Badge variant="secondary">منتهي</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">طلبات الاشتراك</h1>
        </div>
        <Badge variant="secondary">{subs.filter((s) => s.status === "pending").length} طلب معلّق</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الجمعية</TableHead>
                <TableHead className="text-right">الباقة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الطلب</TableHead>
                <TableHead className="text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.org_name}</TableCell>
                  <TableCell>{sub.plan_name}</TableCell>
                  <TableCell>{statusBadge(sub.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell>
                    {sub.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(sub.org_id)}
                          disabled={actionLoading === sub.org_id}
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" /> اعتماد
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(sub.org_id)}
                          disabled={actionLoading === sub.org_id}
                          className="gap-1"
                        >
                          <X className="h-3 w-3" /> رفض
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {subs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد طلبات اشتراك</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
