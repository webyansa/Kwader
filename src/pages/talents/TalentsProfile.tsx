import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User, Save, Briefcase, GraduationCap, Award, FolderOpen, Heart, Globe, Linkedin,
  Plus, Trash2, Sparkles, Eye, MapPin, AtSign, Shield, ChevronDown, ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Experience { title: string; company: string; period: string; description: string; }
interface Project { title: string; description: string; url: string; }
interface Volunteering { role: string; organization: string; period: string; }

const SECTION_WEIGHTS = { basics: 20, summary: 15, skills: 15, experiences: 20, education: 10, certifications: 5, projects: 5, avatar: 10 };

// ── Accordion Section (extracted outside render to prevent remount) ──
const ProfileSection = ({
  id, title, icon: Icon, badge, isOpen, onToggle, children,
}: {
  id: string; title: string; icon: React.ElementType; badge?: string;
  isOpen: boolean; onToggle: (id: string) => void; children: React.ReactNode;
}) => (
  <Card className="overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between p-5 text-right hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="font-display font-bold text-foreground text-base">{title}</span>
        {badge && (
          <Badge variant="secondary" className="text-xs font-semibold rounded-full px-2.5">
            {badge}
          </Badge>
        )}
      </div>
      {isOpen ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
      )}
    </button>
    {isOpen && (
      <CardContent className="pt-0 pb-6 px-6 space-y-4 border-t border-border/40 animate-in fade-in-0 slide-in-from-top-2 duration-200">
        {children}
      </CardContent>
    )}
  </Card>
);

// ── Structured Item Card ──
const ItemCard = ({
  label, index, onDelete, children,
}: {
  label: string; index: number; onDelete: () => void; children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3 relative group">
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold text-foreground">{label} {index + 1}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 text-destructive opacity-60 hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
    {children}
  </div>
);

// ── Field wrapper ──
const Field = ({ label, icon: Icon, children, hint }: {
  label: string; icon?: React.ElementType; children: React.ReactNode; hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-sm font-medium">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      {label}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const TalentsProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [city, setCity] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [volunteering, setVolunteering] = useState<Volunteering[]>([]);
  const [privacy, setPrivacy] = useState("public");
  const [hideContact, setHideContact] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>("basics");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("job_seeker_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setUsername((data as any).username || "");
          setHeadline((data as any).headline || "");
          setCity(data.city || "");
          setExperienceLevel(data.experience_level || "");
          setSummary(data.summary || "");
          setSkills((data.skills || []).join(", "));
          setEducation(data.education || "");
          setCertifications(data.certifications || "");
          setLinkedinUrl(data.linkedin_url || "");
          setPortfolioUrl(data.portfolio_url || "");
          setExperiences(((data as any).experiences as Experience[]) || []);
          setProjects(((data as any).projects as Project[]) || []);
          setVolunteering(((data as any).volunteering as Volunteering[]) || []);
          setPrivacy((data as any).privacy || "public");
          setHideContact((data as any).hide_contact ?? true);
        }
        setLoading(false);
      });
  }, [user]);

  const completionPct = useMemo(() => {
    let score = 0;
    if (fullName && city) score += SECTION_WEIGHTS.basics;
    if (summary && summary.length > 20) score += SECTION_WEIGHTS.summary;
    if (skills) score += SECTION_WEIGHTS.skills;
    if (experiences.length > 0) score += SECTION_WEIGHTS.experiences;
    if (education) score += SECTION_WEIGHTS.education;
    if (certifications) score += SECTION_WEIGHTS.certifications;
    if (projects.length > 0) score += SECTION_WEIGHTS.projects;
    return Math.min(score, 100);
  }, [fullName, city, summary, skills, experiences, education, certifications, projects]);

  const handleSave = async () => {
    if (!user) return;
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      toast({ title: "اسم المستخدم مطلوب", description: "أدخل اسم مستخدم لتفعيل رابط ملفك العام.", variant: "destructive" });
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      toast({ title: "اسم مستخدم غير صالح", description: "استخدم أحرف إنجليزية وأرقام و underscore فقط (3-30).", variant: "destructive" });
      return;
    }
    const { data: existing } = await supabase
      .from("job_seeker_profiles")
      .select("user_id")
      .eq("username", normalizedUsername)
      .neq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      toast({ title: "اسم المستخدم محجوز", description: "اختر اسم مستخدم آخر.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const skillsArr = skills.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase
      .from("job_seeker_profiles")
      .update({
        full_name: fullName || null,
        username: normalizedUsername,
        headline: headline || null,
        city: city || null,
        experience_level: experienceLevel || null,
        skills: skillsArr,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        summary: summary || null,
        education: education || null,
        certifications: certifications || null,
        experiences: experiences,
        projects: projects,
        volunteering: volunteering,
        privacy: privacy,
        hide_contact: hideContact,
        profile_completion_percentage: completionPct,
      } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "خطأ في الحفظ", description: error.message, variant: "destructive" });
    } else {
      setUsername(normalizedUsername);
      toast({ title: "تم حفظ ملفك بنجاح ✅" });
    }
  };

  const toggleSection = useCallback((id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  }, []);

  // ── Handlers for structured arrays (stable via useCallback) ──
  const updateExperience = useCallback((index: number, field: keyof Experience, value: string) => {
    setExperiences(prev => prev.map((exp, i) => i === index ? { ...exp, [field]: value } : exp));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addExperience = useCallback(() => {
    setExperiences(prev => [...prev, { title: "", company: "", period: "", description: "" }]);
  }, []);

  const updateProject = useCallback((index: number, field: keyof Project, value: string) => {
    setProjects(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }, []);

  const removeProject = useCallback((index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addProject = useCallback(() => {
    setProjects(prev => [...prev, { title: "", description: "", url: "" }]);
  }, []);

  const updateVolunteering = useCallback((index: number, field: keyof Volunteering, value: string) => {
    setVolunteering(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  }, []);

  const removeVolunteering = useCallback((index: number) => {
    setVolunteering(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addVolunteering = useCallback(() => {
    setVolunteering(prev => [...prev, { role: "", organization: "", period: "" }]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">الملف المهني</h1>
            <p className="text-sm text-muted-foreground">كلّ ما تكمل ملفك، فرصك تزيد 🚀</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {username && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 rounded-xl">
              <Link to={`/talent/${username}`} target="_blank"><Eye className="h-4 w-4" />معاينة</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild className="gap-1.5 rounded-xl">
            <Link to="/talents/cv"><Sparkles className="h-4 w-4" />استوديو CV</Link>
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">اكتمال الملف</span>
            <span className="text-sm font-bold text-primary">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2.5" />
          {completionPct < 70 && (
            <p className="text-xs text-muted-foreground mt-2">💡 كمّل ملفك عشان تظهر للجهات الموظفة وتقدّم أسرع</p>
          )}
        </CardContent>
      </Card>

      {/* Basic Info */}
      <ProfileSection id="basics" title="البيانات الأساسية" icon={User} isOpen={openSection === "basics"} onToggle={toggleSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="الاسم الكامل">
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="محمد أحمد العلي" />
          </Field>
          <Field label="اسم المستخدم (Username)" icon={AtSign} hint={`رابطك: /talent/${username || "..."}`}>
            <Input
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              placeholder="your-username"
              dir="ltr"
              className="text-left font-mono"
              maxLength={30}
            />
          </Field>
        </div>
        <Field label="المسمّى المهني">
          <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="مثال: أخصائي موارد بشرية" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="المدينة" icon={MapPin}>
            <Input value={city} onChange={e => setCity(e.target.value)} placeholder="الرياض" />
          </Field>
          <Field label="مستوى الخبرة">
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">مبتدئ</SelectItem>
                <SelectItem value="mid">متوسط</SelectItem>
                <SelectItem value="senior">خبير</SelectItem>
                <SelectItem value="leadership">قيادي</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="LinkedIn" icon={Linkedin}>
            <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." dir="ltr" className="text-left" />
          </Field>
          <Field label="Portfolio / الموقع الشخصي" icon={Globe}>
            <Input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://..." dir="ltr" className="text-left" />
          </Field>
        </div>
      </ProfileSection>

      {/* Summary */}
      <ProfileSection id="summary" title="النبذة المهنية" icon={Sparkles} isOpen={openSection === "summary"} onToggle={toggleSection}>
        <Textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={5}
          placeholder="اكتب نبذة احترافية عن خبراتك وأهدافك المهنية..."
          maxLength={1000}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{summary.length}/1000 حرف</p>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-xs text-primary">
            <Link to="/talents/cv"><Sparkles className="h-3 w-3" /> توليد بالذكاء الاصطناعي</Link>
          </Button>
        </div>
      </ProfileSection>

      {/* Skills */}
      <ProfileSection
        id="skills" title="المهارات" icon={Award}
        badge={skills ? `${skills.split(",").filter(Boolean).length}` : "0"}
        isOpen={openSection === "skills"} onToggle={toggleSection}
      >
        <Textarea
          value={skills}
          onChange={e => setSkills(e.target.value)}
          placeholder="إدارة مشاريع, تسويق رقمي, محاسبة, تطوير الأعمال..."
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">افصل المهارات بفاصلة · 3-10 مهارات مثالية</p>
        {skills && (
          <div className="flex flex-wrap gap-2 pt-1">
            {skills.split(",").map(s => s.trim()).filter(Boolean).map((skill, i) => (
              <Badge key={i} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </ProfileSection>

      {/* Experiences */}
      <ProfileSection
        id="experiences" title="الخبرات العملية" icon={Briefcase}
        badge={`${experiences.length}`}
        isOpen={openSection === "experiences"} onToggle={toggleSection}
      >
        {experiences.map((exp, i) => (
          <ItemCard key={i} label="خبرة" index={i} onDelete={() => removeExperience(i)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="المسمى الوظيفي" value={exp.title} onChange={e => updateExperience(i, "title", e.target.value)} />
              <Input placeholder="الجهة" value={exp.company} onChange={e => updateExperience(i, "company", e.target.value)} />
            </div>
            <Input placeholder="الفترة (مثال: 2020 - 2023)" value={exp.period} onChange={e => updateExperience(i, "period", e.target.value)} />
            <Textarea placeholder="وصف المهام والإنجازات" value={exp.description} onChange={e => updateExperience(i, "description", e.target.value)} rows={2} className="resize-none" />
          </ItemCard>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addExperience} className="gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> إضافة خبرة
        </Button>
      </ProfileSection>

      {/* Education */}
      <ProfileSection id="education" title="التعليم" icon={GraduationCap} isOpen={openSection === "education"} onToggle={toggleSection}>
        <Textarea
          value={education}
          onChange={e => setEducation(e.target.value)}
          rows={3}
          placeholder="بكالوريوس إدارة أعمال - جامعة الملك سعود (2018)"
          className="resize-none"
        />
      </ProfileSection>

      {/* Certifications */}
      <ProfileSection id="certifications" title="الشهادات المهنية" icon={Award} isOpen={openSection === "certifications"} onToggle={toggleSection}>
        <Textarea
          value={certifications}
          onChange={e => setCertifications(e.target.value)}
          rows={2}
          placeholder="PMP, SHRM-CP, شهادة CFA..."
          className="resize-none"
        />
      </ProfileSection>

      {/* Projects */}
      <ProfileSection
        id="projects" title="المشاريع والإنجازات" icon={FolderOpen}
        badge={`${projects.length}`}
        isOpen={openSection === "projects"} onToggle={toggleSection}
      >
        {projects.map((p, i) => (
          <ItemCard key={i} label="مشروع" index={i} onDelete={() => removeProject(i)}>
            <Input placeholder="اسم المشروع" value={p.title} onChange={e => updateProject(i, "title", e.target.value)} />
            <Textarea placeholder="وصف مختصر" value={p.description} onChange={e => updateProject(i, "description", e.target.value)} rows={2} className="resize-none" />
            <Input placeholder="رابط (اختياري)" value={p.url} onChange={e => updateProject(i, "url", e.target.value)} dir="ltr" className="text-left" />
          </ItemCard>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addProject} className="gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> إضافة مشروع
        </Button>
      </ProfileSection>

      {/* Volunteering */}
      <ProfileSection
        id="volunteering" title="التطوع" icon={Heart}
        badge={`${volunteering.length}`}
        isOpen={openSection === "volunteering"} onToggle={toggleSection}
      >
        {volunteering.map((v, i) => (
          <ItemCard key={i} label="تطوع" index={i} onDelete={() => removeVolunteering(i)}>
            <Input placeholder="الدور التطوعي" value={v.role} onChange={e => updateVolunteering(i, "role", e.target.value)} />
            <Input placeholder="الجهة" value={v.organization} onChange={e => updateVolunteering(i, "organization", e.target.value)} />
            <Input placeholder="الفترة" value={v.period} onChange={e => updateVolunteering(i, "period", e.target.value)} />
          </ItemCard>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addVolunteering} className="gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> إضافة تطوع
        </Button>
      </ProfileSection>

      {/* Privacy */}
      <ProfileSection id="privacy" title="الخصوصية" icon={Shield} isOpen={openSection === "privacy"} onToggle={toggleSection}>
        <Field label="ظهور الملف">
          <Select value={privacy} onValueChange={setPrivacy}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="public">عام — يظهر للجميع</SelectItem>
              <SelectItem value="link_only">برابط فقط — من عنده الرابط يشوفه</SelectItem>
              <SelectItem value="hidden">مخفي — ما يظهر لأحد</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">إخفاء بيانات التواصل</p>
            <p className="text-xs text-muted-foreground mt-0.5">البريد والجوال لن يظهران في الصفحة العامة</p>
          </div>
          <Switch checked={hideContact} onCheckedChange={setHideContact} />
        </div>
      </ProfileSection>

      {/* Save */}
      <div className="sticky bottom-4 z-10">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl gap-2 text-base shadow-lg"
          size="lg"
        >
          <Save className="h-5 w-5" />
          {saving ? "جارٍ الحفظ..." : "حفظ الملف المهني"}
        </Button>
      </div>
    </div>
  );
};

export default TalentsProfile;
