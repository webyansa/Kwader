import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, Building2, User } from "lucide-react";

type AccountType = "org" | "seeker";

const Register = () => {
  const [step, setStep] = useState<"choose" | "form" | "verify">("choose");
  const [accountType, setAccountType] = useState<AccountType>("org");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [city, setCity] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) return;
    if (accountType === "org" && !orgName.trim()) return;
    if (password.length < 6) {
      toast({ title: "كلمة المرور قصيرة", description: "يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.user) {
      if (accountType === "org") {
        // Create organization via RPC (assigns org_owner role)
        const { error: orgError } = await supabase.rpc("register_organization", {
          _name_ar: orgName.trim(),
          _city: city.trim() || null,
          _email: orgEmail.trim() || null,
          _phone: orgPhone.trim() || null,
          _license_number: licenseNumber.trim() || null,
        });
        if (orgError) console.error("Org registration error:", orgError);
      } else {
        // Assign job_seeker role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role: "job_seeker" as any });
        if (roleError) console.error("Role assignment error:", roleError);
      }
    }

    setLoading(false);
    setStep("verify");
  };

  if (step === "verify") {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
            <CheckCircle className="mx-auto h-16 w-16 text-success" />
            <h1 className="font-display text-2xl font-bold text-foreground">تحقق من بريدك الإلكتروني</h1>
            <p className="text-muted-foreground">
              أرسلنا رسالة تأكيد إلى <strong>{email}</strong>. يرجى الضغط على الرابط لتفعيل حسابك.
            </p>
            {accountType === "org" && (
              <p className="text-sm text-muted-foreground">
                سيتم مراجعة طلب تسجيل جمعيتك من قبل فريق الإدارة.
              </p>
            )}
            <Link to="/login">
              <Button variant="outline" className="mt-4">العودة لتسجيل الدخول</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg space-y-6 rounded-xl border bg-card p-8 shadow-sm">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
              <p className="mt-2 text-sm text-muted-foreground">اختر نوع الحساب المناسب لك</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => { setAccountType("seeker"); setStep("form"); }}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
              >
                <User className="h-10 w-10 text-primary" />
                <span className="font-display text-lg font-semibold text-foreground">باحث عن وظيفة</span>
                <span className="text-xs text-muted-foreground">تصفح الوظائف وتقدم لها مباشرة</span>
              </button>
              <button
                onClick={() => { setAccountType("org"); setStep("form"); }}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
              >
                <Building2 className="h-10 w-10 text-accent" />
                <span className="font-display text-lg font-semibold text-foreground">جمعية / مؤسسة</span>
                <span className="text-xs text-muted-foreground">انشر وظائف وأدر فريق التوظيف</span>
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
            </p>
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
        <div className="w-full max-w-lg space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {accountType === "org" ? "تسجيل جمعية جديدة" : "تسجيل باحث عن وظيفة"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {accountType === "org" ? "أنشئ حسابك وسجّل بيانات جمعيتك" : "أنشئ حسابك وابدأ البحث عن وظيفة"}
            </p>
            <button onClick={() => setStep("choose")} className="mt-1 text-xs text-primary hover:underline">
              ← تغيير نوع الحساب
            </button>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="font-display text-sm font-semibold text-foreground">البيانات الشخصية</h3>
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل *</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regEmail">البريد الإلكتروني *</Label>
                <Input id="regEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regPassword">كلمة المرور *</Label>
                <Input id="regPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>

            {accountType === "org" && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <h3 className="font-display text-sm font-semibold text-foreground">بيانات الجمعية</h3>
                <div className="space-y-2">
                  <Label htmlFor="orgName">اسم الجمعية بالعربية *</Label>
                  <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} required maxLength={200} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">رقم الترخيص</Label>
                    <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} maxLength={50} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="orgEmail">البريد الإلكتروني</Label>
                    <Input id="orgEmail" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgPhone">رقم الهاتف</Label>
                    <Input id="orgPhone" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} maxLength={20} />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ التسجيل..." : accountType === "org" ? "تسجيل الجمعية" : "إنشاء الحساب"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
