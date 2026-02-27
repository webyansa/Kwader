import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const RESET_PASSWORD_REDIRECT_URL = "https://impact-careers.lovable.app/reset-password";
const RESEND_COOLDOWN_SECONDS = 60;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendResetLink = async (targetEmail: string) => {
    return supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: RESET_PASSWORD_REDIRECT_URL,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    setLoading(true);
    const { error } = await sendResetLink(normalizedEmail);
    setLoading(false);

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }

    setSent(true);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleResend = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    const { error } = await sendResetLink(normalizedEmail);
    setResendLoading(false);

    if (error) {
      toast({ title: "تعذر إعادة الإرسال", description: error.message, variant: "destructive" });
      return;
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    toast({ title: "تمت إعادة إرسال رابط الاستعادة" });
  };

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">استعادة كلمة المرور</h1>
            <p className="mt-2 text-sm text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة</p>
          </div>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-success font-medium">تم إرسال رابط الاستعادة إلى بريدك الإلكتروني</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                className="w-full"
              >
                {resendLoading
                  ? "جارٍ إعادة الإرسال..."
                  : resendCooldown > 0
                    ? `إعادة الإرسال خلال ${resendCooldown} ثانية`
                    : "إعادة إرسال الرابط"}
              </Button>
              <Link to="/login"><Button variant="outline">العودة لتسجيل الدخول</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
              </Button>
              <Link to="/login" className="block text-center text-sm text-primary hover:underline">العودة لتسجيل الدخول</Link>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
