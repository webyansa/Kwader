import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Mail, Phone, Briefcase, ArrowRight } from "lucide-react";

interface NGOData {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string | null;
  logo_url: string | null;
  city: string | null;
  region: string | null;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
}

interface JobData {
  id: string;
  title: string;
  city: string | null;
  employment_type: string;
  created_at: string;
}

const NGOProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [ngo, setNgo] = useState<NGOData | null>(null);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNGO = async () => {
      if (!slug) return;
      setLoading(true);

      // Try slug first, then id
      const baseQuery = supabase
        .from("organizations")
        .select("*") as any;
      
      let { data } = await baseQuery
        .eq("slug", slug)
        .eq("status", "active")
        .eq("profile_status", "approved")
        .maybeSingle();

      if (!data) {
        const res = await baseQuery
          .eq("id", slug)
          .eq("status", "active")
          .eq("profile_status", "approved")
          .maybeSingle();
        data = res.data;
      }

      if (data) {
        setNgo(data);
        // Fetch published jobs
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("id, title, city, employment_type, created_at")
          .eq("org_id", data.id)
          .eq("status", "published")
          .order("created_at", { ascending: false });
        setJobs(jobsData || []);
      }
      setLoading(false);
    };
    fetchNGO();
  }, [slug]);

  const employmentLabels: Record<string, string> = {
    full_time: "دوام كامل",
    part_time: "دوام جزئي",
    contract: "عقد",
    intern: "تدريب",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="mx-auto h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">الجمعية غير موجودة</h1>
          <p className="mt-2 text-muted-foreground">تأكد من الرابط أو عد لدليل الجمعيات</p>
          <Button className="mt-6" asChild>
            <Link to="/ngos">العودة للدليل</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b bg-card py-12">
        <div className="container">
          <Link to="/ngos" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowRight className="h-4 w-4" />
            العودة لدليل الجمعيات
          </Link>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border bg-muted text-3xl font-bold text-primary">
              {ngo.logo_url ? (
                <img src={ngo.logo_url} alt={ngo.name_ar} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                ngo.name_ar.charAt(0)
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-black">{ngo.name_ar}</h1>
              {ngo.name_en && <p className="mt-1 text-sm text-muted-foreground">{ngo.name_en}</p>}
              <div className="mt-3 flex flex-wrap gap-3">
                {ngo.city && (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {ngo.city}{ngo.region ? ` - ${ngo.region}` : ""}
                  </span>
                )}
                {ngo.website && (
                  <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Globe className="h-4 w-4" /> الموقع الإلكتروني
                  </a>
                )}
                {ngo.email && (
                  <a href={`mailto:${ngo.email}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                    <Mail className="h-4 w-4" /> {ngo.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          {ngo.description && (
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">{ngo.description}</p>
          )}
        </div>
      </section>

      {/* Jobs */}
      <section className="py-12">
        <div className="container">
          <h2 className="mb-6 font-display text-xl font-bold">
            <Briefcase className="mb-1 ml-2 inline-block h-5 w-5 text-primary" />
            الوظائف المفتوحة ({jobs.length})
          </h2>

          {jobs.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="text-muted-foreground">لا توجد وظائف مفتوحة حالياً لهذه الجمعية</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/jobs">تصفح جميع الوظائف</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/30"
                >
                  <div>
                    <h3 className="font-display font-bold group-hover:text-primary">{job.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {job.city && <span>{job.city}</span>}
                      <Badge variant="secondary" className="text-[10px]">
                        {employmentLabels[job.employment_type] || job.employment_type}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-primary">التفاصيل ←</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NGOProfile;
