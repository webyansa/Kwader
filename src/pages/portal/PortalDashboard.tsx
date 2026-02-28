import { useAuth } from "@/hooks/useAuth";
import { Building2, Briefcase, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PortalDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "الوظائف المنشورة", value: "0", icon: Briefcase, color: "text-primary" },
    { label: "الطلبات الواردة", value: "0", icon: Users, color: "text-accent" },
    { label: "المشاهدات", value: "0", icon: BarChart3, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">لوحة تحكم الكيان</h1>
          <p className="text-sm text-muted-foreground">مرحباً بك في بوابة إدارة التوظيف</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">ابدأ بنشر أول وظيفة</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">أضف وظائف كيانك للوصول إلى أفضل الكوادر</p>
          <Button asChild>
            <Link to="/portal/jobs/new">نشر وظيفة جديدة</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalDashboard;
