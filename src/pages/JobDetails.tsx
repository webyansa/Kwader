import { useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ApplicationForm from "@/components/jobs/ApplicationForm";
import ShareButtons from "@/components/jobs/ShareButtons";
import ReportDialog from "@/components/jobs/ReportDialog";
import SimilarJobs from "@/components/jobs/SimilarJobs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, Building2, Globe, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const labels: Record<string, Record<string, string>> = {
  employment_type: { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", intern: "تدريب" },
  remote_type: { onsite: "حضوري", remote: "عن بُعد", hybrid: "هجين" },
  experience_level: { junior: "مبتدئ", mid: "متوسط", senior: "خبير", any: "أي مستوى" },
};

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id!);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">الوظيفة غير موجودة أو تم حذفها.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const org = job.organizations;
  const category = job.categories;
  const pageUrl = window.location.href;

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="border-b bg-muted/30 py-8">
          <div className="container">
            <div className="flex items-start gap-4">
              {org?.logo_url ? (
                <img src={org.logo_url} alt={org.name_ar} className="h-16 w-16 rounded-xl border object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {job.is_urgent && <Badge className="bg-urgent text-urgent-foreground">عاجلة</Badge>}
                  {job.is_featured && <Badge className="bg-featured text-featured-foreground">مميزة</Badge>}
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">{job.title}</h1>
                <p className="mt-1 text-muted-foreground">{org?.name_ar}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {job.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.city}</span>}
                  <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{labels.employment_type[job.employment_type]}</span>
                  <span>{labels.remote_type[job.remote_type]}</span>
                  <span>{labels.experience_level[job.experience_level]}</span>
                  {job.closing_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      يُغلق: {new Date(job.closing_date).toLocaleDateString("ar-SA")}
                    </span>
                  )}
                </div>
                {job.salary_visible && (job.salary_min || job.salary_max) && (
                  <p className="mt-2 text-sm font-medium text-primary">
                    الراتب: {job.salary_min && `${Number(job.salary_min).toLocaleString("ar-SA")}`}
                    {job.salary_min && job.salary_max && " - "}
                    {job.salary_max && `${Number(job.salary_max).toLocaleString("ar-SA")}`} ر.س
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="space-y-6 lg:col-span-2">
              {job.description && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">وصف الوظيفة</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">{job.description}</div>
                </section>
              )}
              {job.responsibilities && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">المسؤوليات</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">{job.responsibilities}</div>
                </section>
              )}
              {job.requirements && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">المتطلبات</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">{job.requirements}</div>
                </section>
              )}

              <div className="flex items-center gap-3 border-t pt-4">
                <ShareButtons title={job.title} url={pageUrl} />
                <ReportDialog entityId={job.id} />
              </div>

              {/* Application section */}
              <div className="pt-4">
                {job.application_method === "internal_form" ? (
                  <ApplicationForm jobId={job.id} />
                ) : job.application_method === "external_url" && job.application_url ? (
                  <Button asChild size="lg" className="w-full gap-2">
                    <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />تقديم عبر الموقع الخارجي
                    </a>
                  </Button>
                ) : job.application_method === "email" && job.application_email ? (
                  <Button asChild size="lg" className="w-full gap-2">
                    <a href={`mailto:${job.application_email}?subject=${encodeURIComponent(`تقديم على: ${job.title}`)}`}>
                      <Mail className="h-4 w-4" />تقديم عبر البريد الإلكتروني
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Org info */}
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h3 className="font-display text-sm font-bold text-foreground">عن الجمعية</h3>
                <p className="font-medium text-foreground">{org?.name_ar}</p>
                {org?.city && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{org.city}</p>}
                {org?.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Globe className="h-3.5 w-3.5" />الموقع الإلكتروني
                  </a>
                )}
              </div>

              {/* Category */}
              {category && (
                <div className="rounded-xl border bg-card p-5">
                  <h3 className="font-display text-sm font-bold text-foreground mb-2">التصنيف</h3>
                  <Badge variant="secondary">{category.name_ar}</Badge>
                </div>
              )}

              {/* Similar jobs */}
              <SimilarJobs jobId={job.id} categoryId={job.category_id} city={job.city} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetails;
