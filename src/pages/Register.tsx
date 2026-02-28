import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, Building2, User, ArrowRight, ArrowLeft, Briefcase, Star, Zap, Crown } from "lucide-react";

type AccountType = "org" | "seeker";
type OrgStep = 1 | 2 | 3;

interface Plan {
  id: string;
  name_ar: string;
  name_en: string | null;
  price_monthly: number;
  price_yearly: number;
  jobs_per_month: number;
  featured_count: number;
  urgent_count: number;
  seats: number;
}

const STEP_LABELS_ORG = ["بيانات الجمعية", "بيانات مسؤول الحساب", "اختيار الباقة"];

const Register = () => {
  const [step, setStep] = useState<"choose" | "form" | "success">("choose");
  const [accountType, setAccountType] = useState<AccountType>("org");
  const [orgStep, setOrgStep] = useState<OrgStep>(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Seeker fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");

  // Org fields
  const [orgName, setOrgName] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [entityType, setEntityType] = useState("جمعية");

  useEffect(() => {
    if (accountType === "org") {
      supabase.from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
        if (data) setPlans(data as Plan[]);
      });
    }
  }, [accountType]);

  const handleSeekerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) return;
    if (password.length < 6) {
      toast({ title: "كلمة المرور قصيرة", description: "يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() }, emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: rpcError } = await supabase.rpc("register_job_seeker", {
        _full_name: fullName.trim(),
        _city: city.trim() || null,
      });
      if (rpcError) console.error("Job seeker registration error:", rpcError);
    }

    setLoading(false);
    navigate("/jobs");
  };

  const handleOrgRegister = async () => {
    if (!selectedPlanId) {
      toast({ title: "اختر باقة", description: "يجب اختيار باقة اشتراك لإكمال التسجيل", variant: "destructive" });
      return;
    }
    if (!fullName.trim() || !email.trim() || !password || !orgName.trim()) return;
    if (password.length < 6) {
      toast({ title: "كلمة المرور قصيرة", description: "يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() }, emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: orgError } = await supabase.rpc("register_organization", {
        _name_ar: orgName.trim(),
        _plan_id: selectedPlanId,
        _city: orgCity.trim() || null,
        _email: orgEmail.trim() || null,
        _phone: orgPhone.trim() || null,
        _license_number: licenseNumber.trim() || null,
        _website: orgWebsite.trim() || null,
      });
      if (orgError) {
        console.error("Org registration error:", orgError);
        toast({ title: "خطأ في تسجيل الجمعية", description: orgError.message, variant: "destructive" });
      }
    }

    setLoading(false);
    setStep("success");
  };

  const planIcons = [Briefcase, Star, Zap, Crown];

  // ===== SUCCESS SCREEN =====
  if (step === "success") {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">تم استلام طلبك بنجاح!</h1>
            <p className="text-muted-foreground">
              شكرًا لتسجيلك. سيتم مراجعة طلب تسجيل جمعيتك من قبل فريق الإدارة وتفعيل حسابك في أقرب وقت.
            </p>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p>ستصلك رسالة على بريدك الإلكتروني عند تفعيل الحساب.</p>
            </div>
            <Link to="/login">
              <Button variant="outline" className="mt-4 w-full">العودة لتسجيل الدخول</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ===== CHOOSE ACCOUNT TYPE =====
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
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <span className="font-display text-lg font-semibold text-foreground">باحث عن وظيفة</span>
                <span className="text-xs text-muted-foreground">تصفح الوظائف وتقدم لها مباشرة — مجاناً</span>
              </button>
              <button
                onClick={() => { setAccountType("org"); setStep("form"); setOrgStep(1); }}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-accent hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <Building2 className="h-7 w-7 text-accent" />
                </div>
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

  // ===== JOB SEEKER FORM =====
  if (accountType === "seeker") {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg space-y-6 rounded-xl border bg-card p-8 shadow-sm">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">تسجيل باحث عن وظيفة</h1>
              <p className="mt-2 text-sm text-muted-foreground">أنشئ حسابك المجاني وابدأ البحث</p>
              <button onClick={() => setStep("choose")} className="mt-1 text-xs text-primary hover:underline">← تغيير نوع الحساب</button>
            </div>
            <form onSubmit={handleSeekerRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل *</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <p className="text-xs text-muted-foreground">6 أحرف على الأقل</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">المدينة (اختياري)</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جارٍ التسجيل..." : "إنشاء الحساب"}
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
  }

  // ===== ORG MULTI-STEP FORM =====
  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          {/* Stepper */}
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">تسجيل جمعية جديدة</h1>
            <button onClick={() => setStep("choose")} className="mt-1 text-xs text-primary hover:underline">← تغيير نوع الحساب</button>
          </div>

          <div className="flex items-center justify-center gap-2">
            {STEP_LABELS_ORG.map((label, i) => {
              const stepNum = (i + 1) as OrgStep;
              const isActive = orgStep === stepNum;
              const isDone = orgStep > stepNum;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {isDone ? "✓" : stepNum}
                    </div>
                    <span className={`text-[10px] ${isActive || isDone ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                  {i < STEP_LABELS_ORG.length - 1 && <div className={`h-0.5 w-8 mt-[-16px] ${orgStep > stepNum ? "bg-primary" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Org Data */}
          {orgStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">اسم الجهة بالعربية *</Label>
                <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} required maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="orgCity">المدينة / المنطقة</Label>
                  <Input id="orgCity" value={orgCity} onChange={(e) => setOrgCity(e.target.value)} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entityType">نوع الكيان</Label>
                  <select id="entityType" value={entityType} onChange={(e) => setEntityType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>جمعية</option>
                    <option>مؤسسة</option>
                    <option>وقف</option>
                    <option>مبادرة</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">البريد الرسمي</Label>
                  <Input id="orgEmail" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgPhone">رقم الجوال</Label>
                  <Input id="orgPhone" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} maxLength={20} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">رقم الترخيص</Label>
                  <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgWebsite">رابط الموقع</Label>
                  <Input id="orgWebsite" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} maxLength={255} placeholder="https://" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { if (!orgName.trim()) { toast({ title: "اسم الجهة مطلوب", variant: "destructive" }); return; } setOrgStep(2); }}>
                  التالي <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Account Data */}
          {orgStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">اسم مسؤول الحساب *</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <p className="text-xs text-muted-foreground">6 أحرف على الأقل</p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setOrgStep(1)}>
                  <ArrowRight className="ml-2 h-4 w-4" /> السابق
                </Button>
                <Button onClick={() => {
                  if (!fullName.trim() || !email.trim() || !password) { toast({ title: "جميع الحقول مطلوبة", variant: "destructive" }); return; }
                  if (password.length < 6) { toast({ title: "كلمة المرور قصيرة", variant: "destructive" }); return; }
                  setOrgStep(3);
                }}>
                  التالي <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {orgStep === 3 && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">اختر الباقة المناسبة لجمعيتك</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {plans.map((plan, i) => {
                  const Icon = planIcons[i] || Briefcase;
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative flex flex-col gap-2 rounded-xl border-2 p-4 text-right transition-all ${isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-display font-bold text-foreground">{plan.name_ar}</span>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {plan.price_monthly === 0 ? "مجاناً" : `${plan.price_monthly} ر.س/شهر`}
                      </div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• {plan.jobs_per_month} وظيفة/شهر</li>
                        <li>• {plan.featured_count} وظيفة مميزة</li>
                        <li>• {plan.seats} مقعد</li>
                      </ul>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setOrgStep(2)}>
                  <ArrowRight className="ml-2 h-4 w-4" /> السابق
                </Button>
                <Button onClick={handleOrgRegister} disabled={loading || !selectedPlanId}>
                  {loading ? "جارٍ التسجيل..." : "تسجيل الجمعية"}
                </Button>
              </div>
            </div>
          )}

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
