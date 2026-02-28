import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getRedirectPath } from "@/lib/roles";
import type { Database } from "@/integrations/supabase/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type AppRole = Database["public"]["Enums"]["app_role"];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
      return;
    }

    // Check suspension status
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", data.user.id)
      .single();

    if (profile?.status === "suspended") {
      await supabase.auth.signOut();
      setLoading(false);
      toast({
        title: "الحساب موقوف",
        description: "تم تعليق حسابك. تواصل مع الإدارة لمزيد من المعلومات.",
        variant: "destructive",
      });
      return;
    }

    // Get roles for redirect
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    setLoading(false);
    const userRoles = (roles?.map((r) => r.role) ?? []) as AppRole[];
    navigate(getRedirectPath(userRoles));
  };

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">تسجيل الدخول</h1>
            <p className="mt-2 text-sm text-muted-foreground">أدخل بريدك الإلكتروني وكلمة المرور</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@org.sa" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">نسيت كلمة المرور؟</Link>
            <Link to="/register" className="text-primary hover:underline">تسجيل حساب جديد</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
