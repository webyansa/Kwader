import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "المجانية",
    price: "0",
    period: "شهريًا",
    features: ["وظيفتان شهريًا", "مدة الإعلان 15 يوم", "مستخدم واحد"],
    popular: false,
  },
  {
    name: "الأساسية",
    price: "199",
    period: "شهريًا",
    features: ["10 وظائف شهريًا", "2 وظائف مميزة", "وظيفة عاجلة واحدة", "3 مستخدمين", "شعار الجمعية بالبطاقة"],
    popular: false,
  },
  {
    name: "الاحترافية",
    price: "499",
    period: "شهريًا",
    features: ["30 وظيفة شهريًا", "5 وظائف مميزة", "3 وظائف عاجلة", "10 مستخدمين", "تقارير متقدمة", "خيار Boost"],
    popular: true,
  },
  {
    name: "المؤسسية",
    price: "999",
    period: "شهريًا",
    features: ["100 وظيفة شهريًا", "20 وظيفة مميزة", "10 وظائف عاجلة", "50 مستخدم", "كل المميزات"],
    popular: false,
  },
];

const PricingPreview = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold">باقات الأسعار</h2>
          <p className="mt-2 text-sm text-muted-foreground">اختر الباقة المناسبة لحجم جمعيتك</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-lg ring-1 ring-primary/20" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 start-4 bg-primary text-primary-foreground">
                  الأكثر طلبًا
                </Badge>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="font-display text-3xl font-black text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground"> ر.س/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full font-display"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/register">ابدأ الآن</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/pricing" className="text-sm font-medium text-primary hover:underline">
            قارن الباقات بالتفصيل ←
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;
