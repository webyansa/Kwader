import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";

const TEMPLATES = [
  { id: "classic", name: "كلاسيكي", color: "bg-primary/10 border-primary/30" },
  { id: "modern", name: "عصري", color: "bg-accent/10 border-accent/30" },
  { id: "minimal", name: "بسيط", color: "bg-secondary border-border" },
];

const AI_ACTIONS = [
  { id: "summary", label: "اكتب نبذة احترافية", icon: Star, prompt: "اكتب نبذة مهنية احترافية باللغة العربية" },
  { id: "achievements", label: "حوّل خبرتي إلى إنجازات", icon: Briefcase, prompt: "حوّل الخبرات التالية إلى إنجازات قابلة للقياس" },
  { id: "skills", label: "اقترح مهارات مناسبة", icon: Award, prompt: "اقترح مهارات مهنية مناسبة بناءً على الملف التالي" },
];

const TalentsCVStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const cvRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState("classic");
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string>("");
  const [aiAction, setAiAction] = useState<string>("");
  const [exporting, setExporting] = useState(false);

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

  const templateStyles: Record<string, { accent: string; bg: string; headerBg: string }> = {
    classic: { accent: "#3b4fd4", bg: "#fff", headerBg: "#eef0ff" },
    modern: { accent: "#2a9d6a", bg: "#fff", headerBg: "#eefaf4" },
    minimal: { accent: "#444", bg: "#fff", headerBg: "#f8f8f8" },
  };
  const ts = templateStyles[template] || templateStyles.classic;

  if (!profile) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
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
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Palette className="h-4 w-4" />القالب</h3>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`rounded-xl border-2 p-3 text-center text-xs font-medium transition-all ${template === t.id ? "border-primary shadow-sm" : "border-transparent"} ${t.color}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI tools */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4" />أدوات الذكاء الاصطناعي</h3>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="chatgpt">ChatGPT</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                {AI_ACTIONS.map(a => (
                  <Button key={a.id} variant="outline" size="sm" className="w-full justify-start gap-2 rounded-xl" disabled={!!aiLoading} onClick={() => handleAI(a)}>
                    <a.icon className="h-4 w-4" />
                    {aiLoading === a.id ? "جارٍ التوليد..." : a.label}
                  </Button>
                ))}
              </div>
              {aiResult && (
                <div className="rounded-xl border bg-secondary/50 p-3 space-y-2">
                  <p className="text-xs font-bold text-foreground">النتيجة:</p>
                  <Textarea value={aiResult} onChange={e => setAiResult(e.target.value)} rows={5} className="text-sm" />
                  <p className="text-xs text-muted-foreground">عدّل النص ثم احفظه من صفحة الملف المهني</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Download className="h-4 w-4" />التصدير</h3>
              <Button className="w-full rounded-xl gap-2" onClick={handleExportPDF} disabled={exporting}>
                <FileText className="h-4 w-4" />{exporting ? "جارٍ..." : "تصدير PDF"}
              </Button>
              <Button variant="outline" className="w-full rounded-xl gap-2" onClick={handleExportImage} disabled={exporting}>
                <ImageIcon className="h-4 w-4" />تصدير صورة PNG
              </Button>
            </CardContent>
          </Card>

          {/* QR */}
          {profileUrl && (
            <Card>
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <h3 className="font-bold text-foreground flex items-center gap-2 self-start"><QrCode className="h-4 w-4" />QR الملف</h3>
                <QRCodeSVG value={profileUrl} size={120} level="H" />
                <p className="text-xs text-muted-foreground text-center">امسح للوصول لملفك العام</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CV Preview */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b px-4 py-2 bg-secondary/30">
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5"><Eye className="h-4 w-4" />معاينة مباشرة</span>
                <Badge variant="secondary">{TEMPLATES.find(t => t.id === template)?.name}</Badge>
              </div>
              <div className="p-4 overflow-auto" style={{ maxHeight: "80vh" }}>
                <div ref={cvRef} className="bg-white text-gray-900 rounded-lg shadow-sm border" style={{ width: "100%", minHeight: 800, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  {/* CV Header */}
                  <div className="p-8 pb-6" style={{ backgroundColor: ts.headerBg }}>
                    <div className="flex items-start gap-6" dir="rtl">
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold" style={{ color: ts.accent }}>{profile.full_name || "الاسم"}</h1>
                        {(profile as any).headline && <p className="text-sm mt-1 text-gray-600">{(profile as any).headline}</p>}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                          {profile.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.city}</span>}
                          {profile.linkedin_url && <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" />LinkedIn</span>}
                          {profile.portfolio_url && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />Portfolio</span>}
                        </div>
                      </div>
                      {profileUrl && (
                        <div className="shrink-0">
                          <QRCodeSVG value={profileUrl} size={64} level="M" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 pt-6 space-y-6" dir="rtl">
                    {/* Summary */}
                    {profile.summary && (
                      <div>
                        <h2 className="text-sm font-bold mb-2 pb-1 border-b-2" style={{ color: ts.accent, borderColor: ts.accent }}>النبذة المهنية</h2>
                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{profile.summary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div>
                        <h2 className="text-sm font-bold mb-2 pb-1 border-b-2" style={{ color: ts.accent, borderColor: ts.accent }}>المهارات</h2>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s: string, i: number) => (
                            <span key={i} className="rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: ts.headerBg, color: ts.accent }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experiences */}
                    {experiences.length > 0 && (
                      <div>
                        <h2 className="text-sm font-bold mb-2 pb-1 border-b-2" style={{ color: ts.accent, borderColor: ts.accent }}>الخبرات العملية</h2>
                        <div className="space-y-3">
                          {experiences.map((exp: any, i: number) => (
                            <div key={i}>
                              <div className="flex justify-between items-baseline">
                                <h3 className="text-xs font-bold text-gray-800">{exp.title}</h3>
                                <span className="text-xs text-gray-400">{exp.period}</span>
                              </div>
                              <p className="text-xs text-gray-500">{exp.company}</p>
                              {exp.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {profile.education && (
                      <div>
                        <h2 className="text-sm font-bold mb-2 pb-1 border-b-2" style={{ color: ts.accent, borderColor: ts.accent }}>التعليم</h2>
                        <p className="text-xs text-gray-700 whitespace-pre-line">{profile.education}</p>
                      </div>
                    )}

                    {/* Certifications */}
                    {profile.certifications && (
                      <div>
                        <h2 className="text-sm font-bold mb-2 pb-1 border-b-2" style={{ color: ts.accent, borderColor: ts.accent }}>الشهادات</h2>
                        <p className="text-xs text-gray-700 whitespace-pre-line">{profile.certifications}</p>
                      </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                      <div>
                        <h2 className="text-sm font-bold mb-2 pb-1 border-b-2" style={{ color: ts.accent, borderColor: ts.accent }}>المشاريع</h2>
                        <div className="space-y-2">
                          {projects.map((p: any, i: number) => (
                            <div key={i}>
                              <h3 className="text-xs font-bold text-gray-800">{p.title}</h3>
                              {p.description && <p className="text-xs text-gray-600">{p.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
