import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Search, LinkIcon, Unlink, Trash2, CheckSquare, Square, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrganizationEmployees } from "@/hooks/useOrganizationEmployees";
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
  const { employees, isLoading, bulkDeleteEmployees } = useOrganizationEmployees();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[];

  const filtered = employees.filter((emp) => {
    const matchSearch = !search || emp.full_name.includes(search) || emp.job_title.includes(search) || emp.email?.includes(search);
    const matchStatus = statusFilter === "all" || emp.status === statusFilter;
    const matchDept = deptFilter === "all" || emp.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const isSelecting = selectedIds.size > 0;
  const allSelected = filtered.length > 0 && filtered.every((e) => selectedIds.has(e.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    await bulkDeleteEmployees.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowDeleteDialog(false);
  };

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

      {/* Selection Bar */}
      {isSelecting && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-foreground">تم تحديد {selectedIds.size} موظف</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSelectedIds(new Set())}>
            <XCircle className="h-3.5 w-3.5" /> إلغاء التحديد
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-3.5 w-3.5" /> حذف المحدد
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو المسمى أو البريد..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
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
          {/* Select All */}
          <div className="flex items-center gap-2 px-4 py-2">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
            <span className="text-xs text-muted-foreground">تحديد الكل</span>
          </div>

          {filtered.map((emp) => (
            <div key={emp.id} className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.has(emp.id)}
                onCheckedChange={() => toggleSelect(emp.id)}
                className="shrink-0 mr-1"
              />
              <Link to={`/portal/hr/employees/${emp.id}`} className="flex-1">
                <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:border-primary/20 group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {emp.talent_avatar ? (
                        <img src={emp.talent_avatar} className="h-11 w-11 rounded-full object-cover" alt="" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{emp.full_name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm truncate">{emp.full_name}</p>
                        {emp.talent_username && <span className="text-xs text-primary/70">@{emp.talent_username}</span>}
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
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground">
                      {employmentTypeLabels[emp.employment_type] || emp.employment_type}
                    </span>
                    {emp.user_id ? (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
                        <LinkIcon className="h-3 w-3" /> مرتبط
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-destructive/10 text-destructive">
                        <Unlink className="h-3 w-3" /> غير مرتبط
                      </span>
                    )}
                    <StatusBadge status={emp.status} />
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {selectedIds.size} موظف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الموظفين المحددين؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={bulkDeleteEmployees.isPending}>
              {bulkDeleteEmployees.isPending ? "جاري الحذف..." : "حذف نهائي"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PortalEmployeeList;
