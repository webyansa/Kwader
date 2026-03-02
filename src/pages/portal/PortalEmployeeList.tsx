import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Search, Filter, LinkIcon, Unlink, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationEmployees, EmployeeStatus } from "@/hooks/useOrganizationEmployees";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./PortalHRDashboard";

const employmentTypeLabels: Record<string, string> = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  intern: "متدرب",
  volunteer: "متطوع",
};

const PortalEmployeeList = () => {
  const { employees, isLoading } = useOrganizationEmployees();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[];

  const filtered = employees.filter((emp) => {
    const matchSearch = !search || emp.full_name.includes(search) || emp.job_title.includes(search) || emp.email?.includes(search);
    const matchStatus = statusFilter === "all" || emp.status === statusFilter;
    const matchDept = deptFilter === "all" || emp.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">الموظفون</h1>
            <p className="text-sm text-muted-foreground">{employees.length} موظف</p>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link to="/portal/hr/employees/new">
            <UserPlus className="h-4 w-4" />
            إضافة موظف
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو المسمى أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="invited">مدعو</SelectItem>
            <SelectItem value="pending_acceptance">بانتظار القبول</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
            <SelectItem value="terminated">منتهي</SelectItem>
          </SelectContent>
        </Select>
        {departments.length > 0 && (
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأقسام</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              {employees.length === 0 ? "ابدأ بإضافة أول موظف للجمعية" : "لا توجد نتائج"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {employees.length === 0 ? "أضف موظفيك واربطهم بحساباتهم في كوادر" : "جرب تغيير معايير البحث"}
            </p>
            {employees.length === 0 && (
              <Button asChild className="mt-4 gap-2">
                <Link to="/portal/hr/employees/new">
                  <UserPlus className="h-4 w-4" />
                  إضافة موظف
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((emp) => (
            <Link key={emp.id} to={`/portal/hr/employees/${emp.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:border-primary/20 group">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {emp.talent_avatar ? (
                      <img src={emp.talent_avatar} className="h-11 w-11 rounded-full object-cover" alt="" />
                    ) : (
                      <span className="text-sm font-bold text-primary">{emp.full_name.slice(0, 2)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm truncate">{emp.full_name}</p>
                      {emp.talent_username && (
                        <span className="text-xs text-primary/70">@{emp.talent_username}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">{emp.job_title}</p>
                      {emp.department && (
                        <>
                          <span className="text-xs text-border">•</span>
                          <p className="text-xs text-muted-foreground">{emp.department}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Type Badge */}
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground">
                    {employmentTypeLabels[emp.employment_type] || emp.employment_type}
                  </span>

                  {/* Linked badge */}
                  {emp.user_id ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
                      <LinkIcon className="h-3 w-3" />
                      مرتبط
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-destructive/10 text-destructive">
                      <Unlink className="h-3 w-3" />
                      غير مرتبط
                    </span>
                  )}

                  <StatusBadge status={emp.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalEmployeeList;
