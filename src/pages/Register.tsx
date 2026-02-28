import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Building2, User, ArrowRight, ArrowLeft,
  Briefcase, Star, Zap, Crown, Phone, Mail, MapPin, Users, Shield,
} from "lucide-react";

type AccountType = "org" | "seeker";

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
  sort_order: number;
}

// Saudi regions & cities
const saudiRegions: Record<string, string[]> = {
  "الرياض": ["الرياض", "الخرج", "الدرعية", "المزاحمية", "حوطة بني تميم"],
  "مكة المكرمة": ["جدة", "مكة المكرمة", "الطائف", "رابغ"],
  "المدينة المنورة": ["المدينة المنورة", "ينبع", "العلا"],
  "المنطقة الشرقية": ["الدمام", "الخبر", "الظهران", "الأحساء", "الجبيل", "القطيف"],
  "القصيم": ["بريدة", "عنيزة", "الرس"],
  "عسير": ["أبها", "خميس مشيط", "بيشة"],
  "تبوك": ["تبوك", "الوجه", "ضباء"],
  "حائل": ["حائل"],
  "الحدود الشمالية": ["عرعر", "رفحاء"],
  "جازان": ["جازان", "صبيا"],
  "نجران": ["نجران"],
  "الباحة": ["الباحة"],
  "الجوف": ["سكاكا", "دومة الجندل"],
};

const entityTypes = ["جمعية أهلية", "مؤسسة غير ربحية", "وقف", "مبادرة", "جهة مانحة"];
const orgCategories = ["تنموية", "خيرية", "تعليمية", "صحية", "شبابية", "بيئية", "أخرى"];
const teamSizes = ["1–5", "6–10", "11–25", "26–50", "51–100", "100+"];

const ORG_TOTAL_STEPS = 6;

const stepMeta = [
  { title: "اسم الكيان", icon: Building2 },
  { title: "بيانات التواصل", icon: Mail },
  { title: "نوع وتصنيف الكيان", icon: Shield },
  { title: "الموقع الجغرافي", icon: MapPin },
  { title: "حجم الفريق", icon: Users },
  { title: "اختيار الباقة", icon: Star },
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") === "seeker" ? "seeker" : searchParams.get("type") === "org" ? "org" : null;
  
  const [phase, setPhase] = useState<"choose" | "form" | "success">(initialType ? "form" : "choose");
  const [accountType, setAccountType] = useState<AccountType>(initialType === "seeker" ? "seeker" : "org");
  const [orgStep, setOrgStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Seeker fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seekerCity, setSeekerCity] = useState("");

  // Org fields
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [entityType, setEntityType] = useState("");
  const [orgCategory, setOrgCategory] = useState("");
  const [region, setRegion] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Auth fields (collected in step 2 alongside contact)
  const [orgPassword, setOrgPassword] = useState("");

  useEffect(() => {
    supabase.from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
      if (data) setPlans(data as Plan[]);
    });
  }, []);

  // Available cities based on selected region
  const availableCities = region ? saudiRegions[region] || [] : [];

  // Saudi phone validation
  const isValidSaudiPhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    return /^05\d{8}$/.test(cleaned) || /^\+9665\d{8}$/.test(cleaned);
  };

  // Mock OTP send
  const handleSendOTP = useCallback(() => {
    if (!isValidSaudiPhone(orgPhone)) {
      toast({ title: "رقم غير صالح", description: "يجب أن يبدأ بـ 05 أو +9665 ويتكون من أرقام صحيحة", variant: "destructive" });
      return;
    }
    setOtpLoading(true);
    // Simulate OTP send - replace with real SMS service later
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
      toast({ title: "تم إرسال رمز التحقق", description: "أدخل الرمز 1234 للتجربة (سيتم ربط خدمة SMS لاحقاً)" });
    }, 1000);
  }, [orgPhone, toast]);

  // Mock OTP verify
  const handleVerifyOTP = useCallback(() => {
    if (otpCode === "1234") {
      setPhoneVerified(true);
      toast({ title: "تم التحقق بنجاح ✅", description: "تم التحقق من رقم الهاتف" });
    } else {
      toast({ title: "رمز غير صحيح", description: "حاول مرة أخرى", variant: "destructive" });
    }
  }, [otpCode, toast]);

  // Smart plan recommendation based on team size
  const getRecommendedPlanIndex = () => {
    if (!teamSize) return 1;
    const sizeMap: Record<string, number> = {
      "1–5": 0, "6–10": 1, "11–25": 1, "26–50": 2, "51–100": 2, "100+": 3,
    };
    return Math.min(sizeMap[teamSize] ?? 1, plans.length - 1);
  };

  // Seeker registration
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
      await supabase.rpc("register_job_seeker", {
        _full_name: fullName.trim(),
        _city: seekerCity.trim() || null,
      });
    }

    setLoading(false);
    navigate("/talents/profile");
  };

  // Org registration
  const handleOrgRegister = async () => {
    if (!selectedPlanId) {
      toast({ title: "اختر باقة", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: orgEmail.trim(),
      password: orgPassword,
      options: { data: { full_name: orgName.trim() }, emailRedirectTo: window.location.origin },
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
        _website: orgWebsite.trim() || null,
      });
      if (orgError) {
        toast({ title: "خطأ في تسجيل الكيان", description: orgError.message, variant: "destructive" });
      }
    }

    setLoading(false);
    setPhase("success");
  };

  // Step validation
  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1: return orgName.trim().length >= 2;
      case 2: return !!orgEmail.trim() && orgPassword.length >= 6 && isValidSaudiPhone(orgPhone) && phoneVerified;
      case 3: return !!entityType && !!orgCategory;
      case 4: return !!region && !!orgCity;
      case 5: return !!teamSize;
      case 6: return !!selectedPlanId;
      default: return false;
    }
  };

  const progressPercent = Math.round(((orgStep - 1) / (ORG_TOTAL_STEPS - 1)) * 100);

  const planIcons = [Briefcase, Star, Zap, Crown];

  const slideVariants = {
    enter: { opacity: 0, x: -30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  // ===== SUCCESS SCREEN =====
  if (phase === "success") {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 text-center shadow-lg"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">تم استلام طلبك بنجاح! 🎉</h1>
            <p className="text-muted-foreground">
              شكرًا لتسجيلك في منصة كوادر. سيتم مراجعة طلب تسجيل كيانك من قبل فريق الإدارة وتفعيل حسابك في أقرب وقت.
            </p>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              ستصلك رسالة على بريدك الإلكتروني عند تفعيل الحساب.
            </div>
            <Link to="/login">
              <Button variant="outline" className="mt-4 w-full">العودة لتسجيل الدخول</Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ===== CHOOSE ACCOUNT TYPE =====
  if (phase === "choose") {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-6 rounded-2xl border bg-card p-8 shadow-lg"
          >
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold">إنشاء حساب جديد</h1>
              <p className="mt-2 text-sm text-muted-foreground">اختر نوع الحساب المناسب لك</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => { setAccountType("seeker"); setPhase("form"); }}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <span className="font-display text-lg font-semibold">حساب كوادر</span>
                <span className="text-xs text-muted-foreground">أنشئ ملفك المهني وتقدم للوظائف — مجاناً</span>
              </button>
              <button
                onClick={() => { setAccountType("org"); setPhase("form"); setOrgStep(1); }}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-accent hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <Building2 className="h-7 w-7 text-accent" />
                </div>
                <span className="font-display text-lg font-semibold">حساب كيان</span>
                <span className="text-xs text-muted-foreground">انشر وظائف وأدر فريق التوظيف</span>
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
            </p>
          </motion.div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-6 rounded-2xl border bg-card p-8 shadow-lg"
          >
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold">إنشاء حساب كوادر</h1>
              <p className="mt-2 text-sm text-muted-foreground">أنشئ ملفك المهني وابدأ رحلتك المهنية</p>
              <button onClick={() => setPhase("choose")} className="mt-1 text-xs text-primary hover:underline">← تغيير نوع الحساب</button>
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
                <Input id="city" value={seekerCity} onChange={(e) => setSeekerCity(e.target.value)} maxLength={100} />
              </div>
              <Button type="submit" className="w-full font-display font-bold" disabled={loading}>
                {loading ? "جارٍ التسجيل..." : "إنشاء الحساب"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ===== ORG 6-STEP ONBOARDING =====
  const StepIcon = stepMeta[orgStep - 1]?.icon || Building2;
  const recommendedIdx = getRecommendedPlanIndex();

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>الخطوة {orgStep} من {ORG_TOTAL_STEPS}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="mt-2 flex justify-center gap-1">
              {stepMeta.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors ${i < orgStep ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-lg">
            {/* Step Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <StepIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">{stepMeta[orgStep - 1]?.title}</h2>
              <button onClick={() => setPhase("choose")} className="mt-1 text-xs text-muted-foreground hover:text-primary">← تغيير نوع الحساب</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={orgStep}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                {/* STEP 1: Org Name */}
                {orgStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">اسم الكيان بالعربية *</Label>
                      <Input
                        id="orgName"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="مثال: جمعية الإحسان الخيرية"
                        maxLength={200}
                        autoFocus
                        className="h-12 text-base"
                      />
                    </div>
                    {orgName.trim().length >= 2 && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-primary"
                      >
                        ممتاز 👌 لنبدأ بتسجيل كيانك
                      </motion.p>
                    )}
                  </div>
                )}

                {/* STEP 2: Contact + Auth */}
                {orgStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgEmail">البريد الإلكتروني الرسمي *</Label>
                      <Input
                        id="orgEmail"
                        type="email"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        placeholder="info@org.sa"
                        maxLength={255}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgPassword">كلمة المرور *</Label>
                      <Input
                        id="orgPassword"
                        type="password"
                        value={orgPassword}
                        onChange={(e) => setOrgPassword(e.target.value)}
                        minLength={6}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">6 أحرف على الأقل</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgPhone">رقم الجوال السعودي *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="orgPhone"
                          value={orgPhone}
                          onChange={(e) => { setOrgPhone(e.target.value); setPhoneVerified(false); setOtpSent(false); }}
                          placeholder="05xxxxxxxx"
                          maxLength={15}
                          className="h-12 flex-1"
                          disabled={phoneVerified}
                        />
                        {!phoneVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendOTP}
                            disabled={otpLoading || !isValidSaudiPhone(orgPhone)}
                            className="h-12 shrink-0"
                          >
                            {otpLoading ? "جارٍ الإرسال..." : otpSent ? "إعادة الإرسال" : "إرسال رمز"}
                          </Button>
                        )}
                      </div>
                      {phoneVerified && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-sm text-primary">
                          <CheckCircle className="h-4 w-4" /> تم التحقق من الرقم بنجاح
                        </motion.div>
                      )}
                    </div>
                    {otpSent && !phoneVerified && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <Label>رمز التحقق</Label>
                        <div className="flex gap-2">
                          <Input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="أدخل الرمز المرسل"
                            maxLength={6}
                            className="h-12 flex-1"
                          />
                          <Button type="button" onClick={handleVerifyOTP} className="h-12 shrink-0">
                            تحقق
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">💡 للتجربة: الرمز هو 1234</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* STEP 3: Type & Category */}
                {orgStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>نوع الكيان *</Label>
                      <Select value={entityType} onValueChange={setEntityType}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="اختر نوع الكيان" />
                        </SelectTrigger>
                        <SelectContent>
                          {entityTypes.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>تصنيف الكيان *</Label>
                      <Select value={orgCategory} onValueChange={setOrgCategory}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="اختر التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgCategories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {entityType && orgCategory && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-primary">
                        {entityType} — {orgCategory} ✓
                      </motion.p>
                    )}
                  </div>
                )}

                {/* STEP 4: Location */}
                {orgStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>المنطقة *</Label>
                      <Select value={region} onValueChange={(v) => { setRegion(v); setOrgCity(""); }}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="اختر المنطقة" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(saudiRegions).map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>المدينة *</Label>
                      <Select value={orgCity} onValueChange={setOrgCity} disabled={!region}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={region ? "اختر المدينة" : "اختر المنطقة أولاً"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>العنوان التفصيلي</Label>
                      <Input
                        value={orgAddress}
                        onChange={(e) => setOrgAddress(e.target.value)}
                        placeholder="الحي، الشارع"
                        maxLength={300}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الموقع الإلكتروني</Label>
                      <Input
                        value={orgWebsite}
                        onChange={(e) => setOrgWebsite(e.target.value)}
                        placeholder="https://org.sa"
                        maxLength={255}
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: Team Size */}
                {orgStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>حجم فريق العمل *</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {teamSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setTeamSize(size)}
                            className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
                              teamSize === size
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 هذا يساعدنا في اقتراح الباقة المناسبة لكيانك
                      </p>
                    </div>
                    {teamSize && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-primary">
                        رائع! سنقترح لك الباقة الأنسب في الخطوة التالية 🎯
                      </motion.p>
                    )}
                  </div>
                )}

                {/* STEP 6: Plan Selection */}
                {orgStep === 6 && (
                  <div className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">اختر الباقة المناسبة لكيانك</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {plans.map((plan, i) => {
                        const Icon = planIcons[i] || Briefcase;
                        const isSelected = selectedPlanId === plan.id;
                        const isRecommended = i === recommendedIdx;
                        return (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative flex flex-col gap-2 rounded-xl border-2 p-4 text-right transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md"
                                : isRecommended
                                  ? "border-accent/50 bg-accent/5"
                                  : "border-border hover:border-primary/50"
                            }`}
                          >
                            {isRecommended && (
                              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold text-accent-foreground">
                                الأنسب لك
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 left-2">
                                <CheckCircle className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-primary" />
                              <span className="font-display font-bold">{plan.name_ar}</span>
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
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => orgStep > 1 ? setOrgStep(orgStep - 1) : setPhase("choose")}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                {orgStep === 1 ? "نوع الحساب" : "السابق"}
              </Button>
              {orgStep < ORG_TOTAL_STEPS ? (
                <Button
                  onClick={() => setOrgStep(orgStep + 1)}
                  disabled={!canProceed(orgStep)}
                >
                  التالي <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleOrgRegister}
                  disabled={loading || !selectedPlanId}
                  className="font-display font-bold"
                >
                  {loading ? "جارٍ التسجيل..." : "إنشاء الحساب 🚀"}
                </Button>
              )}
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
