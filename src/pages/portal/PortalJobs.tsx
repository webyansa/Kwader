import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PortalJobs = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-7 w-7 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">الوظائف</h1>
        </div>
        <Button asChild>
          <Link to="/portal/jobs/new"><Plus className="ml-2 h-4 w-4" />نشر وظيفة جديدة</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">لا توجد وظائف بعد</h3>
          <p className="text-sm text-muted-foreground mt-1">ابدأ بنشر أول وظيفة للوصول إلى الكوادر المؤهلة</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalJobs;
