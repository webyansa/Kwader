import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-24 md:py-32">
      {/* Subtle decorative orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -start-32 -top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-16 -end-16 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute top-1/2 start-1/2 h-40 w-40 rounded-full bg-highlight/5 blur-3xl" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground shadow-card">
            <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
            أكثر من <span className="font-bold text-foreground">150</span> وظيفة متاحة الآن
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.5rem]">
            كوادر القطاع
            <span className="text-accent"> غير الربحي</span>
            <br />
            في مكان واحد
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            المنصة الأولى المتخصصة بتمكين الكفاءات وربطها بالجمعيات والمؤسسات الأهلية والأوقاف في السعودية والعالم العربي
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-premium sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث عن وظيفة..."
                className="h-12 border-0 bg-secondary/50 ps-10 text-base shadow-none rounded-xl"
              />
            </div>
            <Button size="lg" className="h-12 px-8 font-display font-bold rounded-xl" asChild>
              <Link to="/jobs">ابحث الآن</Link>
            </Button>
          </motion.div>

          {/* Quick filters */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["إدارة", "تعليم", "تقنية", "صحة", "عن بُعد"].map((tag) => (
              <Link
                key={tag}
                to={`/jobs?q=${tag}`}
                className="rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:border-accent hover:text-accent hover:shadow-sm"
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
