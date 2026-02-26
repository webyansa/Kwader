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
    <section className="py-16">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold">لماذا منصة وظائف؟</h2>
          <p className="mt-2 text-sm text-muted-foreground">نوفر بيئة توظيف احترافية مصممة خصيصًا للقطاع غير الربحي</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
