import { Link } from "react-router-dom";
import { Briefcase, GraduationCap, HeartPulse, Monitor, Users, Scale, Megaphone, HandHeart, DollarSign, Cog } from "lucide-react";

const categories = [
  { name: "الإدارة والقيادة", slug: "management", icon: Briefcase, count: 24 },
  { name: "التعليم والتدريب", slug: "education", icon: GraduationCap, count: 18 },
  { name: "التنمية الاجتماعية", slug: "social-development", icon: Users, count: 15 },
  { name: "الصحة والرعاية", slug: "health", icon: HeartPulse, count: 12 },
  { name: "التقنية والمعلومات", slug: "technology", icon: Monitor, count: 20 },
  { name: "المالية والمحاسبة", slug: "finance", icon: DollarSign, count: 9 },
  { name: "التسويق والاتصال", slug: "marketing", icon: Megaphone, count: 14 },
  { name: "التطوع وخدمة المجتمع", slug: "volunteering", icon: HandHeart, count: 11 },
];

const CategoriesSection = () => {
  return (
    <section className="bg-muted/50 py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold">تصفح حسب التصنيف</h2>
          <p className="mt-2 text-sm text-muted-foreground">اختر المجال الذي يناسب تخصصك</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                to={`/jobs?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold">{cat.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{cat.count} وظيفة</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
