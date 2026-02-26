import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const orgs = [
  { id: "1", name: "جمعية الإحسان", initial: "إ" },
  { id: "2", name: "مؤسسة العناية", initial: "ع" },
  { id: "3", name: "وقف التعليم", initial: "ت" },
  { id: "4", name: "جمعية البر", initial: "ب" },
  { id: "5", name: "مؤسسة التمكين", initial: "ت" },
  { id: "6", name: "جمعية خيرات", initial: "خ" },
  { id: "7", name: "جمعية تواصل", initial: "ت" },
  { id: "8", name: "وقف التقنية", initial: "ت" },
];

const OrgsSection = () => {
  return (
    <section className="bg-muted/50 py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold">جمعيات ومؤسسات شريكة</h2>
          <p className="mt-2 text-sm text-muted-foreground">أبرز الجمعيات المسجلة على المنصة</p>
        </div>

        <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-8">
          {orgs.map((org) => (
            <Link
              key={org.id}
              to={`/organizations/${org.id}`}
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-card text-xl font-bold text-primary shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/30">
                {org.initial}
              </div>
              <span className="text-center text-[10px] font-medium text-muted-foreground line-clamp-2 group-hover:text-foreground">
                {org.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/organizations" className="text-sm font-medium text-primary hover:underline">
            عرض جميع الجمعيات ←
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrgsSection;
