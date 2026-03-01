import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search, User, MapPin, Briefcase, Eye, FileText, QrCode, X,
  Clock, Sparkles, ChevronDown, Filter, SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { differenceInDays } from "date-fns";

interface TalentProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  headline: string | null;
  city: string | null;
  experience_level: string | null;
  skills: string[] | null;
  summary: string | null;
  avatar_url: string | null;
  available_for_work: boolean;
  allow_cv_public_view: boolean;
  privacy: string;
  updated_at: string;
}

const experienceLabels: Record<string, string> = {
  junior: "مبتدئ",
  mid: "متوسط",
  senior: "خبير",
  leadership: "قيادي",
};

const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "أبها", "تبوك", "حائل", "الطائف", "نجران"];

const TalentsPublic = () => {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [showFilters, setShowFilters] = useState(false);
  const [qrUsername, setQrUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);
      let query = supabase
        .from("job_seeker_profiles")
        .select("id, user_id, full_name, username, headline, city, experience_level, skills, summary, avatar_url, available_for_work, allow_cv_public_view, privacy, updated_at")
        .eq("privacy", "public")
        .order(sortBy === "updated" ? "updated_at" : "experience_level", { ascending: false })
        .limit(60);

      if (cityFilter && cityFilter !== "all") {
        query = query.eq("city", cityFilter);
      }
      if (levelFilter && levelFilter !== "all") {
        query = query.eq("experience_level", levelFilter);
      }
      if (availableOnly) {
        query = query.eq("available_for_work", true);
      }
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,headline.ilike.%${search}%`);
      }

      const { data } = await query;
      setTalents(data || []);
      setLoading(false);
    };
    fetchTalents();
  }, [search, cityFilter, levelFilter, availableOnly, sortBy]);

  const profileBaseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>كوادر القطاع - تصفح الكفاءات المتخصصة | كوادر</title>
        <meta name="description" content="تصفح واكتشف أفضل الكفاءات المتخصصة في القطاع غير الربحي على منصة كوادر" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-background to-highlight/5" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-foreground">كوادر القطاع</h1>
            <p className="mt-3 text-muted-foreground text-base leading-relaxed">
              اكتشف أفضل الكفاءات المتخصصة في القطاع غير الربحي
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8">
        <div className="container">
          <Card className="rounded-2xl border shadow-card mb-6">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث بالاسم أو المسمى الوظيفي..."
                    className="ps-10 rounded-xl border-border"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-full sm:w-44 rounded-xl">
                    <MapPin className="h-4 w-4 text-muted-foreground me-1" />
                    <SelectValue placeholder="المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المدن</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 sm:w-auto"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  فلاتر متقدمة
                  <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4">
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="w-40 rounded-xl">
                          <Briefcase className="h-4 w-4 text-muted-foreground me-1" />
                          <SelectValue placeholder="المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المستويات</SelectItem>
                          {Object.entries(experienceLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-44 rounded-xl">
                          <SelectValue placeholder="ترتيب" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="updated">الأحدث تحديثاً</SelectItem>
                          <SelectItem value="experience">المستوى الوظيفي</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} id="available" />
                        <Label htmlFor="available" className="text-sm cursor-pointer">متاح للعمل فقط</Label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              {talents.length > 0 ? `${talents.length} كادر` : ""}
            </p>
          )}

          {/* Results Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border bg-muted" />
              ))}
            </div>
          ) : talents.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="mt-4 text-muted-foreground">لا توجد كوادر مطابقة للبحث</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {talents.map((talent, idx) => {
                const initials = (talent.full_name || "؟").charAt(0);
                const recentlyUpdated = differenceInDays(new Date(), new Date(talent.updated_at)) <= 30;
                const skills = talent.skills || [];

                return (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className="group rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden">
                      {/* Top gradient bar */}
                      <div className="h-1 w-full bg-gradient-to-l from-primary via-highlight to-primary" />

                      <CardContent className="p-5">
                        {/* Avatar + info */}
                        <div className="flex items-start gap-3.5">
                          <div className="relative shrink-0">
                            {talent.avatar_url ? (
                              <div className="rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg, hsl(var(--highlight)), hsl(195 100% 50%))' }}>
                                <img
                                  src={talent.avatar_url}
                                  alt={talent.full_name || ""}
                                  className="h-14 w-14 rounded-full object-cover border-2 border-card"
                                />
                              </div>
                            ) : (
                              <div
                                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-highlight-foreground"
                                style={{ background: 'linear-gradient(135deg, hsl(var(--highlight)), hsl(195 100% 50%))' }}
                              >
                                {initials}
                              </div>
                            )}
                            {talent.available_for_work && (
                              <span className="absolute -bottom-0.5 -start-0.5 h-4 w-4 rounded-full border-2 border-card bg-success" title="متاح للعمل" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-display text-base font-bold text-foreground">
                              {talent.full_name || "مستخدم"}
                            </h3>
                            {talent.headline && (
                              <p className="truncate text-sm text-muted-foreground mt-0.5">{talent.headline}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {talent.city && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />{talent.city}
                                </span>
                              )}
                              {talent.experience_level && (
                                <Badge variant="secondary" className="text-[10px] px-2 py-0 rounded-full">
                                  {experienceLabels[talent.experience_level] || talent.experience_level}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {talent.available_for_work && (
                            <Badge className="rounded-full text-[10px] px-2 py-0.5 bg-success/10 text-success border-success/20 hover:bg-success/15">
                              ✅ متاح للعمل
                            </Badge>
                          )}
                          {recentlyUpdated && (
                            <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0.5 gap-1">
                              <Clock className="h-2.5 w-2.5" />مُحدّث
                            </Badge>
                          )}
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-highlight/10 text-highlight"
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 4 && (
                              <span className="rounded-full px-2 py-0.5 text-[11px] text-muted-foreground bg-muted">
                                +{skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                          {talent.username ? (
                            <>
                              <Button asChild size="sm" className="flex-1 rounded-xl gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90">
                                <Link to={`/@${talent.username}`}>
                                  <Eye className="h-3.5 w-3.5" />عرض التفاصيل
                                </Link>
                              </Button>
                              {talent.allow_cv_public_view && (
                                <Button asChild size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs h-9">
                                  <Link to={`/@${talent.username}/cv`}>
                                    <FileText className="h-3.5 w-3.5" />السيرة
                                  </Link>
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl h-9 w-9 shrink-0"
                                onClick={() => setQrUsername(talent.username)}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">لا يوجد رابط عام</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CTA Banners */}
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-card">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-foreground">هل أنت كيان غير ربحي؟</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">سجل كيانك للوصول الكامل لقاعدة الكوادر والتواصل المباشر</p>
                <Button size="sm" className="mt-4 rounded-xl" asChild>
                  <Link to="/register?type=org">سجّل كيانك الآن</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-highlight/20 bg-highlight/5 shadow-card">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-foreground">هل تبحث عن فرصة في القطاع؟</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">أنشئ ملفك المهني واجعل الجمعيات تجدك</p>
                <Button size="sm" variant="outline" className="mt-4 rounded-xl" asChild>
                  <Link to="/register?type=seeker">أنشئ ملفك المهني</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* QR Modal */}
      <AnimatePresence>
        {qrUsername && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setQrUsername(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl bg-card p-6 shadow-premium text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setQrUsername(null)}
                className="absolute top-3 start-3 rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-bold text-foreground">رمز QR</h3>
              <div className="rounded-xl bg-card p-4 border inline-block">
                <QRCodeSVG
                  value={`${profileBaseUrl}/@${qrUsername}`}
                  size={200}
                  level="H"
                  fgColor="hsl(231, 50%, 40%)"
                />
              </div>
              <p className="text-xs text-muted-foreground">امسح الكود للوصول للملف المهني</p>
              <p className="text-xs text-primary font-medium direction-ltr">@{qrUsername}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default TalentsPublic;
