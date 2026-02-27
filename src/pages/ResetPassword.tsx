import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
        setChecking(false);
      } else if (event === "SIGNED_IN" && session) {
        // Sometimes recovery comes as SIGNED_IN with recovery token
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace("#", ""));
        if (params.get("type") === "recovery") {
          setIsRecovery(true);
          setChecking(false);
        }
      }
    });

    // Also check the URL hash directly for recovery tokens
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
      setChecking(false);
    }

    // Check URL search params (some flows use query params)
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("type") === "recovery") {
      setIsRecovery(true);
      setChecking(false);
    }

    // Give Supabase time to process the recovery token
    const timeout = setTimeout(() => {
      setChecking(false);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "كلمة المرور قصيرة", description: "يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "كلمات المرور غير متطابقة", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      navigate("/login");
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">جارٍ التحقق من الرابط...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">رابط غير صالح أو منتهي الصلاحية.</p>
            <Button variant="outline" onClick={() => navigate("/forgot-password")}>
              طلب رابط استعادة جديد
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
          </div>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
