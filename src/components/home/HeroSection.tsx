import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-primary/5 via-background to-accent/5 py-20 md:py-28">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -start-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -end-20 h-60 w-60 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            أكثر من <span className="font-bold text-primary">150</span> وظيفة متاحة الآن
          </div>

          <h1 className="font-display text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
            كوادر القطاع
            <span className="text-primary"> غير الربحي</span>
            <br />
            في مكان واحد
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            المنصة الأولى المتخصصة بتمكين الكفاءات وربطها بالجمعيات والمؤسسات الأهلية والأوقاف في السعودية والعالم العربي
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border bg-card p-3 shadow-lg sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث عن وظيفة..."
                className="h-12 border-0 bg-muted/50 ps-10 text-base shadow-none"
              />
            </div>
            <Button size="lg" className="h-12 px-8 font-display font-bold" asChild>
              <Link to="/jobs">ابحث الآن</Link>
            </Button>
          </div>

          {/* Quick filters */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["إدارة", "تعليم", "تقنية", "صحة", "عن بُعد"].map((tag) => (
              <Link
                key={tag}
                to={`/jobs?q=${tag}`}
                className="rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {tag}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
