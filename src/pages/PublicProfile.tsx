import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase, GraduationCap, Award, Download, Mail, Globe, Linkedin, Star, Heart, FolderOpen, QrCode, ExternalLink, Shield } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

const expLevelLabel: Record<string, string> = {
  junior: "مبتدئ", mid: "متوسط", senior: "خبير", leadership: "قيادي",
};

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [showQR, setShowQR] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
          <div className="text-center space-y-3">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground/40" />
            <h1 className="text-xl font-bold text-foreground">الصفحة غير متاحة</h1>
            <p className="text-muted-foreground">هذا الملف غير موجود أو مخفي.</p>
            <Button asChild variant="outline"><Link to="/sector-jobs">تصفح الوظائف</Link></Button>
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

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      <Helmet>
        <title>{profile.full_name || username} | كوادر</title>
        <meta name="description" content={profile.summary || `الملف المهني لـ ${profile.full_name} على منصة كوادر`} />
        <link rel="canonical" href={profileUrl} />
      </Helmet>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-bl from-primary/10 via-background to-accent/5 py-12 sm:py-16">
          <div className="container max-w-3xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || ""} className="h-28 w-28 rounded-2xl border-4 border-card object-cover shadow-lg" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 shadow-lg">
                  <span className="text-4xl font-bold text-primary">{(profile.full_name || "K")[0]}</span>
                </div>
              )}
              <div className="flex-1 text-center sm:text-right space-y-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{profile.full_name}</h1>
                {profile.headline && <p className="text-lg text-muted-foreground">{profile.headline}</p>}
                <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                  {profile.city && (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{profile.city}</span>
                  )}
                  {profile.experience_level && (
                    <Badge variant="secondary">{expLevelLabel[profile.experience_level] || profile.experience_level}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                  {profile.cv_file_url && (
                    <Button size="sm" className="rounded-xl gap-1.5">
                      <Download className="h-4 w-4" />السيرة الذاتية
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => setShowQR(!showQR)}>
                    <QrCode className="h-4 w-4" />{showQR ? "إخفاء" : "QR"}
                  </Button>
                  {profile.linkedin_url && (
                    <Button size="sm" variant="ghost" asChild><a href={profile.linkedin_url} target="_blank" rel="noopener"><Linkedin className="h-4 w-4" /></a></Button>
                  )}
                  {profile.portfolio_url && (
                    <Button size="sm" variant="ghost" asChild><a href={profile.portfolio_url} target="_blank" rel="noopener"><Globe className="h-4 w-4" /></a></Button>
                  )}
                </div>
              </div>
            </div>

            {showQR && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                  <QRCodeSVG value={profileUrl} size={160} level="H" />
                </div>
                <p className="text-xs text-muted-foreground">امسح الكود للوصول للملف المهني</p>
              </div>
            )}
          </div>
        </div>

        <div className="container max-w-3xl py-8 space-y-6">
          {/* Summary */}
          {profile.summary && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2"><Star className="h-5 w-5 text-primary" />نبذة</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-primary" />المهارات</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: string, i: number) => <Badge key={i} variant="secondary" className="rounded-full px-3 py-1">{s}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />الخبرات</h2>
                <div className="space-y-4">
                  {experiences.map((exp: any, i: number) => (
                    <div key={i} className="border-r-2 border-primary/20 pr-4 space-y-1">
                      <h3 className="font-semibold text-foreground">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company} {exp.period && `· ${exp.period}`}</p>
                      {exp.description && <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.education && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />التعليم</h2>
                <p className="text-muted-foreground whitespace-pre-line">{profile.education}</p>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {profile.certifications && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-accent" />الشهادات</h2>
                <p className="text-muted-foreground whitespace-pre-line">{profile.certifications}</p>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2"><FolderOpen className="h-5 w-5 text-primary" />المشاريع والإنجازات</h2>
                <div className="space-y-3">
                  {projects.map((p: any, i: number) => (
                    <div key={i} className="rounded-xl border p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{p.title}</h3>
                        {p.url && <a href={p.url} target="_blank" rel="noopener" className="text-primary"><ExternalLink className="h-4 w-4" /></a>}
                      </div>
                      {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Volunteering */}
          {volunteering.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-destructive" />التطوع</h2>
                <div className="space-y-3">
                  {volunteering.map((v: any, i: number) => (
                    <div key={i} className="border-r-2 border-accent/30 pr-4 space-y-1">
                      <h3 className="font-semibold text-foreground">{v.role}</h3>
                      <p className="text-sm text-muted-foreground">{v.organization} {v.period && `· ${v.period}`}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicProfile;
