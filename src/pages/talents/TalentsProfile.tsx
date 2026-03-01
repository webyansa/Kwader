import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  User, Save, Briefcase, GraduationCap, Award, FolderOpen, Heart, Globe, Linkedin,
  Plus, Trash2, Sparkles, ExternalLink, Eye, QrCode, MapPin, AtSign, Shield, ChevronDown, ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Experience { title: string; company: string; period: string; description: string; }
interface Project { title: string; description: string; url: string; }
interface Volunteering { role: string; organization: string; period: string; }

const SECTION_WEIGHTS = { basics: 20, summary: 15, skills: 15, experiences: 20, education: 10, certifications: 5, projects: 5, avatar: 10 };

const TalentsProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic info
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [city, setCity] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Content
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");

  // Structured
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [volunteering, setVolunteering] = useState<Volunteering[]>([]);

  // Privacy
  const [privacy, setPrivacy] = useState("public");
  const [hideContact, setHideContact] = useState(true);

  // Sections
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
    // avatar placeholder
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

  const toggleSection = (id: string) => setOpenSection(openSection === id ? null : id);

  const Section = ({ id, title, icon: Icon, children, badge }: { id: string; title: string; icon: any; children: React.ReactNode; badge?: string }) => (
    <Card className="overflow-hidden">
      <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between p-5 text-right hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display font-bold text-foreground">{title}</span>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        {openSection === id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>
      {openSection === id && <CardContent className="pt-0 pb-5 px-5 space-y-4 border-t">{children}</CardContent>}
    </Card>
  );

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl" dir="rtl">
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
      <Card>
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
      <Section id="basics" title="البيانات الأساسية" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><AtSign className="h-3.5 w-3.5" />اسم المستخدم (Username)</Label>
            <Input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} placeholder="your-username" dir="ltr" className="text-left" maxLength={30} />
            <p className="text-xs text-muted-foreground">رابطك: /talent/{username || "..."}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label>المسمّى المهني</Label>
          <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="مثال: أخصائي موارد بشرية" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />المدينة</Label>
            <Input value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>مستوى الخبرة</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">مبتدئ</SelectItem>
                <SelectItem value="mid">متوسط</SelectItem>
                <SelectItem value="senior">خبير</SelectItem>
                <SelectItem value="leadership">قيادي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Linkedin className="h-3.5 w-3.5" />LinkedIn</Label>
            <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />Portfolio</Label>
            <Input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://..." dir="ltr" />
          </div>
        </div>
      </Section>

      {/* Summary */}
      <Section id="summary" title="النبذة المهنية" icon={Sparkles}>
        <Textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} placeholder="اكتب نبذة احترافية عن خبراتك وأهدافك..." maxLength={1000} />
        <p className="text-xs text-muted-foreground">{summary.length}/1000 حرف · استخدم استوديو CV لتوليد نبذة بالذكاء الاصطناعي</p>
      </Section>

      {/* Skills */}
      <Section id="skills" title="المهارات" icon={Award} badge={skills ? `${skills.split(",").filter(Boolean).length}` : "0"}>
        <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="إدارة مشاريع, تسويق, محاسبة..." />
        <p className="text-xs text-muted-foreground">افصل المهارات بفاصلة · 3-10 مهارات مثالية</p>
      </Section>

      {/* Experiences */}
      <Section id="experiences" title="الخبرات العملية" icon={Briefcase} badge={`${experiences.length}`}>
        {experiences.map((exp, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-foreground">خبرة {i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => setExperiences(experiences.filter((_, j) => j !== i))} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="المسمى الوظيفي" value={exp.title} onChange={e => { const n = [...experiences]; n[i] = { ...n[i], title: e.target.value }; setExperiences(n); }} />
              <Input placeholder="الجهة" value={exp.company} onChange={e => { const n = [...experiences]; n[i] = { ...n[i], company: e.target.value }; setExperiences(n); }} />
            </div>
            <Input placeholder="الفترة (مثال: 2020 - 2023)" value={exp.period} onChange={e => { const n = [...experiences]; n[i] = { ...n[i], period: e.target.value }; setExperiences(n); }} />
            <Textarea placeholder="وصف المهام والإنجازات" value={exp.description} onChange={e => { const n = [...experiences]; n[i] = { ...n[i], description: e.target.value }; setExperiences(n); }} rows={2} />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setExperiences([...experiences, { title: "", company: "", period: "", description: "" }])} className="gap-1.5">
          <Plus className="h-4 w-4" />إضافة خبرة
        </Button>
      </Section>

      {/* Education */}
      <Section id="education" title="التعليم" icon={GraduationCap}>
        <Textarea value={education} onChange={e => setEducation(e.target.value)} rows={3} placeholder="بكالوريوس إدارة أعمال - جامعة الملك سعود (2018)" />
      </Section>

      {/* Certifications */}
      <Section id="certifications" title="الشهادات المهنية" icon={Award}>
        <Textarea value={certifications} onChange={e => setCertifications(e.target.value)} rows={2} placeholder="PMP, SHRM-CP, ..." />
      </Section>

      {/* Projects */}
      <Section id="projects" title="المشاريع والإنجازات" icon={FolderOpen} badge={`${projects.length}`}>
        {projects.map((p, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-foreground">مشروع {i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => setProjects(projects.filter((_, j) => j !== i))} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Input placeholder="اسم المشروع" value={p.title} onChange={e => { const n = [...projects]; n[i] = { ...n[i], title: e.target.value }; setProjects(n); }} />
            <Textarea placeholder="وصف مختصر" value={p.description} onChange={e => { const n = [...projects]; n[i] = { ...n[i], description: e.target.value }; setProjects(n); }} rows={2} />
            <Input placeholder="رابط (اختياري)" value={p.url} onChange={e => { const n = [...projects]; n[i] = { ...n[i], url: e.target.value }; setProjects(n); }} dir="ltr" />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setProjects([...projects, { title: "", description: "", url: "" }])} className="gap-1.5">
          <Plus className="h-4 w-4" />إضافة مشروع
        </Button>
      </Section>

      {/* Volunteering */}
      <Section id="volunteering" title="التطوع" icon={Heart} badge={`${volunteering.length}`}>
        {volunteering.map((v, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-foreground">تطوع {i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => setVolunteering(volunteering.filter((_, j) => j !== i))} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Input placeholder="الدور" value={v.role} onChange={e => { const n = [...volunteering]; n[i] = { ...n[i], role: e.target.value }; setVolunteering(n); }} />
            <Input placeholder="الجهة" value={v.organization} onChange={e => { const n = [...volunteering]; n[i] = { ...n[i], organization: e.target.value }; setVolunteering(n); }} />
            <Input placeholder="الفترة" value={v.period} onChange={e => { const n = [...volunteering]; n[i] = { ...n[i], period: e.target.value }; setVolunteering(n); }} />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setVolunteering([...volunteering, { role: "", organization: "", period: "" }])} className="gap-1.5">
          <Plus className="h-4 w-4" />إضافة تطوع
        </Button>
      </Section>

      {/* Privacy */}
      <Section id="privacy" title="الخصوصية" icon={Shield}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>ظهور الملف</Label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">عام — يظهر للجميع</SelectItem>
                <SelectItem value="link_only">برابط فقط — من عنده الرابط يشوفه</SelectItem>
                <SelectItem value="hidden">مخفي — ما يظهر لأحد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>إخفاء البريد والجوال من الصفحة العامة</Label>
            <Switch checked={hideContact} onCheckedChange={setHideContact} />
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1 h-12 rounded-xl gap-2 text-base">
          <Save className="h-5 w-5" />{saving ? "جارٍ الحفظ..." : "حفظ الملف المهني"}
        </Button>
      </div>
    </div>
  );
};

export default TalentsProfile;
