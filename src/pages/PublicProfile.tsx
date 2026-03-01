import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import ContactFormModal from "@/components/talents/ContactFormModal";
import LoginPromptModal from "@/components/talents/LoginPromptModal";
import { QRCodeCanvas } from "qrcode.react";
import { differenceInDays } from "date-fns";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Download,
  Globe,
  Linkedin,
  Heart,
  FolderOpen,
  QrCode,
  ExternalLink,
  Shield, MessageSquare,
  FileText,
  Copy,
  CheckCircle2,
  X,
  Clock,
  User,
  Mail,
  CalendarDays,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGetOrCreateThread } from "@/hooks/useMessages";
import { isProfileHidden, isProfileUnlisted, normalizeProfileVisibility } from "@/lib/publicProfile";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const expLevelLabel: Record<string, string> = {
  junior: "مبتدئ",
  mid: "متوسط",
  senior: "خبير",
  leadership: "قيادي",
};

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const getOrCreateThread = useGetOrCreateThread();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const normalizedUsername = (username || "").toLowerCase();
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/talent/${normalizedUsername}` : `https://www.kawader.sa/talent/${normalizedUsername}`;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", normalizedUsername],
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

  const visibility = normalizeProfileVisibility(profile?.privacy);
  const noIndex = isProfileUnlisted(profile?.privacy);
  const unavailable = !profile || isProfileHidden(profile.privacy);

  const experiences = Array.isArray(profile?.experiences) ? (profile.experiences as any[]) : [];
  const projects = Array.isArray(profile?.projects) ? (profile.projects as any[]) : [];
  const volunteering = Array.isArray(profile?.volunteering) ? (profile.volunteering as any[]) : [];
  const skills = Array.isArray(profile?.skills) ? (profile.skills as string[]) : [];
  const topSkills = skills.slice(0, 5);

  const allowCvView = profile?.allow_cv_public_view !== false;
  const allowCvDownload = profile?.allow_cv_download === true;
  const allowContact = profile?.allow_contact_requests !== false;
  const availableForWork = profile?.available_for_work === true;
  const initials = (profile?.full_name || "؟").charAt(0);

  const recentlyUpdated = useMemo(() => {
    if (!profile?.updated_at) return false;
    return differenceInDays(new Date(), new Date(profile.updated_at)) <= 30;
  }, [profile?.updated_at]);

  const yearsExperience = useMemo(() => {
    if (!experiences.length) return null;
    const firstPeriod = experiences.find((exp: any) => typeof exp?.period === "string" && exp.period.trim());
    if (!firstPeriod) return null;

    const startYear = Number((firstPeriod.period as string).match(/\d{4}/)?.[0]);
    if (!startYear || Number.isNaN(startYear)) return null;

    return Math.max(new Date().getFullYear() - startYear, 1);
  }, [experiences]);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "تم نسخ الرابط ✅" });
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadQr = () => {
    const canvas = document.getElementById("public-profile-qr") as HTMLCanvasElement | null;
    if (!canvas || !normalizedUsername) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `kawader-${normalizedUsername}-qr.png`;
    link.click();
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

  if (unavailable) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Helmet>
          <title>الملف غير متاح | كوادر</title>
          <meta name="description" content="الملف المطلوب غير متاح حالياً أو الرابط غير صحيح." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Shield className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h1 className="text-xl font-bold text-foreground">الملف غير متاح</h1>
            <p className="text-muted-foreground">قد يكون الرابط غير صحيح أو تم إخفاء الملف من قبل صاحبه.</p>
            <Button asChild className="rounded-xl">
              <Link to="/talents">تصفح كوادر القطاع</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      <Helmet>
        <title>{profile.full_name || normalizedUsername} | كوادر</title>
        <meta name="description" content={`${profile.headline || "كادر مهني"}${profile.city ? ` - ${profile.city}` : ""}`} />
        <link rel="canonical" href={profileUrl} />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        <header className="relative overflow-hidden border-b bg-gradient-to-bl from-primary/15 via-background to-highlight/15">
          <div className="container max-w-6xl py-12 sm:py-14">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || "صورة الكادر"} className="h-28 w-28 rounded-full border object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-primary text-4xl font-bold text-primary-foreground">
                      {initials}
                    </div>
                  )}

                  <div className="space-y-2 text-right">
                    <h1 className="text-2xl font-black text-foreground sm:text-3xl">{profile.full_name || "كادر"}</h1>
                    {profile.headline && <p className="text-base font-medium text-muted-foreground">{profile.headline}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      {profile.city && (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />{profile.city}
                        </span>
                      )}
                      {profile.experience_level && (
                        <Badge variant="secondary">{expLevelLabel[profile.experience_level] || profile.experience_level}</Badge>
                      )}
                      {availableForWork && <Badge className="bg-success/10 text-success hover:bg-success/10">متاح للعمل</Badge>}
                      {recentlyUpdated && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />تم تحديث الملف مؤخراً
                        </Badge>
                      )}
                      {visibility === "link_only" && <Badge variant="outline">برابط فقط</Badge>}
                    </div>
                  </div>
                </div>

                {topSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {topSkills.map((skill: string, i: number) => (
                      <Badge key={`${skill}-${i}`} className="rounded-full bg-highlight/10 text-foreground hover:bg-highlight/10">{skill}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {allowCvView && (
                    <Button asChild className="rounded-xl gap-2">
                      <Link to={`/talent/${normalizedUsername}/cv`}>
                        <FileText className="h-4 w-4" />عرض السيرة الذاتية
                      </Link>
                    </Button>
                  )}

                  {allowCvDownload && (
                    <Button asChild variant="outline" className="rounded-xl gap-2">
                      <Link to={`/api/cv/download/${normalizedUsername}`}>
                        <Download className="h-4 w-4" />تنزيل PDF
                      </Link>
                    </Button>
                  )}

                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowQR(true)}>
                    <QrCode className="h-4 w-4" />QR
                  </Button>

                  <Button variant="outline" className="rounded-xl gap-2" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "تم النسخ" : "نسخ الرابط"}
                  </Button>
                </div>
              </div>

              <Card className="h-fit rounded-2xl border shadow-card lg:sticky lg:top-24">
                <CardContent className="space-y-4 p-5">
                  <h2 className="text-lg font-bold text-foreground">معلومات سريعة</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {yearsExperience && (
                      <p className="inline-flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />خبرة تقريبية: {yearsExperience} سنوات
                      </p>
                    )}
                    <p className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />آخر تحديث: {new Date(profile.updated_at).toLocaleDateString("ar-SA")}
                    </p>
                    {profile.city && (
                      <p className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />{profile.city}
                      </p>
                    )}
                  </div>

                  {topSkills.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">مهارات بارزة</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topSkills.map((skill: string, i: number) => (
                          <span key={`${skill}-quick-${i}`} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat button - only for logged in users */}
                  {user && allowContact && (
                    <Button
                      className="w-full rounded-xl gap-2"
                      disabled={getOrCreateThread.isPending}
                      onClick={() => {
                        if (!profile?.user_id) return;
                        getOrCreateThread.mutate(profile.user_id, {
                          onSuccess: (threadId) => {
                            navigate(`/talents/messages?tab=chats`);
                          },
                          onError: () => {
                            toast({ title: "حدث خطأ", description: "لم نتمكن من بدء المحادثة", variant: "destructive" });
                          },
                        });
                      }}
                    >
                      <Mail className="h-4 w-4" />مراسلة عبر كوادر
                    </Button>
                  )}

                  {/* Chat button for non-logged in - shows login prompt */}
                  {!user && allowContact && (
                    <Button
                      className="w-full rounded-xl gap-2"
                      variant="outline"
                      onClick={() => setShowLoginPrompt(true)}
                    >
                      <Mail className="h-4 w-4" />مراسلة عبر كوادر
                    </Button>
                  )}

                  {/* Contact form button - available for everyone */}
                  {allowContact && (
                    <Button
                      className="w-full rounded-xl gap-2"
                      variant="secondary"
                      onClick={() => setShowContactForm(true)}
                    >
                      <MessageSquare className="h-4 w-4" />تواصل معي
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </header>

        <section className="container max-w-6xl py-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              {profile.summary && (
                <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                      <User className="h-4 w-4 text-primary" />نبذة عني
                    </h2>
                    <p className="whitespace-pre-line leading-[1.9] text-muted-foreground">{profile.summary}</p>
                  </CardContent>
                </Card>
              )}

              {experiences.length > 0 && (
                <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                      <Briefcase className="h-4 w-4 text-primary" />الخبرات
                    </h2>
                    <div className="space-y-4">
                      {experiences.map((exp: any, i: number) => (
                        <div key={i} className="space-y-1 border-r-2 border-primary/20 pr-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="font-bold text-foreground">{exp.title || "خبرة عملية"}</h3>
                            {exp.period && <span className="text-xs text-muted-foreground">{exp.period}</span>}
                          </div>
                          {exp.company && <p className="text-sm font-medium text-primary">{exp.company}</p>}
                          {exp.description && <p className="text-sm leading-relaxed text-muted-foreground">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile.education && (
                <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                      <GraduationCap className="h-4 w-4 text-primary" />التعليم
                    </h2>
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{profile.education}</p>
                  </CardContent>
                </Card>
              )}

              {profile.certifications && (
                <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                      <Award className="h-4 w-4 text-primary" />الشهادات
                    </h2>
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{profile.certifications}</p>
                  </CardContent>
                </Card>
              )}

              {skills.length > 0 && (
                <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                      <Award className="h-4 w-4 text-primary" />المهارات
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, i: number) => (
                        <Badge key={`${skill}-all-${i}`} className="rounded-full bg-highlight/10 text-foreground hover:bg-highlight/10">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {projects.length > 0 && (
                <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                      <FolderOpen className="h-4 w-4 text-primary" />المشاريع والإنجازات
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {projects.map((project: any, i: number) => (
                        <div key={i} className="space-y-1 rounded-xl border bg-secondary/20 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-foreground">{project.title || "مشروع"}</h3>
                            {project.url && (
                              <a href={project.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          {project.description && <p className="text-xs leading-relaxed text-muted-foreground">{project.description}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {volunteering.length > 0 && (
                <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                      <Heart className="h-4 w-4 text-primary" />التطوع
                    </h2>
                    <div className="space-y-3">
                      {volunteering.map((item: any, i: number) => (
                        <div key={i} className="space-y-1 border-r-2 border-accent/30 pr-4">
                          <h3 className="font-bold text-foreground">{item.role || "مشاركة تطوعية"}</h3>
                          <p className="text-sm text-muted-foreground">{item.organization || ""} {item.period ? `· ${item.period}` : ""}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <aside className="hidden lg:block" />
          </div>
        </section>

        <div className="border-t py-4 text-center">
          <p className="text-xs text-muted-foreground">
            هذا الملف منشور عبر منصة كوادر · www.kawader.sa
          </p>
        </div>
      </main>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 text-center shadow-premium"
              onClick={(event) => event.stopPropagation()}
            >
              <button onClick={() => setShowQR(false)} className="absolute start-3 top-3 rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-bold text-foreground">QR الملف المهني</h3>
              <div className="inline-block rounded-xl border bg-card p-3">
                <QRCodeCanvas id="public-profile-qr" value={profileUrl} size={200} level="H" />
              </div>
              <p className="text-xs text-muted-foreground">يفتح هذا الرمز صفحة /talent/{normalizedUsername}</p>

              <Button className="w-full rounded-xl gap-2" onClick={downloadQr}>
                <Download className="h-4 w-4" />تحميل QR كصورة
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      {profile && (
        <ContactFormModal
          open={showContactForm}
          onOpenChange={setShowContactForm}
          talentUserId={profile.user_id}
          talentName={profile.full_name || "الكادر"}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />

      <Footer />
    </div>
  );
};

export default PublicProfile;
