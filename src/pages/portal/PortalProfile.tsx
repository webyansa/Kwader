import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Upload, Image, Eye, Send, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";

const regions: Record<string, string[]> = {
  "الرياض": ["الرياض", "الخرج", "الدوادمي", "المجمعة"],
  "مكة المكرمة": ["مكة المكرمة", "جدة", "الطائف"],
  "المدينة المنورة": ["المدينة المنورة", "ينبع"],
  "الشرقية": ["الدمام", "الظهران", "الخبر", "الأحساء"],
  "القصيم": ["بريدة", "عنيزة"],
  "عسير": ["أبها", "خميس مشيط"],
  "تبوك": ["تبوك"],
  "حائل": ["حائل"],
  "الحدود الشمالية": ["عرعر"],
  "جازان": ["جازان"],
  "نجران": ["نجران"],
  "الباحة": ["الباحة"],
  "الجوف": ["سكاكا"],
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  submitted: { label: "بانتظار المراجعة", variant: "default" },
  changes_requested: { label: "مطلوب تعديلات", variant: "destructive" },
  approved: { label: "معتمد", variant: "default" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

const workScopes = ["محلي", "وطني", "إقليمي", "دولي"];
const workEnvironments = ["مكتبي", "هجين", "عن بعد", "ميداني"];

interface OrgData {
  id: string;
  name_ar: string;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  license_number: string | null;
  profile_status: string;
  short_description: string | null;
  long_description: string | null;
  vision: string | null;
  mission: string | null;
  org_values: string[];
  programs: string[];
  why_work_with_us: string | null;
  work_environment: string | null;
  benefits: string[];
  supervisor_entity: string | null;
  founding_year: number | null;
  work_scope: string | null;
  media_images: string[];
  video_url: string | null;
  profile_completion: number;
  subcategories: string[];
}

const PortalProfile = () => {
  const { orgId } = useAuth();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const editable = org?.profile_status === "draft" || org?.profile_status === "changes_requested";

  useEffect(() => {
    if (!orgId) return;
    const fetch = async () => {
      const { data } = await supabase.from("organizations").select("*").eq("id", orgId).single();
      if (data) {
        const d = data as any;
        setOrg({
          id: d.id, name_ar: d.name_ar, email: d.email, phone: d.phone, logo_url: d.logo_url,
          region: d.region, city: d.city, address: d.address, website: d.website, description: d.description,
          license_number: d.license_number, profile_status: d.profile_status || "draft",
          short_description: d.short_description || "", long_description: d.long_description || "",
          vision: d.vision || "", mission: d.mission || "",
          org_values: d.org_values || [], programs: d.programs || [],
          why_work_with_us: d.why_work_with_us || "", work_environment: d.work_environment || "",
          benefits: d.benefits || [], supervisor_entity: d.supervisor_entity || "",
          founding_year: d.founding_year, work_scope: d.work_scope || "",
          media_images: d.media_images || [], video_url: d.video_url || "",
          profile_completion: d.profile_completion || 0, subcategories: d.subcategories || [],
        });
        if (d.logo_url) setLogoPreview(d.logo_url);
      }
      setLoading(false);
    };
    fetch();
  }, [orgId]);

  const calcCompletion = (d: OrgData): number => {
    let score = 0;
    if (d.name_ar) score += 10;
    if (d.logo_url || logoFile) score += 10;
    if (d.email) score += 5;
    if (d.region && d.city) score += 10;
    if (d.short_description && d.short_description.length >= 50) score += 10;
    if (d.long_description && d.long_description.length >= 50) score += 10;
    if (d.vision) score += 10;
    if (d.mission) score += 10;
    if (d.org_values.length > 0) score += 5;
    if (d.programs.length > 0) score += 5;
    if (d.why_work_with_us) score += 5;
    if (d.license_number || d.founding_year) score += 5;
    if (d.media_images.length > 0) score += 5;
    return Math.min(score, 100);
  };

  const handleSave = async () => {
    if (!org || !orgId) return;
    setSaving(true);
    try {
      let logoUrl = org.logo_url;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${orgId}/logo.${ext}`;
        await supabase.storage.from("logos").upload(path, logoFile, { upsert: true });
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }

      const completion = calcCompletion({ ...org, logo_url: logoUrl });
      const updateData: Record<string, any> = {
        name_ar: org.name_ar, email: org.email, phone: org.phone,
        region: org.region, city: org.city, address: org.address,
        website: org.website, license_number: org.license_number,
        short_description: org.short_description, long_description: org.long_description,
        vision: org.vision, mission: org.mission,
        org_values: org.org_values, programs: org.programs,
        why_work_with_us: org.why_work_with_us, work_environment: org.work_environment,
        benefits: org.benefits, supervisor_entity: org.supervisor_entity,
        founding_year: org.founding_year, work_scope: org.work_scope,
        media_images: org.media_images, video_url: org.video_url,
        profile_completion: completion, subcategories: org.subcategories,
      };
      if (logoUrl) updateData.logo_url = logoUrl;

      const { error } = await supabase.from("organizations").update(updateData).eq("id", orgId);
      if (error) throw error;
      setOrg(prev => prev ? { ...prev, profile_completion: completion, logo_url: logoUrl } : prev);
      toast.success("تم حفظ التعديلات");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const addTag = (field: "org_values" | "programs" | "benefits", value: string, setter: (v: string) => void) => {
    if (!org || !value.trim()) return;
    setOrg({ ...org, [field]: [...org[field], value.trim()] });
    setter("");
  };

  const removeTag = (field: "org_values" | "programs" | "benefits", idx: number) => {
    if (!org) return;
    setOrg({ ...org, [field]: org[field].filter((_, i) => i !== idx) });
  };

  if (loading || !org) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const st = statusLabels[org.profile_status] || statusLabels.draft;
  const completion = calcCompletion(org);

  // Submission readiness check
  const missing: string[] = [];
  if (!org.logo_url && !logoFile) missing.push("شعار الجمعية");
  if (!org.short_description || org.short_description.length < 50) missing.push("نبذة مختصرة (50 حرف على الأقل)");
  if (!org.long_description || org.long_description.length < 50) missing.push("نبذة موسعة");
  if (!org.vision) missing.push("الرؤية");
  if (!org.mission) missing.push("الرسالة");
  if (!org.region || !org.city) missing.push("المنطقة والمدينة");
  if (!org.email) missing.push("البريد الرسمي");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">ملف الجمعية</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={st.variant}>{st.label}</Badge>
              <span className="text-xs text-muted-foreground">اكتمال {completion}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/portal/profile/preview"><Eye className="ml-1.5 h-3.5 w-3.5" /> معاينة</Link>
          </Button>
          {editable && (
            <>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                <Save className="ml-1.5 h-3.5 w-3.5" /> حفظ
              </Button>
              <Button size="sm" asChild disabled={missing.length > 0}>
                <Link to="/portal/profile/submission"><Send className="ml-1.5 h-3.5 w-3.5" /> إرسال للمراجعة</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Completion bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">نسبة اكتمال الملف</span>
            <span className="font-bold text-primary">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
          {missing.length > 0 && (
            <div className="mt-3 rounded-lg bg-destructive/10 p-3">
              <p className="text-xs font-medium text-destructive mb-1">مطلوب لإرسال الملف للمراجعة:</p>
              <ul className="text-xs text-destructive/80 space-y-0.5">
                {missing.map(m => <li key={m}>• {m}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {!editable && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
            {org.profile_status === "submitted" ? "الملف قيد المراجعة من إدارة المنصة. لا يمكن التعديل حالياً." : org.profile_status === "approved" ? "الملف معتمد ومنشور في دليل الجمعيات." : "تم رفض الملف. تواصل مع الإدارة للتفاصيل."}
          </CardContent>
        </Card>
      )}

      {/* Tabbed sections */}
      <Tabs defaultValue="basic" dir="rtl">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="basic">الأساسية</TabsTrigger>
          <TabsTrigger value="about">التعريف</TabsTrigger>
          <TabsTrigger value="identity">الهوية</TabsTrigger>
          <TabsTrigger value="work">ثقافة العمل</TabsTrigger>
          <TabsTrigger value="governance">الحوكمة</TabsTrigger>
          <TabsTrigger value="media">الوسائط</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader><CardTitle className="text-base">المعلومات الأساسية</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>اسم الجمعية *</Label>
                  <Input value={org.name_ar} onChange={e => setOrg({ ...org, name_ar: e.target.value })} disabled={!editable} className="mt-1.5" />
                </div>
                <div>
                  <Label>البريد الرسمي *</Label>
                  <Input value={org.email || ""} onChange={e => setOrg({ ...org, email: e.target.value })} disabled={!editable} className="mt-1.5" dir="ltr" />
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input value={org.phone || ""} onChange={e => setOrg({ ...org, phone: e.target.value })} disabled={!editable} className="mt-1.5" dir="ltr" />
                </div>
                <div>
                  <Label>الموقع الإلكتروني</Label>
                  <Input value={org.website || ""} onChange={e => setOrg({ ...org, website: e.target.value })} disabled={!editable} className="mt-1.5" dir="ltr" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>المنطقة *</Label>
                  <Select value={org.region || ""} onValueChange={v => setOrg({ ...org, region: v, city: "" })} disabled={!editable}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>{Object.keys(regions).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {org.region && (
                  <div>
                    <Label>المدينة *</Label>
                    <Select value={org.city || ""} onValueChange={v => setOrg({ ...org, city: v })} disabled={!editable}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>{regions[org.region]?.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>العنوان</Label>
                  <Input value={org.address || ""} onChange={e => setOrg({ ...org, address: e.target.value })} disabled={!editable} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>شعار الجمعية *</Label>
                <div className="mt-1.5 flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden">
                    {logoPreview ? <img src={logoPreview} alt="logo" className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-muted-foreground/50" />}
                  </div>
                  {editable && (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      <Button type="button" variant="outline" size="sm" asChild><span><Upload className="ml-1.5 h-3.5 w-3.5" /> رفع شعار</span></Button>
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader><CardTitle className="text-base">التعريف</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>نبذة مختصرة * <span className="text-xs text-muted-foreground">(150-250 حرف)</span></Label>
                <Textarea value={org.short_description || ""} onChange={e => setOrg({ ...org, short_description: e.target.value })} disabled={!editable} className="mt-1.5" maxLength={250} rows={3} />
                <p className="mt-1 text-xs text-muted-foreground">{(org.short_description || "").length}/250</p>
              </div>
              <div>
                <Label>نبذة موسعة *</Label>
                <Textarea value={org.long_description || ""} onChange={e => setOrg({ ...org, long_description: e.target.value })} disabled={!editable} className="mt-1.5" rows={8} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity">
          <Card>
            <CardHeader><CardTitle className="text-base">الهوية</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الرؤية *</Label>
                <Textarea value={org.vision || ""} onChange={e => setOrg({ ...org, vision: e.target.value })} disabled={!editable} className="mt-1.5" rows={3} />
              </div>
              <div>
                <Label>الرسالة *</Label>
                <Textarea value={org.mission || ""} onChange={e => setOrg({ ...org, mission: e.target.value })} disabled={!editable} className="mt-1.5" rows={3} />
              </div>
              <div>
                <Label>القيم</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {org.org_values.map((v, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {v}
                      {editable && <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag("org_values", i)} />}
                    </Badge>
                  ))}
                </div>
                {editable && (
                  <div className="mt-2 flex gap-2">
                    <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="أضف قيمة..." className="max-w-xs" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("org_values", newValue, setNewValue))} />
                    <Button type="button" variant="outline" size="sm" onClick={() => addTag("org_values", newValue, setNewValue)}><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
              <div>
                <Label>البرامج والمبادرات</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {org.programs.map((v, i) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      {v}
                      {editable && <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag("programs", i)} />}
                    </Badge>
                  ))}
                </div>
                {editable && (
                  <div className="mt-2 flex gap-2">
                    <Input value={newProgram} onChange={e => setNewProgram(e.target.value)} placeholder="أضف برنامج..." className="max-w-xs" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("programs", newProgram, setNewProgram))} />
                    <Button type="button" variant="outline" size="sm" onClick={() => addTag("programs", newProgram, setNewProgram)}><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader><CardTitle className="text-base">ثقافة العمل والتوظيف</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>لماذا العمل معنا؟</Label>
                <Textarea value={org.why_work_with_us || ""} onChange={e => setOrg({ ...org, why_work_with_us: e.target.value })} disabled={!editable} className="mt-1.5" rows={4} />
              </div>
              <div>
                <Label>بيئة العمل</Label>
                <Select value={org.work_environment || ""} onValueChange={v => setOrg({ ...org, work_environment: v })} disabled={!editable}>
                  <SelectTrigger className="mt-1.5 max-w-xs"><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>{workEnvironments.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>المزايا</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {org.benefits.map((v, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {v}
                      {editable && <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag("benefits", i)} />}
                    </Badge>
                  ))}
                </div>
                {editable && (
                  <div className="mt-2 flex gap-2">
                    <Input value={newBenefit} onChange={e => setNewBenefit(e.target.value)} placeholder="أضف ميزة..." className="max-w-xs" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("benefits", newBenefit, setNewBenefit))} />
                    <Button type="button" variant="outline" size="sm" onClick={() => addTag("benefits", newBenefit, setNewBenefit)}><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader><CardTitle className="text-base">بيانات الحوكمة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>رقم الترخيص</Label>
                  <Input value={org.license_number || ""} onChange={e => setOrg({ ...org, license_number: e.target.value })} disabled={!editable} className="mt-1.5" dir="ltr" />
                </div>
                <div>
                  <Label>جهة الإشراف</Label>
                  <Input value={org.supervisor_entity || ""} onChange={e => setOrg({ ...org, supervisor_entity: e.target.value })} disabled={!editable} className="mt-1.5" />
                </div>
                <div>
                  <Label>سنة التأسيس</Label>
                  <Input type="number" value={org.founding_year || ""} onChange={e => setOrg({ ...org, founding_year: parseInt(e.target.value) || null })} disabled={!editable} className="mt-1.5" dir="ltr" />
                </div>
                <div>
                  <Label>نطاق العمل</Label>
                  <Select value={org.work_scope || ""} onValueChange={v => setOrg({ ...org, work_scope: v })} disabled={!editable}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>{workScopes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader><CardTitle className="text-base">الوسائط</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>فيديو تعريفي (رابط YouTube)</Label>
                <Input value={org.video_url || ""} onChange={e => setOrg({ ...org, video_url: e.target.value })} disabled={!editable} className="mt-1.5" dir="ltr" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <p className="text-xs text-muted-foreground">يمكنك إضافة صور لاحقاً من خلال ميزة رفع الوسائط</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editable && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}><Save className="ml-1.5 h-4 w-4" /> حفظ المسودة</Button>
          {missing.length === 0 && (
            <Button asChild><Link to="/portal/profile/submission"><Send className="ml-1.5 h-4 w-4" /> إرسال للمراجعة</Link></Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PortalProfile;
