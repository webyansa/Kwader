import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShareButtons from "@/components/jobs/ShareButtons";
import ReportDialog from "@/components/jobs/ReportDialog";
import SimilarJobs from "@/components/jobs/SimilarJobs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, Building2, Globe, Mail, ExternalLink, Users, GraduationCap, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const labels: Record<string, Record<string, string>> = {
  employment_type: { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", intern: "تدريب", consultant: "استشاري", volunteer: "تطوعي" },
  remote_type: { onsite: "حضوري", remote: "عن بُعد", hybrid: "هجين" },
  experience_level: { junior: "مبتدئ", mid: "متوسط", senior: "خبير", leadership: "قيادي", any: "أي مستوى" },
};

const JobDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Extract short_id from last segment after last "-"
  const shortId = slug?.match(/-(\d+)$/)?.[1] || slug;

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job-by-slug", shortId],
    queryFn: async () => {
      // Try by short_id first, fallback to id
      let query = supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, slug, city, email, website, short_description), categories!jobs_category_id_fkey(name_ar, slug)")
        .eq("status", "published");

      const { data, error } = await query.eq("short_id", shortId!).maybeSingle();
      if (error) throw error;
      if (data) return data;

      // Fallback: try by UUID id
      const { data: d2, error: e2 } = await supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, slug, city, email, website, short_description), categories!jobs_category_id_fkey(name_ar, slug)")
        .eq("id", slug!)
        .eq("status", "published")
        .maybeSingle();
      if (e2) throw e2;
      return d2;
    },
    enabled: !!shortId,
  });

  // Redirect to canonical slug if different
  useEffect(() => {
    if (job?.slug_unique && slug !== job.slug_unique) {
      navigate(`/jobs/${job.slug_unique}`, { replace: true });
    }
  }, [job, slug, navigate]);

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

  const org = job.organizations as any;
  const category = job.categories as any;
  const canonicalUrl = `${window.location.origin}/jobs/${job.slug_unique}`;
  const metaDescription = job.summary || (job.description?.substring(0, 155) + "...");

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.summary || "",
    datePosted: job.published_at,
    validThrough: job.closing_date,
    employmentType: job.employment_type?.replace("_", " ").toUpperCase(),
    hiringOrganization: {
      "@type": "Organization",
      name: org?.name_ar,
      logo: org?.logo_url,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.city, addressCountry: "SA" },
    },
    ...(job.salary_visible && job.salary_min && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "SAR",
        value: { "@type": "QuantitativeValue", minValue: Number(job.salary_min), maxValue: job.salary_max ? Number(job.salary_max) : undefined, unitText: "MONTH" },
      },
    }),
  };

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Helmet>
        <title>{job.title} | كوادر</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      <main className="flex-1">
        {/* Hero Header */}
        <div className="border-b bg-gradient-to-b from-muted/50 to-background py-10">
          <div className="container">
            <div className="flex items-start gap-5">
              {org?.logo_url ? (
                <img src={org.logo_url} alt={org.name_ar} className="h-16 w-16 rounded-xl border object-cover shadow-sm" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted shadow-sm">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {job.is_urgent && <Badge className="bg-red-100 text-red-700 border-0">عاجلة</Badge>}
                  {job.is_featured && <Badge className="bg-amber-100 text-amber-700 border-0">مميزة</Badge>}
                  {category && <Badge variant="secondary" className="text-xs">{category.name_ar}</Badge>}
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{job.title}</h1>
                <p className="mt-1.5 text-muted-foreground text-lg">{org?.name_ar}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {job.city && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.city}</span>}
                  <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{labels.employment_type[job.employment_type]}</span>
                  <span>{labels.remote_type[job.remote_type]}</span>
                  <span>{labels.experience_level[job.experience_level]}</span>
                  {job.closing_date && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />يُغلق: {new Date(job.closing_date).toLocaleDateString("ar-SA")}
                    </span>
                  )}
                </div>
                {job.salary_visible && (job.salary_min || job.salary_max) && (
                  <p className="mt-3 text-base font-semibold text-primary">
                    {job.salary_min && Number(job.salary_min).toLocaleString("ar-SA")}
                    {job.salary_min && job.salary_max && " - "}
                    {job.salary_max && Number(job.salary_max).toLocaleString("ar-SA")} ر.س / شهرياً
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main */}
            <div className="space-y-8 lg:col-span-2">
              {job.summary && (
                <section>
                  <p className="text-base text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-5 border">{job.summary}</p>
                </section>
              )}
              {job.description && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">عن الوظيفة</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</div>
                </section>
              )}
              {job.responsibilities && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">المسؤوليات</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{job.responsibilities}</div>
                </section>
              )}
              {job.requirements && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">المتطلبات</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{job.requirements}</div>
                </section>
              )}

              {job.skills && (job.skills as string[]).length > 0 && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">المهارات المطلوبة</h2>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills as string[]).map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                  </div>
                </section>
              )}

              {job.benefits && (job.benefits as string[]).length > 0 && (
                <section>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">المزايا</h2>
                  <div className="flex flex-wrap gap-2">
                    {(job.benefits as string[]).map((b, i) => <Badge key={i} variant="outline">{b}</Badge>)}
                  </div>
                </section>
              )}

              <div className="flex items-center gap-3 border-t pt-4">
                <ShareButtons title={job.title} url={canonicalUrl} />
                <ReportDialog entityId={job.id} />
              </div>

              {/* Application */}
              <div className="pt-4" id="apply">
                {job.application_method === "internal_form" ? (
                  <Button asChild size="lg" className="w-full gap-2 rounded-[10px] h-12">
                    <Link to={`/jobs/${job.slug_unique || job.id}/apply`}>
                      قدّم الآن
                    </Link>
                  </Button>
                ) : job.application_method === "external_url" && job.application_url ? (
                  <Button asChild size="lg" className="w-full gap-2 rounded-[10px] h-12">
                    <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />تقديم عبر الموقع الخارجي
                    </a>
                  </Button>
                ) : job.application_method === "email" && job.application_email ? (
                  <Button asChild size="lg" className="w-full gap-2 rounded-[10px] h-12">
                    <a href={`mailto:${job.application_email}?subject=${encodeURIComponent(`تقديم على: ${job.title}`)}`}>
                      <Mail className="h-4 w-4" />تقديم عبر البريد الإلكتروني
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Sticky CTA */}
              <div className="sticky top-20">
                <Button size="lg" className="w-full gap-2 rounded-[10px] h-12 mb-5" asChild>
                <Link to={`/jobs/${job.slug_unique || job.id}/apply`}>
                  قدّم الآن
                </Link>
                </Button>

                {/* Org card */}
                <div className="rounded-xl border bg-card p-5 space-y-3 mb-5">
                  <h3 className="font-display text-sm font-bold text-foreground">عن الجمعية</h3>
                  <div className="flex items-center gap-3">
                    {org?.logo_url ? (
                      <img src={org.logo_url} alt={org.name_ar} className="h-10 w-10 rounded-lg border object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{org?.name_ar}</p>
                      {org?.city && <p className="text-xs text-muted-foreground">{org.city}</p>}
                    </div>
                  </div>
                  {org?.short_description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{org.short_description}</p>
                  )}
                  <div className="flex gap-2">
                    {org?.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Globe className="h-3.5 w-3.5" />الموقع
                      </a>
                    )}
                    {org?.slug && (
                      <a href={`/ngos/${org.slug}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Building2 className="h-3.5 w-3.5" />ملف الجمعية
                      </a>
                    )}
                  </div>
                </div>

                {/* Job info card */}
                <div className="rounded-xl border bg-card p-5 space-y-3 mb-5">
                  <h3 className="font-display text-sm font-bold text-foreground">معلومات الوظيفة</h3>
                  <div className="space-y-2.5 text-sm text-muted-foreground">
                    {job.vacancies && job.vacancies > 1 && (
                      <div className="flex items-center gap-2"><Users className="h-4 w-4" />{job.vacancies} شاغر</div>
                    )}
                    {job.education && (
                      <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />{job.education}</div>
                    )}
                    {job.published_at && (
                      <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />نُشرت: {new Date(job.published_at).toLocaleDateString("ar-SA")}</div>
                    )}
                  </div>
                </div>

                <SimilarJobs jobId={job.id} categoryId={job.category_id} city={job.city} />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetails;
