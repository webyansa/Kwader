import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

const Forbidden = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4" dir="rtl">
    <ShieldX className="h-20 w-20 text-destructive" />
    <h1 className="font-display text-3xl font-bold text-foreground">غير مصرح بالوصول</h1>
    <p className="text-muted-foreground text-center max-w-md">
      ليس لديك صلاحية للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، تواصل مع مدير النظام.
    </p>
    <Button asChild>
      <Link to="/">العودة للرئيسية</Link>
    </Button>
  </div>
);

export default Forbidden;
