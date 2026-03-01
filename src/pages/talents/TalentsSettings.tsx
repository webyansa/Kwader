import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Eye, Download, Mail, Briefcase, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const TalentsSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [privacy, setPrivacy] = useState("public");
  const [allowCvView, setAllowCvView] = useState(true);
  const [allowCvDownload, setAllowCvDownload] = useState(false);
  const [allowContact, setAllowContact] = useState(true);
  const [availableForWork, setAvailableForWork] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["talent-settings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_seeker_profiles")
        .select("privacy, allow_cv_public_view, allow_cv_download, allow_contact_requests, available_for_work")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setPrivacy(profile.privacy || "public");
      setAllowCvView((profile as any).allow_cv_public_view !== false);
      setAllowCvDownload((profile as any).allow_cv_download === true);
      setAllowContact((profile as any).allow_contact_requests !== false);
      setAvailableForWork((profile as any).available_for_work === true);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("job_seeker_profiles")
        .update({
          privacy,
          allow_cv_public_view: allowCvView,
          allow_cv_download: allowCvDownload,
          allow_contact_requests: allowContact,
          available_for_work: availableForWork,
        } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["talent-settings"] });
      toast({ title: "تم حفظ الإعدادات ✅" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #6C5CE7, #00C2FF)' }}>
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-sm text-muted-foreground">إدارة خصوصية ملفك ونشر سيرتك الذاتية</p>
        </div>
      </div>

      {/* Privacy Settings */}
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">الخصوصية والنشر</h2>
          </div>

          <div className="space-y-5">
            {/* Profile Visibility */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">ظهور الملف المهني</Label>
              <Select value={privacy} onValueChange={setPrivacy}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-emerald-500" />عام — يظهر للجميع
                    </div>
                  </SelectItem>
                  <SelectItem value="link_only">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-amber-500" />برابط فقط — لا يظهر في البحث
                    </div>
                  </SelectItem>
                  <SelectItem value="hidden">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-destructive" />مخفي — لا يمكن لأحد رؤيته
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">يتحكم في ظهور صفحتك العامة /talent/username</p>
            </div>

            <Separator />

            {/* Available for Work */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-500" />متاح للعمل
                </Label>
                <p className="text-xs text-muted-foreground">يعرض شارة "متاح للعمل" في صفحتك العامة</p>
              </div>
              <Switch checked={availableForWork} onCheckedChange={setAvailableForWork} />
            </div>

            <Separator />

            {/* CV Public View */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />السماح بعرض السيرة الذاتية
                </Label>
                <p className="text-xs text-muted-foreground">يسمح للزوار بفتح صفحة سيرتك /talent/username/cv</p>
              </div>
              <Switch checked={allowCvView} onCheckedChange={setAllowCvView} />
            </div>

            {/* CV Download */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />السماح بتنزيل السيرة PDF
                </Label>
                <p className="text-xs text-muted-foreground">يعرض زر "تنزيل PDF" في صفحتك العامة وصفحة السيرة</p>
              </div>
              <Switch checked={allowCvDownload} onCheckedChange={setAllowCvDownload} />
            </div>

            <Separator />

            {/* Contact Requests */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />السماح بالمراسلات عبر المنصة
                </Label>
                <p className="text-xs text-muted-foreground">يعرض زر "راسلني عبر كوادر" بدون كشف بريدك</p>
              </div>
              <Switch checked={allowContact} onCheckedChange={setAllowContact} />
            </div>
          </div>

          <Button
            className="w-full rounded-xl gap-2 mt-4"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #00C2FF)' }}
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentsSettings;
