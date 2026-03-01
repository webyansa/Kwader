import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download, Printer, Share2, ArrowRight, Shield, FileText,
  MapPin, Briefcase, GraduationCap, Award, Heart, Linkedin, Globe,
  User, FolderOpen,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const PublicCV = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const cvRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/@${username}` : "";

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-cv", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_seeker_profiles")
        .select("*")
        .eq("username", username!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  const allowCvView = profile?.allow_cv_public_view !== false;
  const allowCvDownload = profile?.allow_cv_download === true;

  useEffect(() => {
    if (searchParams.get("download") === "1" && allowCvDownload && profile) {
      handleExportPDF();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, allowCvDownload]);

  const handleExportPDF = async () => {
    if (!cvRef.current || !allowCvDownload) return;
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
      pdf.save(`${profile?.full_name || "cv"}-kawader.pdf`);
      toast({ title: "تم تنزيل السيرة الذاتية ✅" });
    } catch (e: any) {
      toast({ title: "خطأ في التنزيل", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => window.print();
  const handleShare = () => {
    navigator.clipboard.writeText(`${profileUrl}/cv`);
    toast({ title: "تم نسخ رابط السيرة ✅" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile || profile.privacy === "hidden" || !allowCvView) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Shield className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h1 className="text-xl font-bold text-foreground">السيرة الذاتية غير متاحة للعرض</h1>
            <p className="text-muted-foreground">صاحب الملف لم يسمح بعرض السيرة الذاتية أو الملف مخفي.</p>
            <Button asChild variant="outline" className="rounded-xl gap-2">
              <Link to={`/@${username}`}><ArrowRight className="h-4 w-4" />العودة للملف المهني</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const experiences = (profile.experiences as any[]) || [];
  const projects = (profile.projects as any[]) || [];
  const volunteering = (profile.volunteering as any[]) || [];
  const skills = profile.skills || [];
  const initials = (profile.full_name || "؟").charAt(0);

  return (
    <div className="flex min-h-screen flex-col bg-muted/50" dir="rtl">
      <Helmet>
        <title>{profile.full_name} - السيرة الذاتية | كوادر</title>
        <meta name="description" content={`السيرة الذاتية لـ ${profile.full_name} على منصة كوادر`} />
        <link rel="canonical" href={`${profileUrl}/cv`} />
      </Helmet>
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
            <Button asChild variant="ghost" className="rounded-xl gap-2">
              <Link to={`/@${username}`}><ArrowRight className="h-4 w-4" />العودة للملف المهني</Link>
            </Button>
            <div className="flex items-center gap-2">
              {allowCvDownload && (
                <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90" onClick={handleExportPDF} disabled={exporting}>
                  <Download className="h-4 w-4" />{exporting ? "جارٍ..." : "تنزيل PDF"}
                </Button>
              )}
              <Button variant="outline" className="rounded-xl gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />طباعة
              </Button>
              <Button variant="outline" className="rounded-xl gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />مشاركة
              </Button>
            </div>
          </div>

          {/* CV Document */}
          <Card className="rounded-2xl overflow-hidden shadow-premium border-0">
            <div ref={cvRef} style={{ width: "100%", minHeight: 800, fontFamily: "'IBM Plex Sans Arabic', sans-serif", backgroundColor: '#fff' }}>
              {/* CV Header */}
              <div className="p-8 pb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(231 50% 30%) 0%, hsl(231 50% 40%) 100%)' }}>
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white" />

                <div className="relative flex items-center gap-6" dir="rtl">
                  <div className="shrink-0">
                    {profile.avatar_url ? (
                      <div className="rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, hsl(249 100% 69%), hsl(195 100% 50%))' }}>
                        <img src={profile.avatar_url} alt="" className="w-[100px] h-[100px] rounded-full object-cover border-4 border-white" />
                      </div>
                    ) : (
                      <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30" style={{ background: 'linear-gradient(135deg, hsl(249 100% 69%), hsl(195 100% 50%))' }}>
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-white leading-tight">{profile.full_name || "الاسم"}</h1>
                    {profile.headline && <p className="text-sm mt-1.5 text-white/80 font-medium">{profile.headline}</p>}
                    <div className="flex flex-wrap gap-4 mt-3">
                      {profile.city && <span className="flex items-center gap-1.5 text-xs text-white/70"><MapPin className="h-3.5 w-3.5" />{profile.city}</span>}
                      {profile.linkedin_url && <span className="flex items-center gap-1.5 text-xs text-white/70"><Linkedin className="h-3.5 w-3.5" />LinkedIn</span>}
                      {profile.portfolio_url && <span className="flex items-center gap-1.5 text-xs text-white/70"><Globe className="h-3.5 w-3.5" />Portfolio</span>}
                    </div>
                  </div>

                  <div className="shrink-0 bg-white rounded-xl p-2 shadow-sm print:hidden">
                    <QRCodeSVG value={profileUrl} size={60} level="M" fgColor="hsl(231, 50%, 30%)" />
                  </div>
                </div>
              </div>

              {/* CV Body - Two Column */}
              <div className="flex gap-0" dir="rtl" style={{ minHeight: 500 }}>
                {/* Right Column (main) */}
                <div className="flex-1 p-6 space-y-5">
                  {profile.summary && (
                    <div>
                      <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: 'hsl(231 50% 30%)', borderColor: 'hsl(231 50% 30%)' }}>
                        <User className="h-4 w-4" />النبذة المهنية
                      </h2>
                      <p className="text-xs text-gray-700 leading-[1.8] whitespace-pre-line">{profile.summary}</p>
                    </div>
                  )}

                  {experiences.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: 'hsl(231 50% 30%)', borderColor: 'hsl(231 50% 30%)' }}>
                        <Briefcase className="h-4 w-4" />الخبرات العملية
                      </h2>
                      <div className="space-y-3">
                        {experiences.map((exp: any, i: number) => (
                          <div key={i} className="pr-3 border-r-2 rounded-sm" style={{ borderColor: 'hsl(231 50% 30% / 0.2)' }}>
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-xs font-bold text-gray-800">{exp.title}</h3>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">{exp.period}</span>
                            </div>
                            {exp.company && <p className="text-[11px] font-medium" style={{ color: 'hsl(231 50% 30%)' }}>{exp.company}</p>}
                            {exp.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: 'hsl(231 50% 30%)', borderColor: 'hsl(231 50% 30%)' }}>
                        <FolderOpen className="h-4 w-4" />المشاريع والإنجازات
                      </h2>
                      <div className="space-y-2">
                        {projects.map((p: any, i: number) => (
                          <div key={i} className="pr-3 border-r-2 rounded-sm" style={{ borderColor: 'hsl(231 50% 30% / 0.2)' }}>
                            <h3 className="text-xs font-bold text-gray-800">{p.title}</h3>
                            {p.description && <p className="text-xs text-gray-600 mt-0.5">{p.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {volunteering.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: 'hsl(231 50% 30%)', borderColor: 'hsl(231 50% 30%)' }}>
                        <Heart className="h-4 w-4" />التطوع
                      </h2>
                      <div className="space-y-2">
                        {volunteering.map((v: any, i: number) => (
                          <div key={i} className="pr-3 border-r-2 rounded-sm" style={{ borderColor: 'hsl(231 50% 30% / 0.2)' }}>
                            <h3 className="text-xs font-bold text-gray-800">{v.role}</h3>
                            <p className="text-[11px] text-gray-500">{v.organization} {v.period && `· ${v.period}`}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Left Column (sidebar) */}
                <div className="w-[220px] shrink-0 p-5 space-y-5 bg-muted/50 border-r">
                  {skills.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: 'hsl(231 50% 30%)', borderColor: 'hsl(231 50% 30%)' }}>
                        <Award className="h-4 w-4" />المهارات
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((s: string, i: number) => (
                          <span key={i} className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-highlight/10 text-highlight">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.education && (
                    <div>
                      <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: 'hsl(231 50% 30%)', borderColor: 'hsl(231 50% 30%)' }}>
                        <GraduationCap className="h-4 w-4" />التعليم
                      </h2>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{profile.education}</p>
                    </div>
                  )}

                  {profile.certifications && (
                    <div>
                      <h2 className="text-sm font-bold mb-2 pb-1.5 border-b-2 flex items-center gap-2" style={{ color: 'hsl(231 50% 30%)', borderColor: 'hsl(231 50% 30%)' }}>
                        <Award className="h-4 w-4" />الشهادات
                      </h2>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{profile.certifications}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CV Footer */}
              <div className="px-6 py-3 text-center border-t bg-muted/30">
                <p className="text-[10px] text-muted-foreground font-medium">
                  أُصدرت هذه السيرة من منصة كوادر &nbsp;·&nbsp; www.kawader.sa
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicCV;
