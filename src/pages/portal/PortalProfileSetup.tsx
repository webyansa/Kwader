import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowLeft, ArrowRight, Check, Upload, Image, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const STEPS = [
  { title: "المعلومات الأساسية", desc: "اسم الجمعية والشعار والبريد", emoji: "🏢" },
  { title: "التعريف", desc: "اكتب نبذة عن جمعيتك بأسلوبك", emoji: "📝" },
  { title: "الهوية", desc: "الرؤية والرسالة اللي تميزكم", emoji: "🎯" },
  { title: "الموقع", desc: "وين موقعكم؟", emoji: "📍" },
];

const PortalProfileSetup = () => {
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name_ar: "", email: "", short_description: "", long_description: "",
    vision: "", mission: "", region: "", city: "", website: "",
  });

  useEffect(() => {
    if (!orgId) return;
    supabase.from("organizations").select("*").eq("id", orgId).single().then(({ data }) => {
      if (data) {
        setForm({
          name_ar: data.name_ar || "", email: data.email || "",
          short_description: (data as any).short_description || "", long_description: (data as any).long_description || "",
          vision: (data as any).vision || "", mission: (data as any).mission || "",
          region: data.region || "", city: data.city || "", website: data.website || "",
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    });
  }, [orgId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  const saveAndContinue = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${orgId}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage.from("logos").upload(path, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }
      const updateData: Record<string, any> = { ...form };
      if (logoUrl) updateData.logo_url = logoUrl;
      const { error } = await supabase.from("organizations").update(updateData).eq("id", orgId);
      if (error) throw error;
      if (step < STEPS.length - 1) setStep(step + 1);
      else { toast.success("تم حفظ البيانات بنجاح ✅"); navigate("/portal/profile"); }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-medium">اسم الجمعية *</Label>
              <Input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} placeholder="مثال: جمعية إنسان" className="mt-1.5 rounded-lg" />
            </div>
            <div>
              <Label className="text-xs font-medium">البريد الرسمي *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="info@example.org" className="mt-1.5 rounded-lg" dir="ltr" />
            </div>
            <div>
              <Label className="text-xs font-medium">شعار الجمعية</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 overflow-hidden transition-colors hover:border-primary/30">
                  {logoPreview ? <img src={logoPreview} alt="logo" className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-muted-foreground/30" />}
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5" asChild><span><Upload className="h-3.5 w-3.5" /> رفع شعار</span></Button>
                </label>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-medium">نبذة مختصرة * <span className="text-muted-foreground">(150-250 حرف)</span></Label>
              <Textarea value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} placeholder="نبذة قصيرة عن جمعيتك..." className="mt-1.5 rounded-lg" maxLength={250} rows={3} />
              <p className="mt-1 text-[11px] text-muted-foreground">{form.short_description.length}/250</p>
            </div>
            <div>
              <Label className="text-xs font-medium">نبذة موسعة *</Label>
              <Textarea value={form.long_description} onChange={e => setForm({ ...form, long_description: e.target.value })} placeholder="اكتب تعريفاً شاملاً عن جمعيتك وأنشطتها..." className="mt-1.5 rounded-lg" rows={6} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-medium">الرؤية *</Label>
              <Textarea value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} placeholder="ما الصورة المستقبلية التي تسعى لتحقيقها؟" className="mt-1.5 rounded-lg" rows={3} />
            </div>
            <div>
              <Label className="text-xs font-medium">الرسالة *</Label>
              <Textarea value={form.mission} onChange={e => setForm({ ...form, mission: e.target.value })} placeholder="كيف تحقق جمعيتك رؤيتها؟" className="mt-1.5 rounded-lg" rows={3} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-medium">المنطقة *</Label>
              <Select value={form.region} onValueChange={v => setForm({ ...form, region: v, city: "" })}>
                <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
                <SelectContent>{Object.keys(regions).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.region && (
              <div>
                <Label className="text-xs font-medium">المدينة *</Label>
                <Select value={form.city} onValueChange={v => setForm({ ...form, city: v })}>
                  <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                  <SelectContent>{regions[form.region]?.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs font-medium">الموقع الإلكتروني <span className="text-muted-foreground">(اختياري)</span></Label>
              <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://example.org" className="mt-1.5 rounded-lg" dir="ltr" />
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <motion.div className="max-w-xl mx-auto space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="text-center">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm mb-4">
          <Building2 className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">إعداد ملف الجمعية</h1>
        <p className="text-sm text-muted-foreground mt-1.5">حياك 👋 خلنا نكمّل ملف جمعيتك عشان تظهر في دليل الجمعيات</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-muted"}`} />
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="mb-6">
                <span className="text-2xl mb-2 block">{STEPS[step].emoji}</span>
                <h2 className="font-display text-lg font-bold text-foreground">{STEPS[step].title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{STEPS[step].desc}</p>
              </div>
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" className="rounded-lg gap-1.5" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowRight className="h-4 w-4" /> السابق
            </Button>
            <Button className="rounded-lg gap-1.5" onClick={saveAndContinue} disabled={loading}>
              {step === STEPS.length - 1 ? (
                <><Check className="h-4 w-4" /> حفظ والانتقال للملف</>
              ) : (
                <>التالي <ArrowLeft className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PortalProfileSetup;
