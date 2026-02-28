import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, FileText, Search, Bell, Star, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { num: "1", title: "أنشئ حسابك", desc: "سجّل حساب كوادر مجاني في أقل من دقيقة" },
  { num: "2", title: "أكمل ملفك المهني", desc: "أضف مهاراتك وخبراتك وشهاداتك لبناء ملف احترافي" },
  { num: "3", title: "ابدأ التقديم", desc: "تصفح الوظائف المتاحة وقدّم على الفرص المناسبة لك" },
];

const features = [
  { icon: FileText, title: "ملف مهني متكامل", desc: "أنشئ ملفاً مهنياً يبرز مهاراتك وخبراتك في القطاع غير الربحي" },
  { icon: Search, title: "بحث ذكي عن الوظائف", desc: "اعثر على الفرص المناسبة عبر فلاتر متقدمة حسب التخصص والمدينة" },
  { icon: Bell, title: "تنبيهات فورية", desc: "احصل على إشعارات عند نشر وظائف جديدة تناسب ملفك المهني" },
  { icon: Star, title: "تقديم سريع", desc: "قدّم على الوظائف بنقرة واحدة وتابع حالة طلباتك بسهولة" },
];

interface FeaturedTalent {
  id: string;
  full_name: string | null;
  city: string | null;
  experience_level: string | null;
  skills: string[] | null;
}

const experienceLabels: Record<string, string> = {
  junior: "مبتدئ",
  mid: "متوسط",
  senior: "خبير",
};

const TalentsPortalLanding = () => {
  const [featured, setFeatured] = useState<FeaturedTalent[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("job_seeker_profiles")
        .select("id, full_name, city, experience_level, skills")
        .not("full_name", "is", null)
        .limit(6);
      setFeatured(data || []);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary/5 via-background to-accent/5 py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <User className="h-8 w-8 text-accent" />
            </div>
            <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">
              بوابة <span className="text-primary">كوادر</span> القطاع
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              أنشئ ملفك المهني وابدأ التقديم على أفضل الفرص الوظيفية في الجمعيات والمؤسسات غير الربحية
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="font-display font-bold" asChild>
                <Link to="/register/talent">إنشاء حساب كوادر</Link>
              </Button>
              <Button size="lg" variant="outline" className="font-display font-bold" asChild>
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b bg-card py-16">
        <div className="container">
          <h2 className="mb-10 text-center font-display text-2xl font-bold">ابدأ في ٣ خطوات</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">
                  {step.num}
                </div>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-10 text-center font-display text-2xl font-bold">مزايا بوابة الكوادر</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-xl border bg-card p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Talents */}
      {featured.length > 0 && (
        <section className="bg-muted/50 py-16">
          <div className="container">
            <h2 className="mb-8 text-center font-display text-2xl font-bold">أبرز الكوادر المسجلة</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((t) => (
                <div key={t.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {t.full_name?.charAt(0) || "؟"}
                    </div>
                    <div>
                      <h3 className="font-display font-bold">{t.full_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {t.city && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {t.city}</span>}
                        {t.experience_level && <span className="flex items-center gap-0.5"><Briefcase className="h-3 w-3" /> {experienceLabels[t.experience_level] || t.experience_level}</span>}
                      </div>
                    </div>
                  </div>
                  {t.skills && t.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.skills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link to="/talents-public">عرض جميع الكوادر</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-black">ابدأ مسيرتك المهنية في القطاع غير الربحي</h2>
          <p className="mx-auto mt-4 max-w-lg text-base opacity-90">
            أنشئ ملفك المهني الآن وانضم لآلاف الكوادر المتخصصة في خدمة المجتمع
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="font-display font-bold" asChild>
              <Link to="/register/talent">أنشئ حسابك مجانًا</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 font-display font-bold text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/jobs">تصفح الوظائف</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TalentsPortalLanding;
