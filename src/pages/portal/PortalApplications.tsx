import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const PortalApplications = () => {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">الطلبات الواردة</h1>
        <p className="text-sm text-muted-foreground mt-0.5">تابع طلبات التقديم على وظائفك</p>
      </div>
      <Card className="border-border shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-5">
            <FileText className="h-7 w-7 text-accent" />
          </div>
          <h3 className="text-lg font-bold text-foreground">لا توجد طلبات بعد</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">ستظهر هنا طلبات التقديم على وظائفك فور ورودها</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PortalApplications;
