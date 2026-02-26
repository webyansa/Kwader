import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Briefcase, Building2, FileCheck, Clock } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [jobs, orgs, pending, published] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "submitted"),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
      ]);
      return {
        totalJobs: jobs.count ?? 0,
        totalOrgs: orgs.count ?? 0,
        pendingJobs: pending.count ?? 0,
        publishedJobs: published.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "إجمالي الوظائف", value: stats?.totalJobs ?? "—", icon: Briefcase, color: "text-primary" },
    { label: "وظائف منشورة", value: stats?.publishedJobs ?? "—", icon: FileCheck, color: "text-success" },
    { label: "بانتظار المراجعة", value: stats?.pendingJobs ?? "—", icon: Clock, color: "text-accent" },
    { label: "الجمعيات", value: stats?.totalOrgs ?? "—", icon: Building2, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">نظرة عامة</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-muted p-2.5 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
