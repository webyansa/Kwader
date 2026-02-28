import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PortalNewJob = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/portal/jobs"><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">نشر وظيفة جديدة</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الوظيفة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">نموذج إضافة الوظيفة قيد التطوير</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalNewJob;
