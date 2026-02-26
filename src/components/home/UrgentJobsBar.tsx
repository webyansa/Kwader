import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const urgentJobs = [
  { id: "1", title: "مدير تنفيذي", org: "جمعية الإحسان", city: "الرياض", daysLeft: 3 },
  { id: "2", title: "أخصائي اجتماعي", org: "مؤسسة العناية", city: "جدة", daysLeft: 2 },
  { id: "3", title: "محاسب مالي", org: "وقف التعليم", city: "الدمام", daysLeft: 5 },
  { id: "4", title: "مسؤول تسويق رقمي", org: "جمعية التنمية", city: "مكة", daysLeft: 1 },
];

const UrgentJobsBar = () => {
  return (
    <section className="border-b bg-urgent/5 py-6">
      <div className="container">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-urgent" />
          <h2 className="font-display text-lg font-bold">وظائف عاجلة</h2>
          <Badge variant="destructive" className="text-xs">
            تنتهي قريبًا
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {urgentJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <Card className="group border-urgent/20 p-4 transition-all hover:border-urgent/40 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold group-hover:text-primary">{job.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{job.org}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{job.city}</p>
                  </div>
                  <Badge variant="destructive" className="shrink-0 text-[10px]">
                    {job.daysLeft} أيام
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UrgentJobsBar;
