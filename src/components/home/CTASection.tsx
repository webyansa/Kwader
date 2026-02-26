import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container text-center">
        <h2 className="font-display text-3xl font-black">ابدأ بنشر وظائف جمعيتك اليوم</h2>
        <p className="mx-auto mt-4 max-w-lg text-base opacity-90">
          انضم لعشرات الجمعيات التي تستخدم منصة وظائف للوصول لأفضل الكفاءات في القطاع غير الربحي
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" className="font-display font-bold" asChild>
            <Link to="/register">سجّل جمعيتك مجانًا</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 font-display font-bold text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/jobs">تصفح الوظائف</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
