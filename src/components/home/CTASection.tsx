import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="bg-gradient-primary py-20 text-primary-foreground">
      <div className="container text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight">ابدأ رحلتك مع منصة كوادر اليوم</h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed opacity-80">
          انضم لعشرات الجمعيات والمؤسسات التي تستخدم منصة كوادر للوصول لأفضل الكفاءات في القطاع غير الربحي
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="font-display font-bold rounded-xl bg-card text-foreground hover:bg-card/90 shadow-premium" asChild>
            <Link to="/portal-landing">سجّل كيانك مجانًا</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/20 font-display font-bold rounded-xl text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/talents-portal">انضم ككوادر</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
