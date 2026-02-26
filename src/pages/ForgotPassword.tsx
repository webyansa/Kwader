import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
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
