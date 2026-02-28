import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Upload, Image, Eye, Send, Save, X, Plus, Info, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

const workScopes = ["محلي", "وطني", "إقليمي", "دولي"];
const workEnvironments = ["مكتبي", "هجين", "عن بعد", "ميداني"];

interface OrgData {
  id: string; name_ar: string; email: string | null; phone: string | null; logo_url: string | null;
  region: string | null; city: string | null; address: string | null; website: string | null;
  description: string | null; license_number: string | null; profile_status: string;
  short_description: string | null; long_description: string | null; vision: string | null;
  mission: string | null; org_values: string[]; programs: string[];
  why_work_with_us: string | null; work_environment: string | null; benefits: string[];
  supervisor_entity: string | null; founding_year: number | null; work_scope: string | null;
  media_images: string[]; video_url: string | null; profile_completion: number; subcategories: string[];
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

  const editable = org?.profile_status === "draft" || org?.profile_status === "changes_requested" || org?.profile_status === "approved";

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
      toast.success("تم حفظ التعديلات بنجاح ✅");
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

  const completion = calcCompletion(org);
  const missing: string[] = [];
  if (!org.logo_url && !logoFile) missing.push("شعار الجمعية");
  if (!org.short_description || org.short_description.length < 50) missing.push("نبذة مختصرة (50 حرف على الأقل)");
  if (!org.long_description || org.long_description.length < 50) missing.push("نبذة موسعة");
  if (!org.vision) missing.push("الرؤية");
  if (!org.mission) missing.push("الرسالة");
  if (!org.region || !org.city) missing.push("المنطقة والمدينة");
  if (!org.email) missing.push("البريد الرسمي");

  const completionColor = completion >= 80 ? "text-emerald-500" : completion >= 50 ? "text-amber-500" : "text-primary";

  const profileStatusMeta = {
    draft: { label: "مسودة", badgeClass: "bg-muted text-muted-foreground", hint: "ابدأ بإكمال البيانات الأساسية" },
    submitted: { label: "بانتظار المراجعة", badgeClass: "bg-primary/10 text-primary", hint: "ملفك الآن تحت المراجعة" },
    changes_requested: { label: "مطلوب تعديلات", badgeClass: "bg-accent/15 text-accent-foreground", hint: "عدّل الملاحظات وأعد الإرسال" },
    approved: { label: "معتمد", badgeClass: "bg-primary text-primary-foreground", hint: "ملفك ظاهر الآن في الدليل" },
    rejected: { label: "مرفوض", badgeClass: "bg-destructive/10 text-destructive", hint: "تقدر تحدّث الملف وتعيد الإرسال" },
  } as const;
  const statusMeta = profileStatusMeta[(org.profile_status as keyof typeof profileStatusMeta)] ?? profileStatusMeta.draft;

  // Motivational micro-copy
  const getMicroCopy = () => {
    if (org.profile_status === "approved") return "ملفك معتمد 👏 وأي تحديث جديد تقدر ترسله بسهولة";
    if (completion >= 90) return "ملفك يبدو ممتاز 🔥 خطوة أخيرة وتكون جاهز للاعتماد";
    if (completion >= 70) return "ملفك يبدو رائع 👌 أضف التفاصيل الناقصة لزيادة الثقة";
    if (completion >= 50) return "ماشي الحال ✨ كمّل بقية البيانات عشان تبرز جمعيتك";
    return "خلنا نبدأ 💪 كل معلومة تضيفها تقربك من الاعتماد";
  };

  const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
    <div className="mb-6">
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
  );

  const TagInput = ({ field, value, setter, placeholder, tags }: { field: "org_values" | "programs" | "benefits"; value: string; setter: (v: string) => void; placeholder: string; tags: string[] }) => (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((v, i) => (
          <Badge key={i} variant="secondary" className="gap-1 rounded-full px-3 py-1 text-xs">
            {v}
            {editable && <X className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => removeTag(field, i)} />}
          </Badge>
        ))}
      </div>
      {editable && (
        <div className="flex gap-2">
          <Input value={value} onChange={e => setter(e.target.value)} placeholder={placeholder} className="max-w-xs rounded-lg" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(field, value, setter))} />
          <Button type="button" variant="outline" size="icon" className="rounded-lg shrink-0" onClick={() => addTag(field, value, setter)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">ملف الجمعية</h1>
          <p className="text-sm text-muted-foreground mt-1">{getMicroCopy()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5" asChild>
            <Link to="/portal/profile/preview"><Eye className="h-3.5 w-3.5" /> معاينة</Link>
          </Button>
          {editable && (
            <>
              <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={handleSave} disabled={saving}>
                <Save className="h-3.5 w-3.5" /> حفظ
              </Button>
              <Button size="sm" className="rounded-lg gap-1.5" asChild disabled={missing.length > 0}>
                <Link to="/portal/profile/submission"><Send className="h-3.5 w-3.5" /> إرسال للمراجعة</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Completion + Missing */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - completion / 100)}`}
                  className={`${completionColor} transition-all duration-700`}
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${completionColor}`}>{completion}%</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">اكتمال الملف</p>
              {missing.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {missing.map(m => (
                    <span key={m} className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-full px-2.5 py-0.5">
                      <Info className="h-3 w-3" /> {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> جاهز للإرسال للمراجعة
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid gap-0 md:grid-cols-[1fr_280px]">
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${statusMeta.badgeClass} border-0 rounded-full px-3 py-1 text-xs font-medium`}>
                  {statusMeta.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{statusMeta.hint}</span>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">{org.name_ar || "اسم الجمعية"}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {org.short_description || "أضف نبذة مختصرة تعرّف بعمل جمعيتك بشكل سريع وواضح."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1">{org.region || "المنطقة"} • {org.city || "المدينة"}</span>
                {org.email && <span className="rounded-full bg-muted px-2.5 py-1" dir="ltr">{org.email}</span>}
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-r border-border/60 bg-muted/20 p-5">
              <p className="text-xs font-medium text-foreground mb-2">نظرة سريعة قبل المراجعة</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background overflow-hidden">
                  {logoPreview ? <img src={logoPreview} alt="شعار الجمعية" className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{org.name_ar || "اسم الجمعية"}</p>
                  <p className="text-[11px] text-muted-foreground">اكتمال الملف {completion}%</p>
                </div>
              </div>
              {missing.length > 0 ? (
                <div className="space-y-1.5">
                  {missing.slice(0, 3).map((item) => (
                    <p key={item} className="text-[11px] text-muted-foreground">• {item}</p>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-primary">جاهز للإرسال للمراجعة ✅</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!editable && (
        <Card className={`border ${org.profile_status === "submitted" ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"}`}>
          <CardContent className="p-4 text-sm">
            {org.profile_status === "submitted" ? "الملف قيد المراجعة من إدارة المنصة. لا يمكن التعديل حالياً ⏳" :
             org.profile_status === "rejected" ? "تم رفض الملف. راجع الملاحظات وعدّل الملف ثم أعد الإرسال." :
             "هذا القسم متاح للتعديل بحسب حالة الملف الحالية."}
          </CardContent>
        </Card>
      )}

      {/* Tabbed Sections */}
      <Tabs defaultValue="basic" dir="rtl">
        <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1 h-auto flex-wrap gap-0.5">
          <TabsTrigger value="basic" className="rounded-lg text-xs data-[state=active]:shadow-sm px-4 py-2">الأساسية</TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg text-xs data-[state=active]:shadow-sm px-4 py-2">التعريف</TabsTrigger>
          <TabsTrigger value="identity" className="rounded-lg text-xs data-[state=active]:shadow-sm px-4 py-2">الهوية</TabsTrigger>
          <TabsTrigger value="work" className="rounded-lg text-xs data-[state=active]:shadow-sm px-4 py-2">ثقافة العمل</TabsTrigger>
          <TabsTrigger value="governance" className="rounded-lg text-xs data-[state=active]:shadow-sm px-4 py-2">الحوكمة</TabsTrigger>
          <TabsTrigger value="media" className="rounded-lg text-xs data-[state=active]:shadow-sm px-4 py-2">الوسائط</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-6">
              <SectionTitle title="المعلومات الأساسية" desc="بيانات التواصل والموقع الجغرافي" />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-medium">اسم الجمعية *</Label>
                  <Input value={org.name_ar} onChange={e => setOrg({ ...org, name_ar: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-medium">البريد الرسمي *</Label>
                  <Input value={org.email || ""} onChange={e => setOrg({ ...org, email: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs font-medium">رقم الهاتف</Label>
                  <Input value={org.phone || ""} onChange={e => setOrg({ ...org, phone: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs font-medium">الموقع الإلكتروني</Label>
                  <Input value={org.website || ""} onChange={e => setOrg({ ...org, website: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" dir="ltr" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <Label className="text-xs font-medium">المنطقة *</Label>
                  <Select value={org.region || ""} onValueChange={v => setOrg({ ...org, region: v, city: "" })} disabled={!editable}>
                    <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>{Object.keys(regions).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {org.region && (
                  <div>
                    <Label className="text-xs font-medium">المدينة *</Label>
                    <Select value={org.city || ""} onValueChange={v => setOrg({ ...org, city: v })} disabled={!editable}>
                      <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>{regions[org.region]?.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium">العنوان</Label>
                  <Input value={org.address || ""} onChange={e => setOrg({ ...org, address: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">شعار الجمعية *</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 overflow-hidden transition-colors hover:border-primary/30">
                    {logoPreview ? <img src={logoPreview} alt="logo" className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-muted-foreground/30" />}
                  </div>
                  {editable && (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5" asChild><span><Upload className="h-3.5 w-3.5" /> رفع شعار</span></Button>
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-6">
              <SectionTitle title="التعريف" desc="اكتب نبذة عن جمعيتك بأسلوبك" />
              <div>
                <Label className="text-xs font-medium">نبذة مختصرة * <span className="text-muted-foreground">(150-250 حرف)</span></Label>
                <Textarea value={org.short_description || ""} onChange={e => setOrg({ ...org, short_description: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" maxLength={250} rows={3} />
                <p className="mt-1 text-[11px] text-muted-foreground">{(org.short_description || "").length}/250</p>
              </div>
              <div>
                <Label className="text-xs font-medium">نبذة موسعة *</Label>
                <Textarea value={org.long_description || ""} onChange={e => setOrg({ ...org, long_description: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" rows={8} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-6">
              <SectionTitle title="الهوية" desc="الرؤية والرسالة والقيم" />
              <div>
                <Label className="text-xs font-medium">الرؤية *</Label>
                <Textarea value={org.vision || ""} onChange={e => setOrg({ ...org, vision: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" rows={3} />
              </div>
              <div>
                <Label className="text-xs font-medium">الرسالة *</Label>
                <Textarea value={org.mission || ""} onChange={e => setOrg({ ...org, mission: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" rows={3} />
              </div>
              <div>
                <Label className="text-xs font-medium">القيم</Label>
                <div className="mt-2">
                  <TagInput field="org_values" value={newValue} setter={setNewValue} placeholder="أضف قيمة..." tags={org.org_values} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">البرامج والمبادرات</Label>
                <div className="mt-2">
                  <TagInput field="programs" value={newProgram} setter={setNewProgram} placeholder="أضف برنامج..." tags={org.programs} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-6">
              <SectionTitle title="ثقافة العمل والتوظيف" desc="اعرض بيئة العمل ومزاياها" />
              <div>
                <Label className="text-xs font-medium">لماذا العمل معنا؟</Label>
                <Textarea value={org.why_work_with_us || ""} onChange={e => setOrg({ ...org, why_work_with_us: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" rows={4} />
              </div>
              <div>
                <Label className="text-xs font-medium">بيئة العمل</Label>
                <Select value={org.work_environment || ""} onValueChange={v => setOrg({ ...org, work_environment: v })} disabled={!editable}>
                  <SelectTrigger className="mt-1.5 max-w-xs rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>{workEnvironments.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">المزايا</Label>
                <div className="mt-2">
                  <TagInput field="benefits" value={newBenefit} setter={setNewBenefit} placeholder="أضف ميزة..." tags={org.benefits} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-6">
              <SectionTitle title="بيانات الحوكمة" desc="معلومات اختيارية تعزز مصداقية جمعيتك" />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-medium">رقم الترخيص</Label>
                  <Input value={org.license_number || ""} onChange={e => setOrg({ ...org, license_number: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs font-medium">جهة الإشراف</Label>
                  <Input value={org.supervisor_entity || ""} onChange={e => setOrg({ ...org, supervisor_entity: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-medium">سنة التأسيس</Label>
                  <Input type="number" value={org.founding_year || ""} onChange={e => setOrg({ ...org, founding_year: parseInt(e.target.value) || null })} disabled={!editable} className="mt-1.5 rounded-lg" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs font-medium">نطاق العمل</Label>
                  <Select value={org.work_scope || ""} onValueChange={v => setOrg({ ...org, work_scope: v })} disabled={!editable}>
                    <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>{workScopes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-6">
              <SectionTitle title="الوسائط" desc="أضف صور وفيديو يعكسون هوية جمعيتك" />
              <div>
                <Label className="text-xs font-medium">فيديو تعريفي (رابط YouTube)</Label>
                <Input value={org.video_url || ""} onChange={e => setOrg({ ...org, video_url: e.target.value })} disabled={!editable} className="mt-1.5 rounded-lg" dir="ltr" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <p className="text-xs text-muted-foreground">يمكنك إضافة صور لاحقاً من خلال ميزة رفع الوسائط</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editable && (
        <div className="flex justify-end gap-2 pb-4">
          <Button variant="outline" className="rounded-lg gap-1.5" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> حفظ المسودة
          </Button>
          {missing.length === 0 && (
            <Button className="rounded-lg gap-1.5" asChild>
              <Link to="/portal/profile/submission"><Send className="h-4 w-4" /> إرسال للمراجعة</Link>
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PortalProfile;
