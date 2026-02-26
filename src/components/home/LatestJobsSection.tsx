import { MapPin, Briefcase, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const latestJobs = [
  { id: "10", title: "مدير مشاريع", org: "جمعية الإنماء", city: "الرياض", type: "دوام كامل", posted: "منذ ساعتين" },
  { id: "11", title: "أخصائي موارد بشرية", org: "مؤسسة النماء", city: "جدة", type: "دوام كامل", posted: "منذ 5 ساعات" },
  { id: "12", title: "مطور ويب", org: "وقف التقنية", city: "عن بُعد", type: "عقد", posted: "منذ يوم" },
  { id: "13", title: "مسؤول علاقات عامة", org: "جمعية تواصل", city: "الدمام", type: "دوام كامل", posted: "منذ يوم" },
  { id: "14", title: "باحث اجتماعي", org: "مؤسسة الأمل", city: "مكة", type: "دوام جزئي", posted: "منذ يومين" },
  { id: "15", title: "مصمم جرافيك", org: "جمعية إبداع", city: "الرياض", type: "عن بُعد", posted: "منذ يومين" },
];

const LatestJobsSection = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">أحدث الوظائف</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/jobs">عرض جميع الوظائف</Link>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {latestJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <Card className="group transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm font-bold group-hover:text-primary">{job.title}</h3>
                    <p className="text-xs text-muted-foreground">{job.org}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {job.city}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Briefcase className="h-3 w-3" /> {job.type}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-[10px] text-muted-foreground">
                    <Clock className="mb-0.5 inline h-3 w-3" /> {job.posted}
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

export default LatestJobsSection;
