import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Download,
  Printer,
  Share2,
  ArrowRight,
  Shield,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  Sparkles,
  HeartHandshake,
  Globe,
  User,
  FolderGit2,
  MapPin,
  Linkedin,
  Link as LinkIcon,
  Copy,
  ExternalLink,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isProfileHidden, isProfileUnlisted } from "@/lib/publicProfile";

/* ─── Section Block ─── */
const SectionBlock = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="cv-section">
    <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-foreground">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-[18px] w-[18px] text-primary" />
      </span>
      {title}
    </h2>
    {children}
  </section>
);

const PublicCV = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  const cvRef = useRef<HTMLDivElement>(null);

  const normalizedUsername = (username || "").toLowerCase();
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/talent/${normalizedUsername}`
      : `https://www.kawader.sa/talent/${normalizedUsername}`;
  const cvUrl = `${profileUrl}/cv`;

  /* ─── Data ─── */
  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-cv", normalizedUsername],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_seeker_profiles")
        .select("*")
        .eq("username", normalizedUsername)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(normalizedUsername),
  });

  const allowCvView = profile?.allow_cv_public_view !== false;
  const allowCvDownload = profile?.allow_cv_download === true;
  const hiddenProfile = !profile || isProfileHidden(profile.privacy);
  const noIndex = isProfileUnlisted(profile?.privacy);

  const experiences = Array.isArray(profile?.experiences) ? (profile.experiences as any[]) : [];
  const projects = Array.isArray(profile?.projects) ? (profile.projects as any[]) : [];
  const volunteering = Array.isArray(profile?.volunteering) ? (profile.volunteering as any[]) : [];
  const skills = Array.isArray(profile?.skills) ? (profile.skills as string[]) : [];
  const initials = (profile?.full_name || "؟").charAt(0);

  /* ─── Actions ─── */
  const handlePrint = () => window.print();

  const handleShare = () => {
    navigator.clipboard.writeText(cvUrl);
    toast({ title: "تم نسخ رابط السيرة ✅" });
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "تم نسخ الرابط ✅" });
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return;
    toast({ title: "جارٍ إعداد الملف..." });
    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(`kwader-${normalizedUsername}-cv.pdf`);
      toast({ title: "تم تحميل السيرة بنجاح ✅" });
    } catch {
      toast({ title: "حدث خطأ أثناء التحميل", variant: "destructive" });
    }
  };

  /* ─── States ─── */
  const unavailable = hiddenProfile || !allowCvView;
  const unavailableTitle = hiddenProfile ? "الملف غير متاح" : "السيرة غير متاحة للعرض";
  const unavailableDescription = hiddenProfile
    ? "قد يكون الرابط غير صحيح أو تم إخفاء الملف."
    : "صاحب الملف عطّل عرض السيرة الذاتية للعامة.";

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

  if (unavailable) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Helmet>
          <title>{unavailableTitle} | كوادر</title>
          <meta name="description" content={unavailableDescription} />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Shield className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{unavailableTitle}</h1>
            <p className="text-muted-foreground">{unavailableDescription}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild className="rounded-xl">
                <Link to={`/talent/${normalizedUsername}`}>العودة للملف المهني</Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link to="/talents">تصفح كوادر القطاع</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ─── Main CV ─── */
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-secondary/60 via-background to-secondary/40" dir="rtl">
      <Helmet>
        <title>{profile.full_name || normalizedUsername} - السيرة الذاتية | كوادر</title>
        <meta
          name="description"
          content={`السيرة الذاتية الاحترافية لـ ${profile.full_name || normalizedUsername} على منصة كوادر`}
        />
        <link rel="canonical" href={cvUrl} />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      </Helmet>

      <Navbar />

      {/* ── Sticky Toolbar ── */}
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md print:hidden">
        <div className="container flex max-w-[960px] items-center justify-between gap-3 py-2.5">
          <Button asChild variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground">
            <Link to={`/talent/${normalizedUsername}`}>
              <ArrowRight className="h-4 w-4" />
              رجوع للملف
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {allowCvDownload && (
              <Button size="sm" className="gap-2 rounded-xl" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">تحميل PDF</span>
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">طباعة</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── CV Canvas ── */}
      <main className="flex-1 py-8 print:py-0">
        <div className="container max-w-[960px]">
          <div
            ref={cvRef}
            className="cv-canvas mx-auto overflow-hidden rounded-2xl border bg-card shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.10)] print:rounded-none print:border-none print:shadow-none"
          >
            {/* ── Header ── */}
            <header className="relative overflow-hidden border-b px-6 py-8 sm:px-10 sm:py-10">
              {/* Decorative gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-primary/8 via-transparent to-accent/6" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Avatar */}
                {profile.avatar_url ? (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-primary/20 ring-offset-2 ring-offset-card">
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "صورة الكادر"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-4xl font-black text-primary-foreground ring-4 ring-primary/20 ring-offset-2 ring-offset-card">
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
                    {profile.full_name || "الاسم"}
                  </h1>
                  {profile.headline && (
                    <p className="text-lg font-medium text-muted-foreground">{profile.headline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-sm text-muted-foreground">
                    {profile.city && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-[18px] w-[18px]" />
                        {profile.city}
                      </span>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                      >
                        <Linkedin className="h-[18px] w-[18px]" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                      >
                        <Globe className="h-[18px] w-[18px]" />
                        Portfolio
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* ── Two-Column Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
              {/* ── Main Column ── */}
              <div className="space-y-7 p-6 sm:p-8">
                {/* About */}
                {profile.summary && (
                  <SectionBlock icon={User} title="النبذة المهنية">
                    <p className="whitespace-pre-line text-sm leading-[1.95] text-muted-foreground">
                      {profile.summary}
                    </p>
                  </SectionBlock>
                )}

                {/* Experience Timeline */}
                {experiences.length > 0 && (
                  <SectionBlock icon={Briefcase} title="الخبرات">
                    <div className="relative space-y-5 pr-5">
                      {/* Timeline line */}
                      <div className="absolute right-[7px] top-1 bottom-1 w-[2px] bg-border" />
                      {experiences.map((exp: any, i: number) => (
                        <div key={i} className="relative">
                          {/* Dot */}
                          <div className="absolute -right-5 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-card" />
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-sm font-bold text-foreground">{exp.title || "خبرة"}</h3>
                            {exp.period && (
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {exp.period}
                              </span>
                            )}
                          </div>
                          {exp.company && (
                            <p className="text-xs font-semibold text-primary">{exp.company}</p>
                          )}
                          {exp.description && (
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <SectionBlock icon={FolderGit2} title="المشاريع والإنجازات">
                    <div className="space-y-3">
                      {projects.map((project: any, i: number) => (
                        <div key={i} className="rounded-xl border border-border/60 p-3">
                          <h3 className="text-sm font-bold text-foreground">
                            {project.title || "مشروع"}
                          </h3>
                          {project.description && (
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {project.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* Volunteering */}
                {volunteering.length > 0 && (
                  <SectionBlock icon={HeartHandshake} title="الأعمال التطوعية">
                    <div className="space-y-3">
                      {volunteering.map((item: any, i: number) => (
                        <div key={i} className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                          <h3 className="text-sm font-bold text-foreground">
                            {item.role || "مشاركة تطوعية"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {item.organization || ""}{" "}
                            {item.period ? `· ${item.period}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}
              </div>

              {/* ── Sidebar Column ── */}
              <aside className="space-y-6 border-r border-border/60 bg-secondary/20 p-6 sm:p-7">
                {/* Skills */}
                {skills.length > 0 && (
                  <SectionBlock icon={Sparkles} title="المهارات">
                    <div className="flex flex-wrap gap-1.5">
                      <TooltipProvider delayDuration={300}>
                        {skills.map((skill: string, i: number) => (
                          <Tooltip key={`${skill}-${i}`}>
                            <TooltipTrigger asChild>
                              <span className="cursor-default rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-primary/10">
                                {skill}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {skill}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>
                  </SectionBlock>
                )}

                {/* Education */}
                {profile.education && (
                  <SectionBlock icon={GraduationCap} title="التعليم">
                    <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                      {profile.education}
                    </p>
                  </SectionBlock>
                )}

                {/* Certifications */}
                {profile.certifications && (
                  <SectionBlock icon={BadgeCheck} title="الشهادات">
                    <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                      {profile.certifications}
                    </p>
                  </SectionBlock>
                )}

                {/* Links */}
                {(profile.linkedin_url || profile.portfolio_url) && (
                  <SectionBlock icon={LinkIcon} title="الروابط">
                    <div className="space-y-2">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {profile.portfolio_url && (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          Portfolio
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </SectionBlock>
                )}

                {/* QR Card */}
                <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
                  <p className="mb-3 text-xs font-bold text-foreground">ملفي على كوادر</p>
                  <div className="mx-auto mb-3 inline-flex rounded-xl border border-border/40 bg-white p-2.5">
                    <QRCodeCanvas value={profileUrl} size={100} level="M" />
                  </div>
                  <p className="mb-2 truncate text-[10px] text-muted-foreground" dir="ltr">
                    {profileUrl.replace(/^https?:\/\//, "")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 rounded-lg text-[11px]"
                    onClick={handleCopyProfileLink}
                  >
                    <Copy className="h-3 w-3" />
                    نسخ الرابط
                  </Button>
                </div>
              </aside>
            </div>

            {/* ── Footer Branding ── */}
            <footer className="border-t bg-secondary/20 px-6 py-3 text-center">
              <p className="text-[10px] text-muted-foreground/70">
                تم إنشاء هذه السيرة عبر منصة كوادر · www.kawader.sa
              </p>
            </footer>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicCV;
