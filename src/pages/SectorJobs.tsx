import { useState, useMemo } from "react";
import { useJobs, defaultFilters, JobFiltersState, useCategories } from "@/hooks/useJobs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobCard from "@/components/jobs/JobCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, MapPin, Flame, Star, Wifi, Heart, GraduationCap, SlidersHorizontal, X } from "lucide-react";
import { Helmet } from "react-helmet-async";

type Tab = "all" | "urgent" | "featured" | "remote" | "volunteer" | "intern";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "الكل", icon: <Briefcase className="h-3.5 w-3.5" /> },
  { key: "urgent", label: "عاجلة", icon: <Flame className="h-3.5 w-3.5" /> },
  { key: "featured", label: "مميزة", icon: <Star className="h-3.5 w-3.5" /> },
  { key: "remote", label: "عن بُعد", icon: <Wifi className="h-3.5 w-3.5" /> },
  { key: "volunteer", label: "فرص تطوع", icon: <Heart className="h-3.5 w-3.5" /> },
  { key: "intern", label: "تدريب", icon: <GraduationCap className="h-3.5 w-3.5" /> },
];

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "closing", label: "الأقرب للإغلاق" },
];

const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك", "حائل", "جازان", "نجران", "الطائف", "بريدة", "ينبع"];

const SectorJobs = () => {
  const [searchText, setSearchText] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Build filters based on tab + sidebar
  const [sideFilters, setSideFilters] = useState<Partial<JobFiltersState>>({});

  const filters: JobFiltersState = useMemo(() => ({
    ...defaultFilters,
    search: searchText,
    city: searchCity || sideFilters.city || "",
    categoryId: sideFilters.categoryId || "",
    employmentType: activeTab === "volunteer" ? "volunteer" : activeTab === "intern" ? "intern" : sideFilters.employmentType || "",
    remoteType: activeTab === "remote" ? "remote" : sideFilters.remoteType || "",
    experienceLevel: sideFilters.experienceLevel || "",
    urgentOnly: activeTab === "urgent",
    featuredOnly: activeTab === "featured",
  }), [searchText, searchCity, activeTab, sideFilters]);

  const { data: jobs, isLoading } = useJobs(filters);
  const { data: categories } = useCategories();

  const sortedJobs = useMemo(() => {
    if (!jobs) return [];
    const arr = [...jobs];
    if (sortBy === "closing") {
      arr.sort((a, b) => {
        if (!a.closing_date) return 1;
        if (!b.closing_date) return -1;
        return new Date(a.closing_date).getTime() - new Date(b.closing_date).getTime();
      });
    }
    return arr;
  }, [jobs, sortBy]);

  const [page, setPage] = useState(1);
  const perPage = 12;
  const totalPages = Math.ceil(sortedJobs.length / perPage);
  const pagedJobs = sortedJobs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Helmet>
        <title>وظائف القطاع غير الربحي | كوادر</title>
        <meta name="description" content="تصفّح أحدث الفرص الوظيفية في القطاع غير الربحي السعودي. وظائف حضورية وعن بُعد، فرص تطوع وتدريب." />
      </Helmet>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background py-14 md:py-20">
          <div className="container relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                وظائف القطاع غير الربحي
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                اكتشف فرصاً مهنية مميزة في الجمعيات والمؤسسات غير الربحية بالمملكة
              </p>

              {/* Search bar */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث بالمسمى الوظيفي أو الكلمات..."
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                    className="h-12 rounded-xl pr-10 text-sm"
                  />
                </div>
                <div className="relative sm:w-48">
                  <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="المدينة"
                    value={searchCity}
                    onChange={(e) => { setSearchCity(e.target.value); setPage(1); }}
                    className="h-12 rounded-xl pr-10 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b bg-card/50">
          <div className="container">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "جارٍ التحميل..." : `${sortedJobs.length} وظيفة`}
            </p>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-40 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
                فلاتر
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar filters */}
            <aside className={`${showFilters ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-60`}>
              <div className="sticky top-20 space-y-5 rounded-xl border bg-card p-5">
                <h3 className="font-display text-sm font-bold text-foreground">تصفية النتائج</h3>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">المدينة</label>
                  <Select value={sideFilters.city || ""} onValueChange={(v) => { setSideFilters(p => ({ ...p, city: v === "all" ? "" : v })); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">نمط العمل</label>
                  <Select value={sideFilters.remoteType || ""} onValueChange={(v) => { setSideFilters(p => ({ ...p, remoteType: v === "all" ? "" : v })); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="onsite">حضوري</SelectItem>
                      <SelectItem value="remote">عن بُعد</SelectItem>
                      <SelectItem value="hybrid">هجين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">نوع الدوام</label>
                  <Select value={sideFilters.employmentType || ""} onValueChange={(v) => { setSideFilters(p => ({ ...p, employmentType: v === "all" ? "" : v })); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="full_time">دوام كامل</SelectItem>
                      <SelectItem value="part_time">دوام جزئي</SelectItem>
                      <SelectItem value="contract">عقد</SelectItem>
                      <SelectItem value="consultant">استشاري</SelectItem>
                      <SelectItem value="volunteer">تطوعي</SelectItem>
                      <SelectItem value="intern">تدريب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">المستوى الوظيفي</label>
                  <Select value={sideFilters.experienceLevel || ""} onValueChange={(v) => { setSideFilters(p => ({ ...p, experienceLevel: v === "all" ? "" : v })); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="junior">مبتدئ</SelectItem>
                      <SelectItem value="mid">متوسط</SelectItem>
                      <SelectItem value="senior">خبير</SelectItem>
                      <SelectItem value="leadership">قيادي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {categories && categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">المجال</label>
                    <Select value={sideFilters.categoryId || ""} onValueChange={(v) => { setSideFilters(p => ({ ...p, categoryId: v === "all" ? "" : v })); setPage(1); }}>
                      <SelectTrigger className="h-9 rounded-lg text-xs">
                        <SelectValue placeholder="الكل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_ar}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => { setSideFilters({}); setPage(1); }}
                >
                  مسح الفلاتر
                </Button>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/50" />
                  ))}
                </div>
              ) : pagedJobs.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {pagedJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-lg"
                      >
                        السابق
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {page} من {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-lg"
                      >
                        التالي
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
                  <Briefcase className="mb-4 h-14 w-14 text-muted-foreground/30" />
                  <p className="text-lg font-display font-bold text-foreground">لا توجد وظائف مطابقة</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">جرّب تغيير معايير البحث أو الفلاتر</p>
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

export default SectorJobs;
