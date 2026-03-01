import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin, Briefcase, GraduationCap, Award, Download, Globe, Linkedin,
  Heart, FolderOpen, QrCode, ExternalLink, Shield, FileText,
  Copy, CheckCircle2, X, Clock, Sparkles, User, Mail,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const expLevelLabel: Record<string, string> = {
  junior: "مبتدئ", mid: "متوسط", senior: "خبير", leadership: "قيادي",
};

const SectionIcon = ({ children, gradient = false }: { children: React.ReactNode; gradient?: boolean }) => (
  <div
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!gradient ? "bg-primary" : ""}`}
    style={gradient ? { background: 'linear-gradient(135deg, hsl(var(--highlight)), hsl(195 100% 50%))' } : {}}
  >
    {children}
  </div>
);

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
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

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/@${username}` : "";
  const recentlyUpdated = profile?.updated_at ? differenceInDays(new Date(), new Date(profile.updated_at)) <= 30 : false;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "تم نسخ الرابط ✅" });
    setTimeout(() => setCopied(false), 2000);
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

  if (!profile || profile.privacy === "hidden") {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Shield className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h1 className="text-xl font-bold text-foreground">الصفحة غير متاحة</h1>
            <p className="text-muted-foreground">هذا الملف غير موجود أو مخفي.</p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/talents-public">تصفح الكوادر</Link>
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
  const topSkills = skills.slice(0, 5);
  const allowCvView = profile.allow_cv_public_view !== false;
  const allowCvDownload = profile.allow_cv_download === true;
  const allowContact = profile.allow_contact_requests !== false;
  const availableForWork = profile.available_for_work === true;
  const initials = (profile.full_name || "؟").charAt(0);

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      <Helmet>
        <title>{profile.full_name || username} | كوادر</title>
        <meta name="description" content={profile.summary || `الملف المهني لـ ${profile.full_name} على منصة كوادر`} />
        <link rel="canonical" href={profileUrl} />
      </Helmet>
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Cover background */}
          <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary/90 to-highlight/80" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative container max-w-4xl py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-5"
            >
              {/* Avatar */}
              <div className="relative">
                {profile.avatar_url ? (
                  <div className="rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, hsl(var(--highlight)), hsl(195 100% 50%))' }}>
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || ""}
                      className="h-[120px] w-[120px] rounded-full object-cover border-4 border-card"
                    />
                  </div>
                ) : (
                  <div
                    className="h-[120px] w-[120px] rounded-full flex items-center justify-center text-5xl font-bold text-highlight-foreground border-4 border-primary-foreground/20"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--highlight)), hsl(195 100% 50%))' }}
                  >
                    {initials}
                  </div>
                )}
                {availableForWork && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success px-3 py-0.5 text-[11px] font-bold text-success-foreground shadow-lg">
                    ✅ متاح للعمل
                  </span>
                )}
              </div>

              {/* Name & Info */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground">{profile.full_name}</h1>
                {profile.headline && (
                  <p className="text-base text-primary-foreground/80 font-medium">{profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {profile.city && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70">
                      <MapPin className="h-4 w-4" />{profile.city}
                    </span>
                  )}
                  {profile.experience_level && (
                    <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 hover:bg-primary-foreground/30">
                      {expLevelLabel[profile.experience_level] || profile.experience_level}
                    </Badge>
                  )}
                  {recentlyUpdated && (
                    <Badge className="bg-success/20 text-success-foreground border-0 gap-1">
                      <Clock className="h-3 w-3" />مُحدّث مؤخراً
                    </Badge>
                  )}
                </div>
              </div>

              {/* Top Skills */}
              {topSkills.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {topSkills.map((s: string, i: number) => (
                    <Badge key={i} className="rounded-full bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 backdrop-blur-sm px-3 py-1 text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {allowCvView && (
                  <Button asChild className="rounded-xl gap-2 bg-card text-primary hover:bg-card/90 shadow-lg font-bold">
                    <Link to={`/@${username}/cv`}>
                      <FileText className="h-4 w-4" />عرض السيرة الذاتية
                    </Link>
                  </Button>
                )}
                {allowCvDownload && (
                  <Button asChild variant="outline" className="rounded-xl gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <Link to={`/@${username}/cv?download=1`}>
                      <Download className="h-4 w-4" />تنزيل PDF
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="rounded-xl gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "تم النسخ" : "نسخ الرابط"}
                </Button>
                <Button variant="outline" className="rounded-xl gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setShowQR(true)}>
                  <QrCode className="h-4 w-4" />QR
                </Button>
              </div>

              {/* Social */}
              <div className="flex items-center gap-2">
                {profile.linkedin_url && (
                  <Button size="icon" variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full" asChild>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener"><Linkedin className="h-5 w-5" /></a>
                  </Button>
                )}
                {profile.portfolio_url && (
                  <Button size="icon" variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full" asChild>
                    <a href={profile.portfolio_url} target="_blank" rel="noopener"><Globe className="h-5 w-5" /></a>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="container max-w-4xl py-10 space-y-5">
          {/* Summary */}
          {profile.summary && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                    <SectionIcon gradient><User className="h-4 w-4 text-highlight-foreground" /></SectionIcon>
                    نبذة احترافية
                  </h2>
                  <p className="text-muted-foreground leading-[1.9] whitespace-pre-line">{profile.summary}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2.5">
                    <SectionIcon gradient><Sparkles className="h-4 w-4 text-highlight-foreground" /></SectionIcon>
                    المهارات
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s: string, i: number) => (
                      <Badge key={i} variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium bg-highlight/10 text-highlight border-highlight/20">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2.5">
                    <SectionIcon><Briefcase className="h-4 w-4 text-primary-foreground" /></SectionIcon>
                    الخبرات العملية
                  </h2>
                  <div className="space-y-4">
                    {experiences.map((exp: any, i: number) => (
                      <div key={i} className="relative pr-6 border-r-2 border-primary/20 space-y-1 transition-all duration-200 hover:border-primary/50">
                        <div className="absolute right-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <div className="flex justify-between items-baseline gap-3">
                          <h3 className="font-bold text-foreground">{exp.title}</h3>
                          {exp.period && <span className="text-xs text-muted-foreground whitespace-nowrap">{exp.period}</span>}
                        </div>
                        {exp.company && <p className="text-sm font-medium text-primary">{exp.company}</p>}
                        {exp.description && <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Education */}
          {profile.education && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                    <SectionIcon><GraduationCap className="h-4 w-4 text-primary-foreground" /></SectionIcon>
                    التعليم
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{profile.education}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Certifications */}
          {profile.certifications && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                    <SectionIcon gradient><Award className="h-4 w-4 text-highlight-foreground" /></SectionIcon>
                    الشهادات
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{profile.certifications}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2.5">
                    <SectionIcon gradient><FolderOpen className="h-4 w-4 text-highlight-foreground" /></SectionIcon>
                    المشاريع والإنجازات
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.map((p: any, i: number) => (
                      <div key={i} className="rounded-xl border p-4 space-y-1.5 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-foreground text-sm">{p.title}</h3>
                          {p.url && (
                            <a href={p.url} target="_blank" rel="noopener" className="text-primary hover:text-primary/80">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {p.description && <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Volunteering */}
          {volunteering.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2.5">
                    <SectionIcon><Heart className="h-4 w-4 text-primary-foreground" /></SectionIcon>
                    التطوع
                  </h2>
                  <div className="space-y-3">
                    {volunteering.map((v: any, i: number) => (
                      <div key={i} className="border-r-2 border-accent/30 pr-4 space-y-1">
                        <h3 className="font-bold text-foreground">{v.role}</h3>
                        <p className="text-sm text-muted-foreground">{v.organization} {v.period && `· ${v.period}`}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Contact CTA */}
          {allowContact && (
            <Card className="rounded-2xl border shadow-card overflow-hidden">
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--highlight)), hsl(195 100% 50%))' }} />
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SectionIcon gradient><Mail className="h-5 w-5 text-highlight-foreground" /></SectionIcon>
                  <div>
                    <h3 className="font-bold text-foreground">تريد التواصل مع {profile.full_name}؟</h3>
                    <p className="text-sm text-muted-foreground">راسله عبر منصة كوادر بدون الكشف عن بياناتك</p>
                  </div>
                </div>
                <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90">
                  <Mail className="h-4 w-4" />راسلني عبر كوادر
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Platform Footer */}
        <div className="border-t py-4 text-center">
          <p className="text-xs text-muted-foreground">
            هذا الملف منشور عبر <a href="https://www.kawader.sa" className="font-medium text-primary hover:underline">منصة كوادر</a> &nbsp;·&nbsp; www.kawader.sa
          </p>
        </div>
      </main>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl bg-card p-6 shadow-premium text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-3 start-3 rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-bold text-foreground">رمز QR</h3>
              <div className="rounded-xl bg-card p-4 border inline-block">
                <QRCodeSVG value={profileUrl} size={200} level="H" fgColor="hsl(231, 50%, 40%)" />
              </div>
              <p className="text-xs text-muted-foreground">امسح الكود للوصول للملف المهني</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default PublicProfile;
