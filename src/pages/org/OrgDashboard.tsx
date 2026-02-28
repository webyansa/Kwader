import { useAuth } from "@/hooks/useAuth";
import { Building2, Briefcase, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const OrgDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "الوظائف المنشورة", value: "0", icon: Briefcase, color: "text-primary" },
    { label: "الطلبات الواردة", value: "0", icon: Users, color: "text-accent" },
    { label: "المشاهدات", value: "0", icon: BarChart3, color: "text-success" },
  ];

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex-1 container py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">لوحة تحكم الجمعية</h1>
            <p className="text-sm text-muted-foreground">مرحباً بك في لوحة إدارة جمعيتك</p>
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
            <p className="text-sm text-muted-foreground mt-1">أضف وظائف جمعيتك للوصول إلى أفضل الكفاءات</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrgDashboard;
