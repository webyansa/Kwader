import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import JobCard from "./JobCard";

interface SimilarJobsProps {
  jobId: string;
  categoryId: string | null;
  city: string | null;
}

const SimilarJobs = ({ jobId, categoryId, city }: SimilarJobsProps) => {
  const { data: jobs } = useQuery({
    queryKey: ["similar-jobs", jobId, categoryId, city],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, slug), categories!jobs_category_id_fkey(name_ar, slug)")
        .eq("status", "published")
        .neq("id", jobId)
        .limit(4)
        .order("published_at", { ascending: false });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      const { data } = await query;
      return data || [];
    },
  });

  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-bold text-foreground">وظائف مشابهة</h3>
      <div className="space-y-3">
        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  );
};

export default SimilarJobs;
