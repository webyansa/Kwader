import { useAuth } from "@/hooks/useAuth";
import { User, FileText, Bookmark, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TalentsDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">لوحة الكوادر</h1>
          <p className="text-sm text-muted-foreground">تابع طلباتك واكتشف فرص جديدة</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">طلباتي</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المحفوظات</CardTitle>
            <Bookmark className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">وظائف جديدة</CardTitle>
            <Search className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">تصفح</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">ابحث عن وظيفتك المثالية</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">تصفح الوظائف المتاحة في القطاع غير الربحي</p>
          <Button asChild>
            <Link to="/jobs">تصفح الوظائف</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentsDashboard;
