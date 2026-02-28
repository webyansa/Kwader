import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PortalApplications = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-7 w-7 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">الطلبات الواردة</h1>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">لا توجد طلبات بعد</h3>
          <p className="text-sm text-muted-foreground mt-1">ستظهر هنا طلبات التقديم على وظائفك</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalApplications;
