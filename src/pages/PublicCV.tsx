import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download,
  Printer,
  Share2,
  ArrowRight,
  Shield,
  Briefcase,
  GraduationCap,
  Award,
  Heart,
  Linkedin,
  Globe,
  User,
  FolderOpen,
  MapPin,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isProfileHidden, isProfileUnlisted } from "@/lib/publicProfile";

const PublicCV = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();

  const normalizedUsername = (username || "").toLowerCase();
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/talent/${normalizedUsername}` : `https://www.kawader.sa/talent/${normalizedUsername}`;

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

  const handlePrint = () => window.print();

  const handleShare = () => {
    navigator.clipboard.writeText(`${profileUrl}/cv`);
    toast({ title: "تم نسخ رابط السيرة ✅" });
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-muted/40" dir="rtl">
      <Helmet>
        <title>{profile.full_name || normalizedUsername} - السيرة الذاتية | كوادر</title>
        <meta name="description" content={`السيرة الذاتية الاحترافية لـ ${profile.full_name || normalizedUsername} على منصة كوادر`} />
        <link rel="canonical" href={`${profileUrl}/cv`} />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-8">
        <div className="container max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Button asChild variant="ghost" className="rounded-xl gap-2">
              <Link to={`/talent/${normalizedUsername}`}>
                <ArrowRight className="h-4 w-4" />رجوع للملف
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              {allowCvDownload && (
                <Button asChild className="rounded-xl gap-2">
                  <Link to={`/api/cv/download/${normalizedUsername}`}>
                    <Download className="h-4 w-4" />تحميل PDF
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="rounded-xl gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />مشاركة
              </Button>
              <Button variant="outline" className="rounded-xl gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />طباعة
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border shadow-premium">
            <div className="mx-auto w-full max-w-[900px] bg-card" style={{ minHeight: "1120px" }}>
              <header className="border-b bg-gradient-to-bl from-primary/10 via-background to-highlight/10 p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name || "صورة الكادر"} className="h-20 w-20 rounded-full border object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary text-3xl font-bold text-primary-foreground">{initials}</div>
                    )}
                    <div className="space-y-1">
                      <h1 className="text-2xl font-black text-foreground">{profile.full_name || "الاسم"}</h1>
                      {profile.headline && <p className="font-medium text-muted-foreground">{profile.headline}</p>}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {profile.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.city}</span>}
                        {profile.linkedin_url && <span className="inline-flex items-center gap-1"><Linkedin className="h-3.5 w-3.5" />LinkedIn</span>}
                        {profile.portfolio_url && <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" />Portfolio</span>}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-card p-2">
                    <QRCodeCanvas value={profileUrl} size={72} level="M" />
                  </div>
                </div>
              </header>

              <div className="grid gap-0 md:grid-cols-[270px_1fr]">
                <aside className="space-y-6 border-l bg-secondary/30 p-5">
                  {skills.length > 0 && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                        <Award className="h-4 w-4 text-primary" />المهارات
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill: string, i: number) => (
                          <span key={`${skill}-cv-${i}`} className="rounded-full bg-highlight/10 px-2.5 py-1 text-[11px] font-medium text-foreground">{skill}</span>
                        ))}
                      </div>
                    </section>
                  )}

                  {profile.education && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                        <GraduationCap className="h-4 w-4 text-primary" />التعليم
                      </h2>
                      <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{profile.education}</p>
                    </section>
                  )}

                  {profile.certifications && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                        <Award className="h-4 w-4 text-primary" />الشهادات
                      </h2>
                      <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{profile.certifications}</p>
                    </section>
                  )}
                </aside>

                <div className="space-y-6 p-6">
                  {profile.summary && (
                    <section>
                      <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-foreground">
                        <User className="h-4 w-4 text-primary" />النبذة المهنية
                      </h2>
                      <p className="whitespace-pre-line text-sm leading-[1.9] text-muted-foreground">{profile.summary}</p>
                    </section>
                  )}

                  {experiences.length > 0 && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
                        <Briefcase className="h-4 w-4 text-primary" />الخبرات
                      </h2>
                      <div className="space-y-3">
                        {experiences.map((exp: any, i: number) => (
                          <div key={i} className="space-y-1 border-r-2 border-primary/20 pr-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-sm font-bold text-foreground">{exp.title || "خبرة"}</h3>
                              {exp.period && <span className="text-[11px] text-muted-foreground">{exp.period}</span>}
                            </div>
                            {exp.company && <p className="text-xs font-medium text-primary">{exp.company}</p>}
                            {exp.description && <p className="text-xs leading-relaxed text-muted-foreground">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {projects.length > 0 && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
                        <FolderOpen className="h-4 w-4 text-primary" />المشاريع والإنجازات
                      </h2>
                      <div className="space-y-2">
                        {projects.map((project: any, i: number) => (
                          <div key={i} className="space-y-1 border-r-2 border-primary/20 pr-4">
                            <h3 className="text-sm font-bold text-foreground">{project.title || "مشروع"}</h3>
                            {project.description && <p className="text-xs leading-relaxed text-muted-foreground">{project.description}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {volunteering.length > 0 && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
                        <Heart className="h-4 w-4 text-primary" />التطوع
                      </h2>
                      <div className="space-y-2">
                        {volunteering.map((item: any, i: number) => (
                          <div key={i} className="space-y-1 border-r-2 border-accent/30 pr-4">
                            <h3 className="text-sm font-bold text-foreground">{item.role || "مشاركة تطوعية"}</h3>
                            <p className="text-xs text-muted-foreground">{item.organization || ""} {item.period ? `· ${item.period}` : ""}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <footer className="border-t bg-secondary/30 px-6 py-3 text-center">
                <p className="text-[11px] text-muted-foreground">أُصدرت هذه السيرة من منصة كوادر · www.kawader.sa</p>
              </footer>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicCV;
