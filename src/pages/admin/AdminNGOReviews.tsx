import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertTriangle, Eye, MapPin, Mail, Globe } from "lucide-react";
import { toast } from "sonner";

interface ReviewOrg {
  id: string;
  name_ar: string;
  logo_url: string | null;
  city: string | null;
  region: string | null;
  email: string | null;
  website: string | null;
  profile_status: string;
  short_description: string | null;
  long_description: string | null;
  vision: string | null;
  mission: string | null;
  org_values: string[];
  programs: string[];
  profile_completion: number;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  submitted: { label: "بانتظار المراجعة", variant: "default" },
  changes_requested: { label: "مطلوب تعديلات", variant: "destructive" },
  approved: { label: "معتمد", variant: "default" },
  rejected: { label: "مرفوض", variant: "destructive" },
  draft: { label: "مسودة", variant: "secondary" },
};

const AdminNGOReviews = () => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<ReviewOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<ReviewOrg | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionOrg, setActionOrg] = useState<ReviewOrg | null>(null);
  const [actionType, setActionType] = useState<"approve" | "changes" | "reject">("approve");
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);
  const [filter, setFilter] = useState("submitted");

  const fetchOrgs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .order("updated_at", { ascending: false });
    setOrgs((data || []).map((d: any) => ({
      id: d.id, name_ar: d.name_ar, logo_url: d.logo_url, city: d.city, region: d.region,
      email: d.email, website: d.website, profile_status: d.profile_status || "draft",
      short_description: d.short_description, long_description: d.long_description,
      vision: d.vision, mission: d.mission, org_values: d.org_values || [],
      programs: d.programs || [], profile_completion: d.profile_completion || 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchOrgs(); }, [filter]);

  const handleAction = async () => {
    if (!actionOrg || !user) return;
    setActing(true);
    try {
      const newStatus = actionType === "approve" ? "approved" : actionType === "changes" ? "changes_requested" : "rejected";
      
      const { error: updateError } = await supabase
        .from("organizations")
        .update({ profile_status: newStatus } as any)
        .eq("id", actionOrg.id);
      if (updateError) throw updateError;

      // Update latest review
      const { data: latestReview } = await supabase
        .from("profile_reviews")
        .select("id")
        .eq("organization_id", actionOrg.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestReview) {
        await supabase
          .from("profile_reviews")
          .update({ status: newStatus, reviewer_id: user.id, reviewed_at: new Date().toISOString(), notes: notes || null } as any)
          .eq("id", latestReview.id);
      }

      toast.success(actionType === "approve" ? "تم اعتماد الملف" : actionType === "changes" ? "تم إرسال طلب التعديلات" : "تم رفض الملف");
      setActionOrg(null);
      setNotes("");
      fetchOrgs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">مراجعة ملفات الجمعيات</h1>

      <Tabs value={filter} onValueChange={setFilter} dir="rtl">
        <TabsList>
          <TabsTrigger value="submitted">بانتظار المراجعة</TabsTrigger>
          <TabsTrigger value="changes_requested">مطلوب تعديلات</TabsTrigger>
          <TabsTrigger value="approved">معتمد</TabsTrigger>
          <TabsTrigger value="rejected">مرفوض</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted" />)}</div>
      ) : orgs.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">لا توجد ملفات في هذه الحالة</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => {
            const st = statusLabels[org.profile_status] || statusLabels.draft;
            return (
              <Card key={org.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted text-lg font-bold text-primary overflow-hidden">
                        {org.logo_url ? <img src={org.logo_url} alt="" className="h-full w-full object-cover" /> : org.name_ar.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground">{org.name_ar}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                          {org.city && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {org.city}</span>}
                          <span className="text-xs text-muted-foreground">اكتمال {org.profile_completion}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedOrg(org); setPreviewOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {org.profile_status === "submitted" && (
                        <>
                          <Button size="sm" variant="default" onClick={() => { setActionOrg(org); setActionType("approve"); }}>
                            <CheckCircle2 className="ml-1 h-3.5 w-3.5" /> اعتماد
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setActionOrg(org); setActionType("changes"); }}>
                            <AlertTriangle className="ml-1 h-3.5 w-3.5" /> تعديلات
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setActionOrg(org); setActionType("reject"); }}>
                            <XCircle className="ml-1 h-3.5 w-3.5" /> رفض
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>معاينة ملف: {selectedOrg?.name_ar}</DialogTitle></DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl border bg-muted overflow-hidden flex items-center justify-center text-xl font-bold text-primary">
                  {selectedOrg.logo_url ? <img src={selectedOrg.logo_url} alt="" className="h-full w-full object-cover" /> : selectedOrg.name_ar.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedOrg.name_ar}</h3>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {selectedOrg.city && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {selectedOrg.city}</span>}
                    {selectedOrg.email && <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" /> {selectedOrg.email}</span>}
                  </div>
                </div>
              </div>
              {selectedOrg.short_description && <div><p className="text-xs font-medium text-muted-foreground mb-1">نبذة مختصرة</p><p className="text-sm">{selectedOrg.short_description}</p></div>}
              {selectedOrg.long_description && <div><p className="text-xs font-medium text-muted-foreground mb-1">نبذة موسعة</p><p className="text-sm whitespace-pre-wrap">{selectedOrg.long_description}</p></div>}
              {selectedOrg.vision && <div><p className="text-xs font-medium text-muted-foreground mb-1">الرؤية</p><p className="text-sm">{selectedOrg.vision}</p></div>}
              {selectedOrg.mission && <div><p className="text-xs font-medium text-muted-foreground mb-1">الرسالة</p><p className="text-sm">{selectedOrg.mission}</p></div>}
              {selectedOrg.org_values.length > 0 && <div><p className="text-xs font-medium text-muted-foreground mb-1">القيم</p><div className="flex flex-wrap gap-1">{selectedOrg.org_values.map((v, i) => <Badge key={i} variant="secondary" className="text-xs">{v}</Badge>)}</div></div>}
              {selectedOrg.programs.length > 0 && <div><p className="text-xs font-medium text-muted-foreground mb-1">البرامج</p><div className="flex flex-wrap gap-1">{selectedOrg.programs.map((v, i) => <Badge key={i} variant="outline" className="text-xs">{v}</Badge>)}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={!!actionOrg} onOpenChange={() => { setActionOrg(null); setNotes(""); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "اعتماد الملف" : actionType === "changes" ? "طلب تعديلات" : "رفض الملف"} - {actionOrg?.name_ar}
            </DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              {actionType === "approve" ? "سيتم اعتماد ملف الجمعية وإظهاره في دليل الجمعيات." : actionType === "changes" ? "أضف ملاحظاتك حول التعديلات المطلوبة:" : "أضف سبب الرفض:"}
            </p>
            {actionType !== "approve" && (
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات الإدارة..." rows={4} />
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setActionOrg(null); setNotes(""); }}>إلغاء</Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={acting || (actionType !== "approve" && !notes.trim())}
            >
              {actionType === "approve" ? "تأكيد الاعتماد" : actionType === "changes" ? "إرسال طلب التعديلات" : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNGOReviews;
