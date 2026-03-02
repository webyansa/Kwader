import { Link } from "react-router-dom";
import { ShieldX, Home, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRedirectPath } from "@/lib/roles";

const Forbidden = () => {
  const { user, roles, loading } = useAuth();
  const dashboardPath = roles.length > 0 ? getRedirectPath(roles) : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card/70 p-8 text-center shadow-sm backdrop-blur-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldX className="h-9 w-9 text-destructive" />
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground">غير مصرح بالوصول</h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted-foreground">
          {loading
            ? "جارٍ التحقق من صلاحياتك الآن..."
            : "ليس لديك صلاحية للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، تواصل مع مدير النظام."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user && !loading ? (
            <Button asChild>
              <Link to={dashboardPath}>
                <LayoutDashboard className="h-4 w-4" />
                الذهاب للوحة الرئيسية
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                تسجيل الدخول
              </Link>
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
