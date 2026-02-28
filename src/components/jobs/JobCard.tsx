import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase, Building2 } from "lucide-react";

const employmentTypeLabels: Record<string, string> = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  intern: "تدريب",
  consultant: "استشاري",
  volunteer: "تطوعي",
};

const remoteTypeLabels: Record<string, string> = {
  onsite: "حضوري",
  remote: "عن بُعد",
  hybrid: "هجين",
};

interface JobCardProps {
  job: any;
}

const JobCard = ({ job }: JobCardProps) => {
  const org = job.organizations;
  const category = job.categories;

  return (
    <Link
      to={`/jobs/${job.slug_unique || job.id}`}
      className="group block rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {org?.logo_url ? (
          <img src={org.logo_url} alt={org.name_ar} className="h-12 w-12 rounded-lg border object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {job.is_urgent && <Badge className="bg-urgent text-urgent-foreground text-[10px] px-2 py-0">عاجلة</Badge>}
            {job.is_featured && <Badge className="bg-featured text-featured-foreground text-[10px] px-2 py-0">مميزة</Badge>}
          </div>
          <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{org?.name_ar}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {job.city && (
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.city}</span>
            )}
            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{employmentTypeLabels[job.employment_type] || job.employment_type}</span>
            <span className="flex items-center gap-1">{remoteTypeLabels[job.remote_type] || job.remote_type}</span>
            {job.closing_date && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(job.closing_date).toLocaleDateString("ar-SA")}
              </span>
            )}
          </div>
          {category && (
            <Badge variant="secondary" className="mt-2 text-[10px]">{category.name_ar}</Badge>
          )}
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
