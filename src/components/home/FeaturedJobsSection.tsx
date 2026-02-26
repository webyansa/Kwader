import { Star, MapPin, Building2, Clock, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const featuredJobs = [
  {
    id: "5",
    title: "مدير برنامج تطوعي",
    org: "جمعية خيرات",
    city: "الرياض",
    type: "دوام كامل",
    level: "متوسط",
    salary: "8,000 - 12,000 ر.س",
    featured: true,
  },
  {
    id: "6",
    title: "مصمم تجربة مستخدم",
    org: "مؤسسة التمكين",
    city: "جدة",
    type: "دوام كامل",
    level: "مبتدئ",
    salary: "6,000 - 9,000 ر.س",
    featured: true,
  },
  {
    id: "7",
    title: "أخصائي جمع تبرعات",
    org: "جمعية البر",
    city: "عن بُعد",
    type: "دوام جزئي",
    level: "خبير",
    salary: "غير محدد",
    featured: true,
  },
];

const FeaturedJobsSection = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-featured" />
            <h2 className="font-display text-2xl font-bold">وظائف مميزة</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/jobs?featured=true">عرض الكل</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <Card className="group h-full border-featured/20 bg-gradient-to-bl from-featured/5 to-card transition-all hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <Badge className="bg-featured text-featured-foreground text-[10px]">
                      <Star className="me-1 h-3 w-3" />
                      مميزة
                    </Badge>
                  </div>

                  <h3 className="font-display text-base font-bold group-hover:text-primary">{job.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{job.org}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {job.city}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" /> {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {job.level}
                    </span>
                  </div>

                  <div className="mt-4 border-t pt-3 text-sm font-semibold text-primary">
                    {job.salary}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobsSection;
