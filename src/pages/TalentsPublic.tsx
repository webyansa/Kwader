import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface TalentCard {
  id: string;
  full_name: string | null;
  city: string | null;
  experience_level: string | null;
  skills: string[] | null;
  summary: string | null;
}

const experienceLabels: Record<string, string> = {
  junior: "مبتدئ",
  mid: "متوسط",
  senior: "خبير",
};

const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "أبها", "تبوك"];

const TalentsPublic = () => {
  const [talents, setTalents] = useState<TalentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);
      let query = supabase
        .from("job_seeker_profiles")
        .select("id, full_name, city, experience_level, skills, summary")
        .order("created_at", { ascending: false })
        .limit(50);

      if (cityFilter && cityFilter !== "all") {
        query = query.eq("city", cityFilter);
      }
      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }

      const { data } = await query;
      setTalents(data || []);
      setLoading(false);
    };
    fetchTalents();
  }, [search, cityFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-bl from-primary/5 via-background to-accent/5 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-display text-4xl font-black">كوادر القطاع</h1>
            <p className="mt-3 text-muted-foreground">
              تصفح الكفاءات المتخصصة في القطاع غير الربحي
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم..."
                className="ps-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="المدينة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CTA Banners */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="font-display font-bold">هل أنت كيان غير ربحي؟</h3>
              <p className="mt-1 text-sm text-muted-foreground">سجل كيانك للوصول الكامل لقاعدة الكوادر والتواصل المباشر</p>
              <Button size="sm" className="mt-3" asChild>
                <Link to="/register?type=org">سجّل كيانك الآن</Link>
              </Button>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
              <h3 className="font-display font-bold">هل تبحث عن فرصة في القطاع؟</h3>
              <p className="mt-1 text-sm text-muted-foreground">أنشئ ملفك المهني واجعل الجمعيات تجدك</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link to="/register?type=seeker">أنشئ ملفك المهني</Link>
              </Button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl border bg-muted" />
              ))}
            </div>
          ) : talents.length === 0 ? (
            <div className="py-20 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">لا توجد كوادر مطابقة للبحث</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {talents.map((talent) => (
                <div
                  key={talent.id}
                  className="rounded-xl border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {talent.full_name?.charAt(0) || "؟"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display font-bold">{talent.full_name || "مستخدم"}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {talent.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" /> {talent.city}
                          </span>
                        )}
                        {talent.experience_level && (
                          <span className="flex items-center gap-0.5">
                            <Briefcase className="h-3 w-3" /> {experienceLabels[talent.experience_level] || talent.experience_level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {talent.summary && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{talent.summary}</p>
                  )}
                  {talent.skills && talent.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {talent.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
                      ))}
                      {talent.skills.length > 4 && (
                        <Badge variant="outline" className="text-[10px]">+{talent.skills.length - 4}</Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TalentsPublic;
