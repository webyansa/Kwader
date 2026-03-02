import { Link } from "react-router-dom";
import { Users, UserPlus, Clock, Unlink, ArrowLeft, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrganizationEmployees } from "@/hooks/useOrganizationEmployees";
import { Skeleton } from "@/components/ui/skeleton";

const PortalHRDashboard = () => {
  const { stats, isLoading, employees } = useOrganizationEmployees();

  const recentEmployees = employees.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">الموارد البشرية</h1>
            <p className="text-sm text-muted-foreground">إدارة موظفي الجمعية</p>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link to="/portal/hr/employees/new">
            <UserPlus className="h-4 w-4" />
            إضافة موظف
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <Card className="border-0 shadow-sm bg-primary/5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الموظفون النشطون</p>
                    <p className="text-3xl font-bold text-primary mt-1">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-[hsl(var(--featured))]/5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">بانتظار القبول</p>
                    <p className="text-3xl font-bold text-[hsl(var(--featured))] mt-1">{stats.pending}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-[hsl(var(--featured))]/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-[hsl(var(--featured))]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-destructive/5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">بدون حساب كوادر</p>
                    <p className="text-3xl font-bold text-destructive mt-1">{stats.unlinked}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Unlink className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-border/60 hover:border-primary/30 transition-colors cursor-pointer group">
          <Link to="/portal/hr/employees/new">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">إضافة موظف</p>
                <p className="text-xs text-muted-foreground">أضف موظف جديد أو اربطه بحساب كوادر</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground mr-auto" />
            </CardContent>
          </Link>
        </Card>
        <Card className="border border-border/60 hover:border-primary/30 transition-colors cursor-pointer group">
          <Link to="/portal/hr/employees">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">عرض الموظفين</p>
                <p className="text-xs text-muted-foreground">قائمة جميع موظفي الجمعية</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground mr-auto" />
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Employees */}
      {recentEmployees.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">آخر الموظفين المضافين</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/portal/hr/employees">عرض الكل</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentEmployees.map((emp) => (
              <Link key={emp.id} to={`/portal/hr/employees/${emp.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {emp.talent_avatar ? (
                        <img src={emp.talent_avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{emp.full_name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{emp.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp.job_title}</p>
                    </div>
                    <StatusBadge status={emp.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const statusLabels: Record<string, { label: string; className: string }> = {
  active: { label: "نشط", className: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
  invited: { label: "مدعو", className: "bg-[hsl(var(--featured))]/10 text-[hsl(var(--featured))]" },
  pending_acceptance: { label: "بانتظار القبول", className: "bg-[hsl(var(--featured))]/10 text-[hsl(var(--featured))]" },
  inactive: { label: "غير نشط", className: "bg-muted text-muted-foreground" },
  terminated: { label: "منتهي", className: "bg-destructive/10 text-destructive" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const s = statusLabels[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>;
};

export default PortalHRDashboard;
