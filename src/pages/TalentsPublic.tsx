import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { differenceInDays } from "date-fns";
import {
  Search,
  User,
  MapPin,
  Briefcase,
  Eye,
  FileText,
  QrCode,
  X,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Download,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TalentProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  headline: string | null;
  city: string | null;
  experience_level: string | null;
  skills: string[] | null;
  avatar_url: string | null;
  available_for_work: boolean;
  allow_cv_public_view: boolean;
  updated_at: string;
  job_preferences: Record<string, unknown> | null;
}

const experienceLabels: Record<string, string> = {
  junior: "مبتدئ",
  mid: "متوسط",
  senior: "خبير",
  leadership: "قيادي",
};

const experienceWeight: Record<string, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  leadership: 4,
};

const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "أبها", "تبوك", "حائل", "الطائف", "نجران"];

const TalentsPublic = () => {
  const { toast } = useToast();

  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [showFilters, setShowFilters] = useState(false);
  const [qrUsername, setQrUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("job_seeker_profiles")
        .select("id, user_id, full_name, username, headline, city, experience_level, skills, avatar_url, available_for_work, allow_cv_public_view, updated_at, job_preferences")
        .eq("privacy", "public")
        .order("updated_at", { ascending: false })
        .limit(250);

      setTalents((data as TalentProfile[]) || []);
      setLoading(false);
    };

    fetchTalents();
  }, []);

  const profileBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const profileUrl = (username: string) => `${profileBaseUrl}/@${username}`;

  const availableFields = useMemo(() => {
    const set = new Set<string>();
    talents.forEach((talent) => {
      const field = talent.job_preferences?.professional_field;
      if (typeof field === "string" && field.trim()) set.add(field.trim());
    });
    return Array.from(set);
  }, [talents]);

  const filteredTalents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = talents.filter((talent) => {
      const skills = talent.skills || [];
      const searchableSkills = skills.join(" ").toLowerCase();
      const name = (talent.full_name || "").toLowerCase();
      const headline = (talent.headline || "").toLowerCase();
      const city = talent.city || "";
      const professionalField = typeof talent.job_preferences?.professional_field === "string" ? talent.job_preferences.professional_field : "";
      const jobTypes = Array.isArray(talent.job_preferences?.job_types) ? (talent.job_preferences?.job_types as string[]) : [];

      const matchSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        headline.includes(normalizedSearch) ||
        searchableSkills.includes(normalizedSearch);

      const matchCity = cityFilter === "all" || city === cityFilter;
      const matchField = fieldFilter === "all" || professionalField === fieldFilter;
      const matchLevel = levelFilter === "all" || talent.experience_level === levelFilter;
      const matchWorkMode = workModeFilter === "all" || jobTypes.includes(workModeFilter);
      const matchAvailability = !availableOnly || talent.available_for_work;

      return matchSearch && matchCity && matchField && matchLevel && matchWorkMode && matchAvailability;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "experience") {
        return (experienceWeight[b.experience_level || ""] || 0) - (experienceWeight[a.experience_level || ""] || 0);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [talents, search, cityFilter, fieldFilter, levelFilter, workModeFilter, availableOnly, sortBy]);

  const onViewDetails = (username: string | null) => {
    if (username) return;
    toast({ title: "لم يتم تفعيل رابط الملف بعد", description: "يجب إكمال إعداد اسم المستخدم أولاً.", variant: "destructive" });
  };

  const handleDownloadQr = () => {
    if (!qrUsername) return;
    const canvas = document.getElementById(`qr-${qrUsername}`) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `kawader-${qrUsername}-qr.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Helmet>
        <title>كوادر القطاع | تصفح الكفاءات المهنية</title>
        <meta name="description" content="تصفح كوادر القطاع غير الربحي وابحث حسب المهارات، المدينة، المستوى، والتوافر الوظيفي." />
        <link rel="canonical" href={`${profileBaseUrl}/talents`} />
      </Helmet>

      <Navbar />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-background to-highlight/10" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-card-hover">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl">كوادر القطاع</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">استكشف الكفاءات المهنية في القطاع غير الربحي بتجربة احترافية عصرية</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container">
          <Card className="mb-6 rounded-2xl border shadow-card">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث بالاسم أو المسمى أو المهارات..."
                    className="rounded-xl ps-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowFilters((prev) => !prev)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  الفلاتر
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-3 lg:grid-cols-6">
                      <Select value={cityFilter} onValueChange={setCityFilter}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="المدينة" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المدن</SelectItem>
                          {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Select value={fieldFilter} onValueChange={setFieldFilter}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="المجال" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المجالات</SelectItem>
                          {availableFields.map((field) => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="المستوى" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل المستويات</SelectItem>
                          {Object.entries(experienceLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="نمط العمل" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الأنماط</SelectItem>
                          <SelectItem value="full_time">دوام كامل</SelectItem>
                          <SelectItem value="part_time">جزئي</SelectItem>
                          <SelectItem value="remote">عن بعد</SelectItem>
                          <SelectItem value="consultant">استشاري</SelectItem>
                          <SelectItem value="volunteer">تطوعي</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="الترتيب" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="updated">الأحدث تحديثًا</SelectItem>
                          <SelectItem value="experience">الأكثر خبرة</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center justify-between rounded-xl border bg-secondary/40 px-3 py-2">
                        <Label htmlFor="availableOnly" className="cursor-pointer text-xs font-medium">متاح للعمل</Label>
                        <Switch id="availableOnly" checked={availableOnly} onCheckedChange={setAvailableOnly} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {!loading && <p className="mb-4 text-sm text-muted-foreground">{filteredTalents.length} نتيجة</p>}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border bg-muted" />
              ))}
            </div>
          ) : filteredTalents.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="mt-4 text-muted-foreground">لا توجد نتائج مطابقة حالياً</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTalents.map((talent, idx) => {
                const initials = (talent.full_name || "؟").charAt(0);
                const skills = talent.skills || [];
                const recentlyUpdated = differenceInDays(new Date(), new Date(talent.updated_at)) <= 30;

                return (
                  <motion.div key={talent.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card className="group overflow-hidden rounded-2xl border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                      <div className="h-1 w-full bg-gradient-primary" />

                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start gap-3">
                          {talent.avatar_url ? (
                            <img src={talent.avatar_url} alt={talent.full_name || "صورة الكادر"} className="h-14 w-14 rounded-full border object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold text-primary-foreground">
                              {initials}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-bold text-foreground">{talent.full_name || "كادر"}</h3>
                            {talent.headline && <p className="mt-0.5 truncate text-sm text-muted-foreground">{talent.headline}</p>}

                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              {talent.city && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />{talent.city}
                                </span>
                              )}
                              {talent.experience_level && (
                                <Badge variant="secondary" className="rounded-full text-[10px]">
                                  {experienceLabels[talent.experience_level] || talent.experience_level}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {talent.available_for_work && (
                            <Badge className="rounded-full border-success/30 bg-success/10 text-success hover:bg-success/10">متاح للعمل</Badge>
                          )}
                          {recentlyUpdated && (
                            <Badge variant="outline" className="gap-1 rounded-full">
                              <Clock className="h-3 w-3" />محدّث مؤخراً
                            </Badge>
                          )}
                        </div>

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {skills.slice(0, 4).map((skill) => (
                              <span key={skill} className="rounded-full bg-highlight/10 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                                {skill}
                              </span>
                            ))}
                            {skills.length > 4 && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">+{skills.length - 4}</span>}
                          </div>
                        )}

                        <div className="flex items-center gap-2 border-t pt-3">
                          {talent.username ? (
                            <Button asChild size="sm" className="h-9 flex-1 rounded-xl gap-1.5">
                              <Link to={`/@${talent.username}`}>
                                <Eye className="h-3.5 w-3.5" />عرض التفاصيل
                              </Link>
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-9 flex-1 rounded-xl text-xs" onClick={() => onViewDetails(talent.username)}>
                              لم يتم تفعيل الرابط بعد
                            </Button>
                          )}

                          {talent.username && talent.allow_cv_public_view && (
                            <Button asChild size="sm" variant="outline" className="h-9 rounded-xl gap-1.5">
                              <Link to={`/@${talent.username}/cv`}>
                                <FileText className="h-3.5 w-3.5" />السيرة
                              </Link>
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-xl"
                            disabled={!talent.username}
                            onClick={() => talent.username && setQrUsername(talent.username)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {qrUsername && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
            onClick={() => setQrUsername(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 text-center shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="absolute start-3 top-3 rounded-full p-1.5 hover:bg-muted" onClick={() => setQrUsername(null)}>
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-bold text-foreground">رمز QR للملف المهني</h3>
              <div className="inline-block rounded-xl border bg-card p-3">
                <QRCodeCanvas id={`qr-${qrUsername}`} value={profileUrl(qrUsername)} size={200} level="H" />
              </div>
              <p className="text-xs text-muted-foreground">امسح الكود لفتح صفحة /@{qrUsername}</p>

              <Button className="w-full rounded-xl gap-2" onClick={handleDownloadQr}>
                <Download className="h-4 w-4" />تحميل QR كصورة PNG
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default TalentsPublic;
