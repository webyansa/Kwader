import { Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PortalPending = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Clock className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">طلبك قيد المراجعة</h1>
          <p className="text-muted-foreground">
            تم استلام طلب تسجيل كيانك بنجاح. يقوم فريق الإدارة حالياً بمراجعة البيانات والتحقق من المعلومات.
          </p>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>ستصلك رسالة عند تفعيل حسابك</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link to="/">العودة للصفحة الرئيسية</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortalPending;
