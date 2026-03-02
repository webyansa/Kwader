import { useParams, Link, useNavigate } from "react-router-dom";
import { User, Briefcase, Building2, Calendar, MapPin, Mail, Phone, Hash, LinkIcon, Unlink, ExternalLink, Edit, ChevronLeft, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationEmployees, EmployeeStatus } from "@/hooks/useOrganizationEmployees";
import { StatusBadge } from "./PortalHRDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const employmentTypeLabels: Record<string, string> = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  intern: "متدرب",
  volunteer: "متطوع",
};

const workModeLabels: Record<string, string> = {
  onsite: "حضوري",
  remote: "عن بعد",
  hybrid: "هجين",
};

const PortalEmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { employees, isLoading, updateEmployee } = useOrganizationEmployees();

  const employee = employees.find((e) => e.id === employeeId);

  const handleStatusChange = async (newStatus: string) => {
    if (!employeeId) return;
    await updateEmployee.mutateAsync({ id: employeeId, status: newStatus as EmployeeStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">لم يتم العثور على الموظف</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/portal/hr/employees")}>
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/portal/hr" className="hover:text-foreground transition-colors">الموارد البشرية</Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <Link to="/portal/hr/employees" className="hover:text-foreground transition-colors">الموظفون</Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{employee.full_name}</span>
      </div>

      {/* Header Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent" />
        <CardContent className="p-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
              <AvatarImage src={employee.talent_avatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {employee.full_name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-xl font-bold text-foreground">{employee.full_name}</h1>
                <StatusBadge status={employee.status} />
                {employee.user_id ? (
                  <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0 gap-1">
                    <LinkIcon className="h-3 w-3" /> مرتبط بكوادر
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive border-destructive/30 gap-1">
                    <Unlink className="h-3 w-3" /> غير مرتبط
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{employee.job_title}</p>
              {employee.department && (
                <p className="text-xs text-muted-foreground mt-0.5">{employee.department}</p>
              )}
              {employee.employee_number && (
                <p className="text-xs text-muted-foreground/70 mt-1">رقم الموظف: {employee.employee_number}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {employee.talent_username && (
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link to={`/talent/${employee.talent_username}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" />
                    ملفه في كوادر
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="details">البيانات</TabsTrigger>
          <TabsTrigger value="job">الوظيفة والتعيين</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-sm text-muted-foreground min-w-[100px]">تغيير الحالة:</Label>
                <Select value={employee.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="terminated">منتهي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard icon={Briefcase} label="المسمى الوظيفي" value={employee.job_title} />
            <InfoCard icon={Building2} label="القسم" value={employee.department || "—"} />
            <InfoCard icon={Calendar} label="تاريخ البداية" value={employee.start_date || "—"} />
            <InfoCard icon={Users} label="المدير المباشر" value={employee.manager_name || "—"} />
          </div>

          {/* Talent Skills */}
          {employee.talent_skills && employee.talent_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المهارات (من ملف كوادر)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.talent_skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> البيانات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow icon={User} label="الاسم الكامل" value={employee.full_name} />
              <Separator />
              <DetailRow icon={Mail} label="البريد الإلكتروني" value={employee.email || "—"} />
              <Separator />
              <DetailRow icon={Phone} label="الجوال" value={employee.phone || "—"} />
              <Separator />
              <DetailRow icon={Hash} label="الهوية/الإقامة" value={employee.national_id_or_iqama || "—"} />
              <Separator />
              <DetailRow icon={Hash} label="رقم الموظف" value={employee.employee_number || "—"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> تفاصيل التوظيف
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow icon={Briefcase} label="المسمى الوظيفي" value={employee.job_title} />
              <Separator />
              <DetailRow icon={Building2} label="القسم" value={employee.department || "—"} />
              <Separator />
              <DetailRow icon={Briefcase} label="نوع التوظيف" value={employmentTypeLabels[employee.employment_type] || employee.employment_type} />
              <Separator />
              <DetailRow icon={MapPin} label="نمط العمل" value={workModeLabels[employee.work_mode] || employee.work_mode} />
              <Separator />
              <DetailRow icon={Calendar} label="تاريخ البداية" value={employee.start_date || "—"} />
              <Separator />
              <DetailRow icon={Users} label="المدير المباشر" value={employee.manager_name || "—"} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
);

const InfoCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Card className="border-0 shadow-sm">
    <CardContent className="p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-1">
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="text-sm text-muted-foreground min-w-[120px]">{label}</span>
    <span className="text-sm text-foreground font-medium">{value}</span>
  </div>
);

export default PortalEmployeeProfile;
