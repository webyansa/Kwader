import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, FileCheck, Clock, TrendingUp, Users, Eye, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [jobs, orgs, pending, published, pendingOrgs, applications] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("organizations").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalJobs: jobs.count ?? 0,
        totalOrgs: orgs.count ?? 0,
        pendingJobs: pending.count ?? 0,
        publishedJobs: published.count ?? 0,
        pendingOrgs: pendingOrgs.count ?? 0,
        totalApplications: applications.count ?? 0,
      };
    },
  });

  const { data: recentJobs } = useQuery({
    queryKey: ["admin-recent-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, title, status, created_at, organizations(name_ar)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentOrgs } = useQuery({
    queryKey: ["admin-recent-orgs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("id, name_ar, status, created_at, city")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const statusLabels: Record<string, string> = {
    draft: "مسودة", submitted: "مقدمة", under_review: "قيد المراجعة",
    approved: "معتمدة", rejected: "مرفوضة", published: "منشورة",
    expired: "منتهية", archived: "مؤرشفة", suspended: "موقوفة",
    pending: "قيد المراجعة", active: "مفعّلة",
  };

  const statCards = [
    { label: "إجمالي الوظائف", value: stats?.totalJobs, icon: Briefcase, gradient: "from-primary/10 to-primary/5", iconColor: "text-primary", border: "border-primary/20" },
    { label: "وظائف منشورة", value: stats?.publishedJobs, icon: FileCheck, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600", border: "border-emerald-500/20" },
    { label: "بانتظار المراجعة", value: stats?.pendingJobs, icon: Clock, gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-600", border: "border-amber-500/20" },
    { label: "إجمالي الجمعيات", value: stats?.totalOrgs, icon: Building2, gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-600", border: "border-blue-500/20" },
    { label: "جمعيات معلّقة", value: stats?.pendingOrgs, icon: AlertTriangle, gradient: "from-orange-500/10 to-orange-500/5", iconColor: "text-orange-600", border: "border-orange-500/20" },
    { label: "إجمالي الطلبات", value: stats?.totalApplications, icon: Users, gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-600", border: "border-violet-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">نظرة عامة</h2>
        <p className="text-sm text-muted-foreground mt-0.5">ملخص سريع لحالة المنصة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {statCards.map((c) => (
          <Card key={c.label} className={`relative overflow-hidden border ${c.border}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
            <div className="relative p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : (c.value ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
                </div>
                <div className={`rounded-xl p-2.5 bg-card/80 shadow-sm ${c.iconColor}`}>
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Jobs */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-3 border-b">
            <h3 className="text-sm font-bold text-foreground">آخر الوظائف</h3>
            <Link to="/admin/jobs">
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7">عرض الكل</Button>
            </Link>
          </div>
          <div className="divide-y">
            {recentJobs?.map((job) => (
              <div key={job.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{(job.organizations as any)?.name_ar}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0 mr-3">
                  {statusLabels[job.status] || job.status}
                </Badge>
              </div>
            )) ?? (
              <div className="p-6 text-center text-sm text-muted-foreground">لا توجد وظائف</div>
            )}
          </div>
        </Card>

        {/* Recent Organizations */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-3 border-b">
            <h3 className="text-sm font-bold text-foreground">آخر الجمعيات</h3>
            <Link to="/admin/organizations">
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7">عرض الكل</Button>
            </Link>
          </div>
          <div className="divide-y">
            {recentOrgs?.map((org) => (
              <div key={org.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{org.name_ar}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{org.city || "—"}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] shrink-0 mr-3 ${
                    org.status === "active" ? "bg-emerald-100 text-emerald-700" :
                    org.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}
                >
                  {statusLabels[org.status] || org.status}
                </Badge>
              </div>
            )) ?? (
              <div className="p-6 text-center text-sm text-muted-foreground">لا توجد جمعيات</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
