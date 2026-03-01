import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import {
  FileText, Download, Image as ImageIcon, Sparkles, Wand2, QrCode, Eye, Palette,
  Briefcase, GraduationCap, Award, MapPin, Mail, Phone, Linkedin, Globe, Star, Heart,
  ArrowLeftFromLine, Brain, User,
} from "lucide-react";

const TEMPLATES = [
  { id: "classic", name: "كلاسيكي", color: "bg-primary/10 border-primary/30" },
  { id: "modern", name: "عصري", color: "bg-accent/10 border-accent/30" },
  { id: "minimal", name: "بسيط", color: "bg-secondary border-border" },
];

const AI_ACTIONS = [
  { id: "summary", label: "🧠 اكتب نبذة احترافية", icon: Brain, prompt: "اكتب نبذة مهنية احترافية باللغة العربية" },
  { id: "achievements", label: "✨ حوّل خبرتي إلى إنجازات", icon: Sparkles, prompt: "حوّل الخبرات التالية إلى إنجازات قابلة للقياس" },
  { id: "skills", label: "✨ اقترح مهارات مناسبة", icon: Sparkles, prompt: "اقترح مهارات مهنية مناسبة بناءً على الملف التالي" },
];

const TalentsCVStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cvRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState("classic");
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string>("");
  const [aiAction, setAiAction] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const MIGRATE_LABELS: Record<string, { label: string; icon: typeof Star }> = {
    summary: { label: "ترحيل إلى النبذة المهنية", icon: Star },
    achievements: { label: "ترحيل إلى الخبرات (إنجازات)", icon: Briefcase },
    skills: { label: "ترحيل إلى المهارات", icon: Award },
  };

  const handleMigrate = async () => {
    if (!user || !aiResult || !aiAction) return;
    setMigrating(true);
    try {
      let updatePayload: Record<string, any> = {};
      if (aiAction === "summary") {
        updatePayload = { summary: aiResult };
      } else if (aiAction === "skills") {
        const skillsArr = aiResult.split(/[،,]/).map(s => s.trim()).filter(Boolean);
        updatePayload = { skills: skillsArr };
      } else if (aiAction === "achievements") {
        const currentExps = ((profile as any)?.experiences as any[]) || [];
        const newExp = { title: "إنجازات (مولّدة بالذكاء الاصطناعي)", company: "", period: "", description: aiResult };
        updatePayload = { experiences: [...currentExps, newExp] };
      }
      const { error } = await supabase
        .from("job_seeker_profiles")
        .update(updatePayload as any)
        .eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["talent-profile-cv", user.id] });
      toast({ title: "تم الترحيل بنجاح ✅", description: "تم حفظ المحتوى في ملفك المهني" });
      setAiResult("");
      setAiAction("");
    } catch (e: any) {
      toast({ title: "خطأ في الترحيل", description: e.message, variant: "destructive" });
    } finally {
      setMigrating(false);
    }
  };

  const { data: profile } = useQuery({
    queryKey: ["talent-profile-cv", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_seeker_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const profileUrl = profile && (profile as any).username
    ? `${window.location.origin}/@${(profile as any).username}`
    : "";

  const handleAI = async (action: typeof AI_ACTIONS[0]) => {
    if (!profile) return;
    setAiLoading(action.id);
    setAiAction(action.id);
    setAiResult("");
    const context = `الاسم: ${profile.full_name}\nالمسمى: ${(profile as any).headline || ""}\nالنبذة: ${profile.summary || ""}\nالمهارات: ${(profile.skills || []).join(", ")}\nالخبرات: ${JSON.stringify((profile as any).experiences || [])}\nالتعليم: ${profile.education || ""}`;
    try {
      const res = await supabase.functions.invoke("generate-cv-content", {
        body: { action: action.id, prompt: action.prompt, context, provider: aiProvider },
      });
      if (res.error) throw res.error;
      setAiResult(res.data?.content || "لم يتم توليد محتوى");
    } catch (e: any) {
      toast({ title: "خطأ في الذكاء الاصطناعي", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const handleExportPDF = async () => {
    if (!cvRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(cvRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${profile?.full_name || "cv"}-kwader.pdf`);
      toast({ title: "تم تصدير PDF بنجاح ✅" });
    } catch (e: any) {
      toast({ title: "خطأ في التصدير", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!cvRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cvRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${profile?.full_name || "cv"}-kwader.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "تم تصدير الصورة بنجاح ✅" });
    } catch (e: any) {
      toast({ title: "خطأ في التصدير", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const experiences = ((profile as any)?.experiences as any[]) || [];
  const projects = ((profile as any)?.projects as any[]) || [];
  const skills = profile?.skills || [];

  const templateStyles: Record<string, { accent: string; accentLight: string; headerGradient: string }> = {
    classic: { accent: "#1E2A78", accentLight: "#E8EAF6", headerGradient: "linear-gradient(135deg, #1E2A78 0%, #3949AB 100%)" },
    modern: { accent: "#6C5CE7", accentLight: "#EDE7F6", headerGradient: "linear-gradient(135deg, #6C5CE7 0%, #00C2FF 100%)" },
    minimal: { accent: "#37474F", accentLight: "#ECEFF1", headerGradient: "linear-gradient(135deg, #37474F 0%, #546E7A 100%)" },
  };
  const ts = templateStyles[template] || templateStyles.classic;

  const initials = (profile?.full_name || "؟").charAt(0);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#6C5CE7', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #6C5CE7, #00C2FF)' }}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">استوديو السيرة الذاتية</h1>
            <p className="text-sm text-muted-foreground">صمّم سيرتك بالذكاء الاصطناعي وصدّرها PDF أو صورة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Template picker */}
          <Card className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Palette className="h-4 w-4" />القالب</h3>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`rounded-xl border-2 p-3 text-center text-xs font-medium transition-all duration-200 hover:scale-[1.03] ${template === t.id ? "border-primary shadow-sm ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/20"} ${t.color}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI tools */}
          <Card className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 overflow-hidden">
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6C5CE7, #00C2FF)' }} />
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: '#6C5CE7' }} />
                أدوات الذكاء الاصطناعي
              </h3>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="chatgpt">ChatGPT</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                {AI_ACTIONS.map(a => (
                  <button
                    key={a.id}
                    disabled={!!aiLoading}
                    onClick={() => handleAI(a)}
                    className="group relative w-full flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(135deg, #6C5CE7, #00C2FF)',
                      boxShadow: '0 4px 15px -3px rgba(108, 92, 231, 0.4)',
                    }}
                  >
                    <a.icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    {aiLoading === a.id ? "جارٍ التوليد..." : a.label}
                    <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ boxShadow: '0 0 20px 4px rgba(108, 92, 231, 0.3)' }} />
                  </button>
                ))}
              </div>
              {aiResult && (
                <div className="rounded-xl border p-3 space-y-3" style={{ backgroundColor: '#F3F0FF', borderColor: '#D1C4E9' }}>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" style={{ color: '#6C5CE7' }} />
                    النتيجة:
                  </p>
                  <Textarea value={aiResult} onChange={e => setAiResult(e.target.value)} rows={5} className="text-sm rounded-lg border-[#D1C4E9] focus:ring-[#6C5CE7]" />
                  {MIGRATE_LABELS[aiAction] && (
                    <Button
                      size="sm"
                      className="w-full gap-2 rounded-xl text-white transition-all duration-200 hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #6C5CE7, #00C2FF)', boxShadow: '0 4px 12px -2px rgba(108,92,231,0.3)' }}
                      onClick={handleMigrate}
                      disabled={migrating}
                    >
                      <ArrowLeftFromLine className="h-4 w-4" />
                      {migrating ? "جارٍ الترحيل..." : MIGRATE_LABELS[aiAction].label}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">عدّل النص ثم رحّله لملفك المهني أو احفظه يدوياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export */}
          <Card className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Download className="h-4 w-4" />التصدير</h3>
              <Button
                className="w-full rounded-xl gap-2 text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #1E2A78, #3949AB)', boxShadow: '0 4px 12px -2px rgba(30,42,120,0.3)' }}
                onClick={handleExportPDF}
                disabled={exporting}
              >
                <FileText className="h-4 w-4" />{exporting ? "جارٍ..." : "تصدير PDF"}
              </Button>
              <Button variant="outline" className="w-full rounded-xl gap-2 transition-all duration-200 hover:scale-[1.02]" onClick={handleExportImage} disabled={exporting}>
                <ImageIcon className="h-4 w-4" />تصدير صورة PNG
              </Button>
            </CardContent>
          </Card>

          {/* QR */}
          {profileUrl && (
            <Card className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 self-start"><QrCode className="h-4 w-4" />QR الملف</h3>
                <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #F3F0FF, #E8F4FD)' }}>
                  <QRCodeSVG value={profileUrl} size={120} level="H" fgColor="#1E2A78" />
                </div>
                <p className="text-xs text-muted-foreground text-center">امسح للوصول لملفك العام</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CV Preview */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden rounded-2xl border shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ background: '#F7F9FC' }}>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5"><Eye className="h-4 w-4" />معاينة مباشرة</span>
                <Badge variant="secondary" className="rounded-lg">{TEMPLATES.find(t => t.id === template)?.name}</Badge>
              </div>
              <div className="p-4 overflow-auto" style={{ maxHeight: "80vh", background: '#F7F9FC' }}>
                <div ref={cvRef} className="rounded-2xl overflow-hidden" style={{ width: "100%", minHeight: 800, fontFamily: "'IBM Plex Sans Arabic', sans-serif", backgroundColor: '#fff', boxShadow: '0 8px 30px -6px rgba(0,0,0,0.08)' }}>
                  
                  {/* CV Header - Hero */}
                  <div className="p-8 pb-6 relative overflow-hidden" style={{ background: ts.headerGradient }}>
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: 'white' }} />
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: 'white' }} />
                    
                    <div className="relative flex items-center gap-6" dir="rtl">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {profile.avatar_url ? (
                          <div className="rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #6C5CE7, #00C2FF)' }}>
                            <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white" />
                          </div>
                        ) : (
                          <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30" style={{ background: 'linear-gradient(135deg, #6C5CE7, #00C2FF)' }}>
                            {initials}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-white leading-tight">{profile.full_name || "الاسم"}</h1>
                        {(profile as any).headline && (
                          <p className="text-sm mt-1.5 text-white/80 font-medium">{(profile as any).headline}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3">
                          {profile.city && (
                            <span className="flex items-center gap-1.5 text-xs text-white/70">
                              <MapPin className="h-3.5 w-3.5" />{profile.city}
                            </span>
                          )}
                          {profile.linkedin_url && (
                            <span className="flex items-center gap-1.5 text-xs text-white/70">
                              <Linkedin className="h-3.5 w-3.5" />LinkedIn
                            </span>
                          )}
                          {profile.portfolio_url && (
                            <span className="flex items-center gap-1.5 text-xs text-white/70">
                              <Globe className="h-3.5 w-3.5" />Portfolio
                            </span>
                          )}
                        </div>
                      </div>

                      {profileUrl && (
                        <div className="shrink-0 bg-white rounded-xl p-2 shadow-sm">
                          <QRCodeSVG value={profileUrl} size={64} level="M" fgColor={ts.accent} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CV Body - Two Column Layout */}
                  <div className="flex gap-0" dir="rtl" style={{ minHeight: 500 }}>
                    {/* Right Column (main) */}
                    <div className="flex-1 p-6 space-y-5">
                      {/* Summary */}
                      {profile.summary && (
                        <div>
                          <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: ts.accent, borderColor: ts.accent }}>
                            <User className="h-4 w-4" />النبذة المهنية
                          </h2>
                          <p className="text-xs text-gray-700 leading-[1.8] whitespace-pre-line">{profile.summary}</p>
                        </div>
                      )}

                      {/* Experiences */}
                      {experiences.length > 0 && (
                        <div>
                          <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: ts.accent, borderColor: ts.accent }}>
                            <Briefcase className="h-4 w-4" />الخبرات العملية
                          </h2>
                          <div className="space-y-3">
                            {experiences.map((exp: any, i: number) => (
                              <div key={i} className="pr-3 border-r-2 rounded-sm" style={{ borderColor: `${ts.accent}30` }}>
                                <div className="flex justify-between items-baseline">
                                  <h3 className="text-xs font-bold text-gray-800">{exp.title}</h3>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{exp.period}</span>
                                </div>
                                {exp.company && <p className="text-[11px] font-medium" style={{ color: ts.accent }}>{exp.company}</p>}
                                {exp.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{exp.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {projects.length > 0 && (
                        <div>
                          <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: ts.accent, borderColor: ts.accent }}>
                            <Star className="h-4 w-4" />المشاريع
                          </h2>
                          <div className="space-y-2">
                            {projects.map((p: any, i: number) => (
                              <div key={i} className="pr-3 border-r-2 rounded-sm" style={{ borderColor: `${ts.accent}30` }}>
                                <h3 className="text-xs font-bold text-gray-800">{p.title}</h3>
                                {p.description && <p className="text-xs text-gray-600 mt-0.5">{p.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Left Column (sidebar info) */}
                    <div className="w-[220px] shrink-0 p-5 space-y-5" style={{ backgroundColor: '#F7F9FC', borderRight: '1px solid #E8EAF6' }}>
                      {/* Skills */}
                      {skills.length > 0 && (
                        <div>
                          <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: ts.accent, borderColor: ts.accent }}>
                            <Award className="h-4 w-4" />المهارات
                          </h2>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((s: string, i: number) => (
                              <span
                                key={i}
                                className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                                style={{ backgroundColor: '#EDE7F6', color: '#4A148C' }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {profile.education && (
                        <div>
                          <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: ts.accent, borderColor: ts.accent }}>
                            <GraduationCap className="h-4 w-4" />التعليم
                          </h2>
                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{profile.education}</p>
                        </div>
                      )}

                      {/* Certifications */}
                      {profile.certifications && (
                        <div>
                          <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: ts.accent, borderColor: ts.accent }}>
                            <Award className="h-4 w-4" />الشهادات
                          </h2>
                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{profile.certifications}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CV Footer */}
                  <div className="px-6 py-3 text-center border-t" style={{ backgroundColor: '#F7F9FC', borderColor: '#E8EAF6' }}>
                    <p className="text-[10px] text-gray-400 font-medium">
                      أُصدرت هذه السيرة من منصة كوادر &nbsp;·&nbsp; www.kawader.sa
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TalentsCVStudio;
