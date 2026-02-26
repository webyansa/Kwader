import { useState } from "react";
import { useJobs, defaultFilters, JobFiltersState } from "@/hooks/useJobs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import { Briefcase, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Jobs = () => {
  const [filters, setFilters] = useState<JobFiltersState>(defaultFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { data: jobs, isLoading } = useJobs(filters);

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex-1">
        <div className="border-b bg-muted/30 py-8">
          <div className="container">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              تصفح الوظائف
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {jobs ? `${jobs.length} وظيفة متاحة` : "جارٍ التحميل..."}
            </p>
          </div>
        </div>

        <div className="container py-6">
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="mb-4 gap-2 lg:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showMobileFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
          </Button>

          <div className="flex gap-6">
            {/* Sidebar filters */}
            <aside className={`${showMobileFilters ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-64`}>
              <div className="sticky top-20 rounded-xl border bg-card p-5">
                <h2 className="mb-4 font-display text-sm font-bold text-foreground">تصفية النتائج</h2>
                <JobFilters filters={filters} onChange={setFilters} />
              </div>
            </aside>

            {/* Job list */}
            <div className="flex-1 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/50" />
                  ))}
                </div>
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
                  <Briefcase className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-lg font-medium text-muted-foreground">لا توجد وظائف مطابقة</p>
                  <p className="mt-1 text-sm text-muted-foreground">جرّب تغيير معايير البحث</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;
