import { Link, useLocation } from "react-router-dom";
import { Compass, Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <Card className="w-full max-w-xl rounded-2xl border shadow-card">
        <CardContent className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <SearchX className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">الصفحة غير موجودة</h1>
            <p className="text-muted-foreground">قد يكون الرابط غير صحيح أو الملف غير متاح حالياً.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild className="rounded-xl gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />العودة للرئيسية
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl gap-2">
              <Link to="/talents">
                <Compass className="h-4 w-4" />تصفح كوادر القطاع
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl gap-2">
              <Link to="/jobs">تصفح الوظائف</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
