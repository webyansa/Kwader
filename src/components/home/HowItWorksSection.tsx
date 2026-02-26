import { Search, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "ابحث",
    desc: "تصفح الوظائف المتاحة وابحث حسب التخصص والمدينة",
    forWho: "للباحثين عن عمل",
  },
  {
    icon: FileText,
    title: "قدّم",
    desc: "أرسل سيرتك الذاتية ورسالة التغطية مباشرة",
    forWho: "للباحثين عن عمل",
  },
  {
    icon: CheckCircle,
    title: "توظّف",
    desc: "تواصل الجمعية معك وابدأ رحلتك المهنية",
    forWho: "للباحثين عن عمل",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-primary/5 py-16">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold">كيف تعمل المنصة؟</h2>
          <p className="mt-2 text-sm text-muted-foreground">ثلاث خطوات بسيطة للحصول على وظيفتك</p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="absolute -start-4 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground md:start-auto md:-top-2 md:end-0">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
