import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Target, Users, Award, Globe } from "lucide-react";

const stats = [
  { label: "جمعية ومؤسسة مسجلة", value: "+120" },
  { label: "وظيفة تم نشرها", value: "+3,500" },
  { label: "باحث عن عمل مسجل", value: "+8,000" },
  { label: "عملية توظيف ناجحة", value: "+1,200" },
];

const values = [
  {
    icon: Target,
    title: "رؤيتنا",
    description: "أن نكون المنصة الرائدة في تمكين القطاع غير الربحي من استقطاب أفضل الكفاءات الوطنية، وبناء بيئة عمل مهنية مستدامة.",
  },
  {
    icon: Users,
    title: "رسالتنا",
    description: "تسهيل عملية التوظيف والربط بين الجمعيات والمؤسسات الأهلية والكوادر المتخصصة عبر منصة رقمية متكاملة وموثوقة.",
  },
  {
    icon: Award,
    title: "قيمنا",
    description: "الشفافية والمهنية والابتكار. نلتزم بأعلى معايير الجودة في تقديم خدمات التوظيف المتخصصة للقطاع غير الربحي.",
  },
  {
    icon: Globe,
    title: "أثرنا",
    description: "ساهمنا في تمكين عشرات الجمعيات من بناء فرق عمل متميزة، ووفرنا فرصاً مهنية حقيقية لآلاف الباحثين عن عمل في القطاع.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary/5 via-background to-accent/5 py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">
              عن منصة <span className="text-primary">كوادر</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              المنصة الأولى المتخصصة في توظيف الكفاءات للقطاع غير الربحي في المملكة العربية السعودية والعالم العربي.
              نربط بين الجمعيات والمؤسسات الأهلية وأفضل الكوادر المتخصصة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-black text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-10 text-center font-display text-2xl font-bold">ما يميّزنا</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {values.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl border bg-card p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
