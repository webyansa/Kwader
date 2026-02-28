import { Shield, Zap, Users, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "موثوقية وجودة",
    desc: "جميع الوظائف تمر بمراجعة واعتماد قبل نشرها لضمان جودة المحتوى",
  },
  {
    icon: Zap,
    title: "سرعة ووصول",
    desc: "انشر وظيفتك وصل لآلاف المتخصصين في القطاع غير الربحي",
  },
  {
    icon: Users,
    title: "كفاءات متخصصة",
    desc: "قاعدة متنامية من الباحثين عن عمل المتخصصين بالقطاع الثالث",
  },
  {
    icon: BarChart3,
    title: "تقارير وتحليلات",
    desc: "تابع أداء إعلاناتك من مشاهدات ونقرات وطلبات تقديم",
  },
];

const WhyUsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">لماذا منصة كوادر؟</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">نوفر بيئة توظيف احترافية مصممة خصيصًا للقطاع غير الربحي</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group text-center rounded-2xl border border-border/60 bg-card p-7 shadow-card card-hover">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 transition-colors duration-200 group-hover:bg-accent/15">
                  <Icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
