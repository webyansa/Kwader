import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, Save, Send, Briefcase, MapPin, Clock, DollarSign,
  FileText, Users, Eye, Sparkles, RefreshCw, X, Plus, Loader2,
  CheckCircle2, AlertTriangle, GraduationCap, Languages, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ───
interface JobForm {
  title: string;
  department: string;
  city: string;
  remote_type: string;
  employment_type: string;
  experience_level: string;
  vacancies: number;
  closing_date: string;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  experience_years_min: string;
  experience_years_max: string;
  education: string;
  languages: { language: string; level: string }[];
  salary_display: string;
  salary_min: string;
  salary_max: string;
  benefits: string[];
  screening_questions: { type: string; question: string }[];
  application_method: string;
  application_email: string;
  application_url: string;
}

const defaultForm: JobForm = {
  title: "", department: "", city: "", remote_type: "onsite",
  employment_type: "full_time", experience_level: "any", vacancies: 1,
  closing_date: "", summary: "", description: "", responsibilities: "",
  requirements: "", skills: [], experience_years_min: "", experience_years_max: "",
  education: "", languages: [], salary_display: "hidden", salary_min: "",
  salary_max: "", benefits: [], screening_questions: [],
  application_method: "internal_form", application_email: "", application_url: "",
};

const sections = [
  { id: "basic", label: "البيانات الأساسية", icon: Briefcase },
  { id: "details", label: "تفاصيل الوظيفة", icon: FileText },
  { id: "salary", label: "الراتب والمزايا", icon: DollarSign },
  { id: "screening", label: "أسئلة الفرز", icon: HelpCircle },
  { id: "preview", label: "المراجعة والإرسال", icon: Eye },
];

const empLabels: Record<string, string> = {
  full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد مؤقت",
  intern: "تدريب", consultant: "استشاري", volunteer: "تطوعي",
};
const levelLabels: Record<string, string> = {
  junior: "مبتدئ", mid: "متوسط", senior: "خبير", leadership: "قيادي", any: "غير محدد",
};
const remoteLabels: Record<string, string> = {
  onsite: "حضوري", remote: "عن بعد", hybrid: "هجين",
};
const salaryDisplayLabels: Record<string, string> = {
  hidden: "غير معلن", range: "نطاق", visible: "ظاهر",
};

const AUTOSAVE_KEY = "kwader_new_job_draft";

const PortalNewJob = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("basic");
  const [form, setForm] = useState<JobForm>(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
  });
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgDescription, setOrgDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  const sectionIdx = sections.findIndex(s => s.id === activeSection);

  // Load org info
  useEffect(() => {
    if (!user) return;
    const loadOrg = async () => {
      const { data } = await supabase.rpc("get_user_org_id", { _user_id: user.id });
      if (data) {
        setOrgId(data);
        const { data: org } = await supabase.from("organizations").select("short_description").eq("id", data).single();
        if (org?.short_description) setOrgDescription(org.short_description);
      }
    };
    loadOrg();
  }, [user]);

  // Auto-save to localStorage
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(form)), 500);
    return () => clearTimeout(t);
  }, [form]);

  const update = useCallback((field: keyof JobForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // ─── AI Generate ───
  const generateWithAI = async (style = "professional") => {
    if (!form.title) {
      toast({ title: "أدخل المسمى الوظيفي أولاً", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    setAiModalOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-job-content", {
        body: {
          title: form.title,
          department: form.department,
          city: form.city,
          remote_type: form.remote_type,
          employment_type: form.employment_type,
          experience_level: form.experience_level,
          skills: form.skills,
          org_short_description: orgDescription,
          style,
          action: "generate",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm(prev => ({
        ...prev,
        summary: data.summary || prev.summary,
        description: data.description || prev.description,
        responsibilities: data.responsibilities || prev.responsibilities,
        requirements: data.requirements || prev.requirements,
        skills: data.suggested_skills?.length ? [...new Set([...prev.skills, ...data.suggested_skills])] : prev.skills,
      }));
      toast({ title: "تم توليد المحتوى بنجاح ✨" });
    } catch (e: any) {
      toast({ title: "خطأ في التوليد", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
      setAiModalOpen(false);
    }
  };

  const rewriteSection = async (sectionName: string, content: string, style = "professional") => {
    if (!content) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-job-content", {
        body: { action: "rewrite", section_to_rewrite: sectionName, section_content: content, style },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.rewritten_text;
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Save / Submit ───
  const validateRequired = () => {
    const missing: string[] = [];
    if (!form.title) missing.push("المسمى الوظيفي");
    if (!form.city) missing.push("المدينة");
    if (!form.closing_date) missing.push("تاريخ الإغلاق");
    if (!form.description) missing.push("الوصف");
    if (!form.responsibilities) missing.push("المسؤوليات");
    if (!form.requirements) missing.push("المتطلبات");
    return missing;
  };

  const buildJobPayload = () => ({
    title: form.title,
    department: form.department || null,
    city: form.city,
    remote_type: form.remote_type as any,
    employment_type: form.employment_type as any,
    experience_level: form.experience_level as any,
    vacancies: form.vacancies,
    closing_date: form.closing_date || null,
    summary: form.summary || null,
    description: form.description,
    responsibilities: form.responsibilities,
    requirements: form.requirements,
    skills: form.skills,
    experience_years_min: form.experience_years_min ? parseInt(form.experience_years_min) : null,
    experience_years_max: form.experience_years_max ? parseInt(form.experience_years_max) : null,
    education: form.education || null,
    languages: form.languages,
    salary_display: form.salary_display,
    salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
    salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
    salary_visible: form.salary_display !== "hidden",
    benefits: form.benefits,
    screening_questions: form.screening_questions,
    application_method: form.application_method as any,
    application_email: form.application_email || null,
    application_url: form.application_url || null,
    org_id: orgId!,
    created_by: user?.id || null,
  });

  const saveDraft = async () => {
    if (!orgId) { toast({ title: "لم يتم تحديد الجمعية", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...buildJobPayload(), status: "draft" as const };
      if (draftId) {
        const { error } = await supabase.from("jobs").update(payload).eq("id", draftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("jobs").insert(payload).select("id").single();
        if (error) throw error;
        setDraftId(data.id);
      }
      localStorage.removeItem(AUTOSAVE_KEY);
      toast({ title: "تم حفظ المسودة ✓" });
    } catch (e: any) {
      toast({ title: "خطأ في الحفظ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    const missing = validateRequired();
    if (missing.length) {
      toast({ title: "حقول مطلوبة ناقصة", description: missing.join("، "), variant: "destructive" });
      return;
    }
    if (!orgId) return;
    setSubmitting(true);
    try {
      const payload = { ...buildJobPayload(), status: "submitted" as const };
      let jobId = draftId;
      if (draftId) {
        const { error } = await supabase.from("jobs").update(payload).eq("id", draftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("jobs").insert(payload).select("id").single();
        if (error) throw error;
        jobId = data.id;
      }
      // Create audit log
      await supabase.from("audit_logs").insert({
        action: "job_submitted",
        entity_type: "job",
        entity_id: jobId,
        user_id: user?.id,
        details: { title: form.title },
      });
      localStorage.removeItem(AUTOSAVE_KEY);
      toast({ title: "تم إرسال الوظيفة للاعتماد ✓" });
      navigate(`/portal/jobs/${jobId}`);
    } catch (e: any) {
      toast({ title: "خطأ في الإرسال", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Tag helpers ───
  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      update("skills", [...form.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const addBenefit = () => {
    if (benefitInput.trim() && !form.benefits.includes(benefitInput.trim())) {
      update("benefits", [...form.benefits, benefitInput.trim()]);
      setBenefitInput("");
    }
  };
  const addScreeningQuestion = (type: string) => {
    update("screening_questions", [...form.screening_questions, { type, question: "" }]);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-lg" asChild>
            <Link to="/portal/jobs"><ArrowRight className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">نشر وظيفة جديدة</h1>
            <p className="text-xs text-muted-foreground mt-0.5">أنشئ إعلانك الوظيفي وأرسله للاعتماد</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={saveDraft} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} حفظ كمسودة
          </Button>
          <Button size="sm" className="rounded-lg gap-1.5" onClick={submitForReview} disabled={submitting}>
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} إرسال للاعتماد
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg transition-all ${
              s.id === activeSection ? "bg-primary text-primary-foreground shadow-sm" :
              i < sectionIdx ? "bg-primary/10 text-primary" :
              "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {i < sectionIdx ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-5">
              <AnimatePresence mode="wait">
                <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>

                  {/* ═══ Section 1: Basic ═══ */}
                  {activeSection === "basic" && (
                    <div className="space-y-5">
                      <div>
                        <Label className="text-xs font-medium">المسمى الوظيفي *</Label>
                        <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="مثال: مدير مشاريع تنموية" className="mt-1.5 rounded-lg" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-medium">القسم / الإدارة</Label>
                          <Input value={form.department} onChange={e => update("department", e.target.value)} placeholder="مثال: إدارة البرامج" className="mt-1.5 rounded-lg" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">المدينة *</Label>
                          <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="الرياض" className="mt-1.5 rounded-lg" />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-medium">نمط العمل *</Label>
                          <Select value={form.remote_type} onValueChange={v => update("remote_type", v)}>
                            <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(remoteLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">نوع الدوام *</Label>
                          <Select value={form.employment_type} onValueChange={v => update("employment_type", v)}>
                            <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(empLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <Label className="text-xs font-medium">المستوى الوظيفي *</Label>
                          <Select value={form.experience_level} onValueChange={v => update("experience_level", v)}>
                            <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(levelLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">عدد الشواغر *</Label>
                          <Input type="number" min={1} value={form.vacancies} onChange={e => update("vacancies", parseInt(e.target.value) || 1)} className="mt-1.5 rounded-lg" dir="ltr" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">تاريخ الإغلاق *</Label>
                          <Input type="date" value={form.closing_date} onChange={e => update("closing_date", e.target.value)} className="mt-1.5 rounded-lg" dir="ltr" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═══ Section 2: Details (AI) ═══ */}
                  {activeSection === "details" && (
                    <div className="space-y-5">
                      {/* AI Button */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/20">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          <span className="text-xs font-medium text-foreground">توليد المحتوى بالذكاء الاصطناعي</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="outline" className="rounded-lg gap-1.5 text-xs" onClick={() => generateWithAI()} disabled={aiLoading}>
                            {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                            توليد
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="rounded-lg text-xs gap-1" disabled={aiLoading}>
                                <RefreshCw className="h-3 w-3" /> أسلوب
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => generateWithAI("brief")}>مختصر</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateWithAI("detailed")}>تفصيلي</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateWithAI("professional")}>مهني راقٍ</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateWithAI("formal")}>رسمي</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">الملخص *</Label>
                          <RewriteButton loading={aiLoading} onRewrite={async (style) => {
                            const r = await rewriteSection("الملخص", form.summary, style);
                            if (r) update("summary", r);
                          }} />
                        </div>
                        <Textarea value={form.summary} onChange={e => update("summary", e.target.value)} placeholder="ملخص سريع عن الوظيفة (2-3 أسطر)" className="mt-1.5 rounded-lg" rows={3} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">الوصف الوظيفي *</Label>
                          <RewriteButton loading={aiLoading} onRewrite={async (style) => {
                            const r = await rewriteSection("الوصف", form.description, style);
                            if (r) update("description", r);
                          }} />
                        </div>
                        <Textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="وصف تفصيلي للوظيفة..." className="mt-1.5 rounded-lg" rows={6} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">المسؤوليات *</Label>
                          <RewriteButton loading={aiLoading} onRewrite={async (style) => {
                            const r = await rewriteSection("المسؤوليات", form.responsibilities, style);
                            if (r) update("responsibilities", r);
                          }} />
                        </div>
                        <Textarea value={form.responsibilities} onChange={e => update("responsibilities", e.target.value)} placeholder="• المسؤولية الأولى&#10;• المسؤولية الثانية" className="mt-1.5 rounded-lg" rows={6} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">المتطلبات *</Label>
                          <RewriteButton loading={aiLoading} onRewrite={async (style) => {
                            const r = await rewriteSection("المتطلبات", form.requirements, style);
                            if (r) update("requirements", r);
                          }} />
                        </div>
                        <Textarea value={form.requirements} onChange={e => update("requirements", e.target.value)} placeholder="• المتطلب الأول&#10;• المتطلب الثاني" className="mt-1.5 rounded-lg" rows={6} />
                      </div>

                      <Separator />

                      {/* Skills */}
                      <div>
                        <Label className="text-xs font-medium">المهارات *</Label>
                        <div className="flex gap-2 mt-1.5">
                          <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="أضف مهارة" className="rounded-lg"
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); }}} />
                          <Button variant="outline" size="icon" className="rounded-lg shrink-0" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {form.skills.map((s, i) => (
                            <Badge key={i} variant="secondary" className="rounded-full gap-1 text-xs">
                              {s} <X className="h-3 w-3 cursor-pointer" onClick={() => update("skills", form.skills.filter((_, j) => j !== i))} />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Experience range */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-medium">سنوات الخبرة (من)</Label>
                          <Input type="number" min={0} value={form.experience_years_min} onChange={e => update("experience_years_min", e.target.value)} className="mt-1.5 rounded-lg" dir="ltr" placeholder="0" />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">سنوات الخبرة (إلى)</Label>
                          <Input type="number" min={0} value={form.experience_years_max} onChange={e => update("experience_years_max", e.target.value)} className="mt-1.5 rounded-lg" dir="ltr" placeholder="10" />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-medium">المؤهل العلمي</Label>
                          <Select value={form.education} onValueChange={v => update("education", v)}>
                            <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high_school">ثانوية</SelectItem>
                              <SelectItem value="diploma">دبلوم</SelectItem>
                              <SelectItem value="bachelors">بكالوريوس</SelectItem>
                              <SelectItem value="masters">ماجستير</SelectItem>
                              <SelectItem value="phd">دكتوراه</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Languages */}
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">اللغات</Label>
                          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={() => update("languages", [...form.languages, { language: "", level: "" }])}>
                            <Plus className="h-3 w-3" /> إضافة
                          </Button>
                        </div>
                        {form.languages.map((lang, i) => (
                          <div key={i} className="flex gap-2 mt-2 items-center">
                            <Input value={lang.language} placeholder="اللغة" className="rounded-lg"
                              onChange={e => { const l = [...form.languages]; l[i] = { ...l[i], language: e.target.value }; update("languages", l); }} />
                            <Select value={lang.level} onValueChange={v => { const l = [...form.languages]; l[i] = { ...l[i], level: v }; update("languages", l); }}>
                              <SelectTrigger className="rounded-lg w-32"><SelectValue placeholder="المستوى" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">مبتدئ</SelectItem>
                                <SelectItem value="intermediate">متوسط</SelectItem>
                                <SelectItem value="advanced">متقدم</SelectItem>
                                <SelectItem value="native">لغة أم</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => update("languages", form.languages.filter((_, j) => j !== i))}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ═══ Section 3: Salary ═══ */}
                  {activeSection === "salary" && (
                    <div className="space-y-5">
                      <div>
                        <Label className="text-xs font-medium">عرض الراتب</Label>
                        <Select value={form.salary_display} onValueChange={v => update("salary_display", v)}>
                          <SelectTrigger className="mt-1.5 rounded-lg max-w-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(salaryDisplayLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      {form.salary_display !== "hidden" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label className="text-xs font-medium">الحد الأدنى (ر.س)</Label>
                            <Input type="number" value={form.salary_min} onChange={e => update("salary_min", e.target.value)} placeholder="5000" className="mt-1.5 rounded-lg" dir="ltr" />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">الحد الأقصى (ر.س)</Label>
                            <Input type="number" value={form.salary_max} onChange={e => update("salary_max", e.target.value)} placeholder="15000" className="mt-1.5 rounded-lg" dir="ltr" />
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <Label className="text-xs font-medium">المزايا</Label>
                        <div className="flex gap-2 mt-1.5">
                          <Input value={benefitInput} onChange={e => setBenefitInput(e.target.value)} placeholder="مثال: تأمين طبي" className="rounded-lg"
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); }}} />
                          <Button variant="outline" size="icon" className="rounded-lg shrink-0" onClick={addBenefit}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {form.benefits.map((b, i) => (
                            <Badge key={i} variant="secondary" className="rounded-full gap-1 text-xs">
                              {b} <X className="h-3 w-3 cursor-pointer" onClick={() => update("benefits", form.benefits.filter((_, j) => j !== i))} />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs font-medium">طريقة التقديم</Label>
                        <Select value={form.application_method} onValueChange={v => update("application_method", v)}>
                          <SelectTrigger className="mt-1.5 rounded-lg max-w-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal_form">نموذج المنصة</SelectItem>
                            <SelectItem value="external_url">رابط خارجي</SelectItem>
                            <SelectItem value="email">بريد إلكتروني</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {form.application_method === "email" && (
                        <div>
                          <Label className="text-xs font-medium">البريد الإلكتروني للتقديم</Label>
                          <Input type="email" value={form.application_email} onChange={e => update("application_email", e.target.value)} className="mt-1.5 rounded-lg" dir="ltr" />
                        </div>
                      )}
                      {form.application_method === "external_url" && (
                        <div>
                          <Label className="text-xs font-medium">رابط التقديم</Label>
                          <Input type="url" value={form.application_url} onChange={e => update("application_url", e.target.value)} className="mt-1.5 rounded-lg" dir="ltr" placeholder="https://" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ Section 4: Screening ═══ */}
                  {activeSection === "screening" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-medium">أسئلة الفرز</Label>
                          <p className="text-[11px] text-muted-foreground mt-0.5">أضف أسئلة لتصفية المتقدمين</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> إضافة سؤال</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => addScreeningQuestion("yes_no")}>سؤال نعم / لا</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addScreeningQuestion("text")}>سؤال نصي</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addScreeningQuestion("file")}>طلب رفع ملف</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {form.screening_questions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">لم تُضف أسئلة فرز بعد (اختياري)</p>
                        </div>
                      )}
                      {form.screening_questions.map((q, i) => (
                        <div key={i} className="flex gap-2 items-start p-3 rounded-lg border border-border/60 bg-muted/20">
                          <Badge variant="outline" className="text-[10px] shrink-0 mt-1">
                            {q.type === "yes_no" ? "نعم/لا" : q.type === "text" ? "نصي" : "ملف"}
                          </Badge>
                          <Input value={q.question} placeholder="اكتب السؤال هنا..." className="rounded-lg text-xs"
                            onChange={e => { const qs = [...form.screening_questions]; qs[i] = { ...qs[i], question: e.target.value }; update("screening_questions", qs); }} />
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => update("screening_questions", form.screening_questions.filter((_, j) => j !== i))}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ═══ Section 5: Preview ═══ */}
                  {activeSection === "preview" && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">راجِع النص وعدّله حسب واقع الوظيفة قبل الإرسال. المحتوى المولّد بالذكاء الاصطناعي قد يحتاج تعديلات.</p>
                      </div>

                      <div className="rounded-xl border border-border/60 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-foreground">{form.title || "المسمى الوظيفي"}</h2>
                        <div className="flex flex-wrap gap-2">
                          {form.city && <Badge variant="secondary" className="rounded-full text-xs gap-1"><MapPin className="h-3 w-3" />{form.city}</Badge>}
                          {form.employment_type && <Badge variant="secondary" className="rounded-full text-xs gap-1"><Clock className="h-3 w-3" />{empLabels[form.employment_type]}</Badge>}
                          {form.remote_type && <Badge variant="secondary" className="rounded-full text-xs gap-1">{remoteLabels[form.remote_type]}</Badge>}
                          {form.experience_level && form.experience_level !== "any" && <Badge variant="secondary" className="rounded-full text-xs gap-1">{levelLabels[form.experience_level]}</Badge>}
                          {form.vacancies > 1 && <Badge variant="secondary" className="rounded-full text-xs gap-1"><Users className="h-3 w-3" />{form.vacancies} شواغر</Badge>}
                        </div>

                        {form.summary && <><Separator /><div><h4 className="text-xs font-bold text-foreground mb-1">الملخص</h4><p className="text-sm text-muted-foreground">{form.summary}</p></div></>}
                        {form.description && <><Separator /><div><h4 className="text-xs font-bold text-foreground mb-1">الوصف</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{form.description}</p></div></>}
                        {form.responsibilities && <><Separator /><div><h4 className="text-xs font-bold text-foreground mb-1">المسؤوليات</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{form.responsibilities}</p></div></>}
                        {form.requirements && <><Separator /><div><h4 className="text-xs font-bold text-foreground mb-1">المتطلبات</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{form.requirements}</p></div></>}

                        {form.skills.length > 0 && <><Separator /><div><h4 className="text-xs font-bold text-foreground mb-1">المهارات</h4><div className="flex flex-wrap gap-1.5">{form.skills.map((s, i) => <Badge key={i} variant="outline" className="rounded-full text-xs">{s}</Badge>)}</div></div></>}

                        {form.salary_display !== "hidden" && (form.salary_min || form.salary_max) && (
                          <><Separator /><div><h4 className="text-xs font-bold text-foreground mb-1">الراتب</h4><p className="text-sm text-muted-foreground">{form.salary_min}{form.salary_max ? ` - ${form.salary_max}` : ""} ر.س</p></div></>
                        )}

                        {form.benefits.length > 0 && <><Separator /><div><h4 className="text-xs font-bold text-foreground mb-1">المزايا</h4><div className="flex flex-wrap gap-1.5">{form.benefits.map((b, i) => <Badge key={i} variant="outline" className="rounded-full text-xs">{b}</Badge>)}</div></div></>}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button variant="ghost" className="rounded-lg gap-1.5" disabled={sectionIdx === 0}
                  onClick={() => setActiveSection(sections[sectionIdx - 1]?.id)}>
                  <ArrowRight className="h-4 w-4" /> السابق
                </Button>
                {sectionIdx < sections.length - 1 ? (
                  <Button className="rounded-lg gap-1.5" onClick={() => setActiveSection(sections[sectionIdx + 1]?.id)}>
                    التالي <ArrowLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="rounded-lg gap-1.5" onClick={submitForReview} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} إرسال للاعتماد
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">معاينة الإعلان</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">{form.title || "المسمى الوظيفي"}</h3>
                  {form.department && <p className="text-[11px] text-muted-foreground">{form.department}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {form.city && <Badge variant="secondary" className="rounded-full text-[10px] gap-1"><MapPin className="h-3 w-3" />{form.city}</Badge>}
                    {form.employment_type && <Badge variant="secondary" className="rounded-full text-[10px] gap-1"><Clock className="h-3 w-3" />{empLabels[form.employment_type]}</Badge>}
                    {form.remote_type && <Badge variant="secondary" className="rounded-full text-[10px] gap-1">{remoteLabels[form.remote_type]}</Badge>}
                    {form.salary_display !== "hidden" && form.salary_min && <Badge variant="secondary" className="rounded-full text-[10px] gap-1"><DollarSign className="h-3 w-3" />{form.salary_min}{form.salary_max ? ` - ${form.salary_max}` : ""} ر.س</Badge>}
                  </div>
                  {form.summary && <p className="text-[11px] text-muted-foreground line-clamp-3">{form.summary}</p>}
                  {form.skills.length > 0 && <div className="flex flex-wrap gap-1">{form.skills.slice(0, 5).map((s, i) => <Badge key={i} variant="outline" className="rounded-full text-[9px]">{s}</Badge>)}{form.skills.length > 5 && <span className="text-[9px] text-muted-foreground">+{form.skills.length - 5}</span>}</div>}
                  {form.closing_date && <p className="text-[10px] text-muted-foreground">الإغلاق: {form.closing_date}</p>}
                </div>
              </CardContent>
            </Card>
            <p className="text-[10px] text-muted-foreground text-center">معاينة تقريبية للإعلان</p>
          </div>
        </div>
      </div>

      {/* AI Loading Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> جارٍ التوليد
            </DialogTitle>
            <DialogDescription>يتم إنشاء المحتوى بالذكاء الاصطناعي...</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// ─── Rewrite Button Component ───
const RewriteButton = ({ loading, onRewrite }: { loading: boolean; onRewrite: (style: string) => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6 text-accent" disabled={loading}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        تحسين
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onRewrite("brief")}>مختصر</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onRewrite("detailed")}>تفصيلي</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onRewrite("professional")}>مهني راقٍ</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onRewrite("formal")}>رسمي</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default PortalNewJob;
