import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isPlatformStaff, isOrganization, isJobSeeker } from "@/lib/roles";
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

    // Check suspension
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", data.user.id)
      .single();

    if (profile?.status === "suspended") {
      await supabase.auth.signOut();
      setLoading(false);
      toast({ title: "الحساب موقوف", description: "تم تعليق حسابك. تواصل مع الإدارة.", variant: "destructive" });
      return;
    }

    // Get roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role, org_id")
      .eq("user_id", data.user.id);

    const userRoles = (rolesData?.map((r) => r.role) ?? []) as AppRole[];
    const orgRole = rolesData?.find((r) => r.org_id);

    setLoading(false);

    // Platform staff
    if (isPlatformStaff(userRoles)) {
      navigate("/admin");
      return;
    }

    // Organization - check subscription status
    if (isOrganization(userRoles) && orgRole?.org_id) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("org_id", orgRole.org_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (sub?.status === "active") {
        navigate("/portal/dashboard");
      } else {
        navigate("/portal/pending");
      }
      return;
    }

    // Talent (job seeker) - check profile completion
    if (isJobSeeker(userRoles)) {
      const { data: talentProfile } = await supabase
        .from("job_seeker_profiles")
        .select("profile_completion_percentage")
        .eq("user_id", data.user.id)
        .single();

      const completion = (talentProfile as any)?.profile_completion_percentage ?? 0;
      if (completion < 50) {
        navigate("/talents/profile");
      } else {
        navigate("/talents/dashboard");
      }
      return;
    }

    // Default
    navigate("/");
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
