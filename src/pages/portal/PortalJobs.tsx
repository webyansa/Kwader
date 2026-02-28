import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PortalJobs = () => {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">الوظائف</h1>
          <p className="text-sm text-muted-foreground mt-0.5">أنشئ وأدر إعلانات التوظيف الخاصة بجمعيتك</p>
        </div>
        <Button className="gap-1.5" asChild>
          <Link to="/portal/jobs/new"><Plus className="h-4 w-4" /> نشر وظيفة جديدة</Link>
        </Button>
      </div>
      <Card className="border-border shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">لا توجد وظائف بعد</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">ابدأ بنشر أول وظيفة للوصول إلى الكوادر المؤهلة</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PortalJobs;
