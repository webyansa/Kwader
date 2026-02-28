import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Plan {
  id: string;
  name_ar: string;
  price_monthly: number;
  price_yearly: number;
  jobs_per_month: number;
  featured_count: number;
  urgent_count: number;
  seats: number;
  ad_duration_days: number;
  show_logo_on_card: boolean;
  advanced_reports: boolean;
  boost_available: boolean;
  sort_order: number;
}

const Pricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setPlans(data || []);
      setLoading(false);
    };
    fetchPlans();
  }, []);

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
            <h1 className="font-display text-4xl font-black">باقات الأسعار</h1>
            <p className="mt-3 text-muted-foreground">
              اختر الباقة المناسبة لكيانك وابدأ بنشر وظائفك
            </p>

            {/* Toggle */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-card p-1">
              <button
                onClick={() => setYearly(false)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                شهري
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                سنوي
                <Badge variant="secondary" className="mr-2 text-[10px]">وفّر 20%</Badge>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl border bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan, idx) => {
                const price = yearly ? plan.price_yearly : plan.price_monthly;
                const isPopular = idx === 1;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border p-6 ${isPopular ? "border-primary shadow-lg ring-1 ring-primary/20" : "bg-card"}`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">الأكثر شيوعاً</Badge>
                    )}
                    <h3 className="font-display text-xl font-bold">{plan.name_ar}</h3>
                    <div className="mt-4">
                      <span className="font-display text-4xl font-black text-primary">
                        {price === 0 ? "مجاني" : `${price}`}
                      </span>
                      {price > 0 && (
                        <span className="mr-1 text-sm text-muted-foreground">ر.س / {yearly ? "سنة" : "شهر"}</span>
                      )}
                    </div>

                    <ul className="mt-6 space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {plan.jobs_per_month} وظيفة شهرياً
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {plan.seats} مستخدم
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        مدة الإعلان {plan.ad_duration_days} يوم
                      </li>
                      {plan.featured_count > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {plan.featured_count} وظيفة مميزة
                        </li>
                      )}
                      {plan.urgent_count > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {plan.urgent_count} وظيفة عاجلة
                        </li>
                      )}
                      {plan.show_logo_on_card && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          شعار الكيان على البطاقة
                        </li>
                      )}
                      {plan.advanced_reports && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          تقارير متقدمة
                        </li>
                      )}
                    </ul>

                    <Button
                      className="mt-6 w-full font-display font-bold"
                      variant={isPopular ? "default" : "outline"}
                      asChild
                    >
                      <Link to="/register?type=org">اختر هذه الباقة</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
