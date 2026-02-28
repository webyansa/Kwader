import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, FileText, Users, BarChart3, Shield, Zap } from "lucide-react";

const steps = [
  { num: "1", title: "سجّل كيانك", desc: "أنشئ حساباً لجمعيتك أو مؤسستك غير الربحية في دقائق" },
  { num: "2", title: "أضف فريقك", desc: "ادعُ مسؤولي التوظيف في كيانك لإدارة الوظائف والطلبات" },
  { num: "3", title: "انشر وظائفك", desc: "انشر الوظائف واستقبل الطلبات وأدر عملية التوظيف بالكامل" },
];

const features = [
  { icon: FileText, title: "نشر وظائف متعددة", desc: "انشر وظائف بأنواعها المختلفة مع خيارات التمييز والاستعجال" },
  { icon: Users, title: "إدارة الطلبات", desc: "استعرض طلبات المتقدمين وصنّفها وتواصل معهم مباشرة" },
  { icon: BarChart3, title: "تقارير وإحصائيات", desc: "تابع أداء وظائفك بتقارير تفصيلية عن المشاهدات والتقديمات" },
  { icon: Shield, title: "إدارة الفريق", desc: "أضف مسؤولي توظيف بصلاحيات مخصصة لإدارة الوظائف" },
  { icon: Zap, title: "وظائف مميزة وعاجلة", desc: "اجعل وظائفك تظهر في المقدمة لجذب أفضل الكفاءات" },
  { icon: Building2, title: "صفحة كيانك", desc: "صفحة احترافية لكيانك تعرض معلوماته ووظائفه المتاحة" },
];

const PortalLanding = () => {
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
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">
              بوابة <span className="text-primary">الكيانات</span> لإدارة التوظيف
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              منصة متكاملة تمكّن الجمعيات والمؤسسات غير الربحية من نشر الوظائف وإدارة عمليات التوظيف
              والوصول لأفضل الكفاءات المتخصصة في القطاع
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="font-display font-bold" asChild>
                <Link to="/register?type=org">إنشاء حساب كيان</Link>
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
          <h2 className="mb-10 text-center font-display text-2xl font-bold">ابدأ في ٣ خطوات بسيطة</h2>
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
          <h2 className="mb-10 text-center font-display text-2xl font-bold">مزايا بوابة الكيانات</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-black">ابدأ بنشر وظائف كيانك اليوم</h2>
          <p className="mx-auto mt-4 max-w-lg text-base opacity-90">
            انضم لعشرات الجمعيات التي تستخدم منصة كوادر للوصول لأفضل الكفاءات في القطاع غير الربحي
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="font-display font-bold" asChild>
              <Link to="/register?type=org">سجّل كيانك مجانًا</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 font-display font-bold text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/pricing">استعرض الباقات</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PortalLanding;
