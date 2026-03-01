import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";

const CvDownloadProxy = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const fallbackProfileUrl = useMemo(() => (username ? `/talent/${username}` : "/talents"), [username]);

  useEffect(() => {
    const run = async () => {
      if (!username) {
        setErrorMessage("اسم المستخدم غير صالح.");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-cv-download/${encodeURIComponent(username)}`,
          {
            method: "GET",
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          setErrorMessage(payload?.error || "تعذر تنزيل السيرة الذاتية.");
          return;
        }

        const payload = await response.json();
        if (!payload?.url) {
          setErrorMessage("لا يوجد ملف سيرة متاح للتنزيل.");
          return;
        }

        window.location.href = payload.url;
      } catch {
        setErrorMessage("حدث خطأ غير متوقع أثناء تنزيل السيرة.");
      }
    };

    run();
  }, [username]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md rounded-2xl border shadow-card">
        <CardContent className="space-y-4 p-6 text-center">
          {errorMessage ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-7 w-7 text-destructive" />
              </div>
              <h1 className="text-lg font-bold text-foreground">تعذر تنزيل السيرة</h1>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="rounded-xl">
                  <Link to={fallbackProfileUrl}>العودة للملف المهني</Link>
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => navigate("/talents")}>تصفح كوادر القطاع</Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground">جارٍ تجهيز الملف للتنزيل</h1>
              <p className="text-sm text-muted-foreground">يرجى الانتظار لحظات…</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CvDownloadProxy;
