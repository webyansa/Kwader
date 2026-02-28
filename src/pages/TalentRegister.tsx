import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Briefcase, GraduationCap, Sparkles, FileText, Heart,
  ArrowRight, ArrowLeft, Phone, MapPin, Upload, CheckCircle, X,
} from "lucide-react";

const TOTAL_STEPS = 7;
const STORAGE_KEY = "kwader_talent_onboard";

// Saudi regions & cities
const saudiRegions: Record<string, string[]> = {
  "الرياض": ["الرياض", "الخرج", "الدرعية", "المزاحمية"],
  "مكة المكرمة": ["جدة", "مكة المكرمة", "الطائف", "رابغ"],
  "المدينة المنورة": ["المدينة المنورة", "ينبع", "العلا"],
  "المنطقة الشرقية": ["الدمام", "الخبر", "الظهران", "الأحساء", "الجبيل"],
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

const professionalFields = [
  "إدارة مشاريع", "موارد بشرية", "محاسبة", "تقنية معلومات",
  "تطوير أعمال", "علاقات عامة", "إدارة تنفيذية", "تسويق",
  "تصميم", "قانون", "هندسة", "طب", "تعليم",
];

const experienceLevels = [
  { label: "طالب / حديث تخرج", value: "fresh" },
  { label: "1 – 3 سنوات", value: "1-3" },
  { label: "4 – 7 سنوات", value: "4-7" },
  { label: "8 – 15 سنة", value: "8-15" },
  { label: "أكثر من 15 سنة", value: "15+" },
];

const commonSkills = [
  "القيادة", "التخطيط الاستراتيجي", "إدارة المشاريع", "التواصل",
  "العمل الجماعي", "حل المشكلات", "التحليل المالي", "التسويق الرقمي",
  "إدارة الفرق", "تحليل البيانات", "التفاوض", "إعداد التقارير",
  "الإبداع", "المبيعات", "خدمة العملاء", "البرمجة",
  "التصميم الجرافيكي", "إدارة المحتوى", "الذكاء الاصطناعي", "الأمن السيبراني",
];

const jobTypes = [
  { label: "دوام كامل", value: "full_time" },
  { label: "جزئي", value: "part_time" },
  { label: "عن بعد", value: "remote" },
  { label: "استشاري", value: "consultant" },
  { label: "تطوعي", value: "volunteer" },
];

const stepMeta = [
  { title: "وش اسمك الكامل؟", icon: User },
  { title: "خلنا نثبت بياناتك الأساسية", icon: Mail },
  { title: "إيش مجالك الحالي أو المسمى المهني؟", icon: Briefcase },
  { title: "كم خبرتك تقريبًا؟", icon: GraduationCap },
  { title: "وش أبرز مهاراتك؟", icon: Sparkles },
  { title: "عندك سيرة ذاتية جاهزة؟", icon: FileText },
  { title: "وش نوع الفرص اللي تناسبك؟", icon: Heart },
];

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  professionalField: string;
  experienceLevel: string;
  skills: string[];
  cvFile: File | null;
  cvSkipped: boolean;
  jobPreferences: string[];
  preferredCity: string;
  expectedSalary: string;
}

const defaultForm: FormData = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  professionalField: "",
  experienceLevel: "",
  skills: [],
  cvFile: null,
  cvSkipped: false,
  jobPreferences: [],
  preferredCity: "",
  expectedSalary: "",
};

const TalentRegister = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultForm, ...parsed, cvFile: null };
      }
    } catch {}
    return defaultForm;
  });
  const [loading, setLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [fieldSearch, setFieldSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [done, setDone] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-save
  useEffect(() => {
    const { cvFile, ...saveable } = form;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveable));
  }, [form]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValidSaudiPhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    return /^05\d{8}$/.test(cleaned) || /^\+9665\d{8}$/.test(cleaned);
  };

  const handleSendOTP = useCallback(() => {
    if (!isValidSaudiPhone(form.phone)) {
      toast({ title: "رقم غير صالح", description: "يجب أن يبدأ بـ 05 أو +9665", variant: "destructive" });
      return;
    }
    setOtpLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
      toast({ title: "تم إرسال رمز التحقق", description: "أدخل الرمز 1234 للتجربة" });
    }, 1000);
  }, [form.phone, toast]);

  const handleVerifyOTP = useCallback(() => {
    if (otpCode === "1234") {
      setPhoneVerified(true);
      toast({ title: "تم توثيق رقم الجوال بنجاح ✅" });
    } else {
      toast({ title: "رمز غير صحيح", variant: "destructive" });
    }
  }, [otpCode, toast]);

  // Create account after step 2
  const createAccount = async () => {
    if (accountCreated) return true;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.fullName.trim() }, emailRedirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
      setLoading(false);
      return false;
    }
    if (data.user) {
      await supabase.rpc("register_job_seeker", {
        _full_name: form.fullName.trim(),
        _city: form.city.trim() || null,
      });
      setAccountCreated(true);
    }
    setLoading(false);
    return true;
  };

  // Save profile data (steps 3-7) incrementally
  const saveProfileData = async () => {
    const prefs: Record<string, unknown> = {};
    if (form.jobPreferences.length) prefs.job_types = form.jobPreferences;
    if (form.preferredCity) prefs.preferred_city = form.preferredCity;
    if (form.expectedSalary) prefs.expected_salary = form.expectedSalary;
    if (form.professionalField) prefs.professional_field = form.professionalField;

    const updateData: Record<string, unknown> = {};
    if (form.skills.length) updateData.skills = form.skills;
    if (form.experienceLevel) updateData.experience_level = form.experienceLevel;
    if (Object.keys(prefs).length) updateData.job_preferences = prefs;

    // Calculate completion
    let pct = 0;
    if (form.fullName && form.email && form.phone) pct += 30;
    if (form.skills.length >= 3) pct += 20;
    if (form.experienceLevel) pct += 20;
    if (form.professionalField) pct += 10;
    if (form.cvFile || form.cvSkipped) pct += 10;
    if (form.jobPreferences.length) pct += 10;
    updateData.profile_completion_percentage = pct;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("job_seeker_profiles")
        .update(updateData)
        .eq("user_id", user.id);
    }
  };

  // Upload CV
  const uploadCV = async () => {
    if (!form.cvFile) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = form.cvFile.name.split(".").pop();
    const path = `${user.id}/cv.${ext}`;
    await supabase.storage.from("cvs").upload(path, form.cvFile, { upsert: true });
    const { data: urlData } = supabase.storage.from("cvs").getPublicUrl(path);
    await supabase
      .from("job_seeker_profiles")
      .update({ cv_file_url: urlData.publicUrl })
      .eq("user_id", user.id);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return form.fullName.trim().length >= 2;
      case 2: return !!form.email.trim() && form.password.length >= 6 && isValidSaudiPhone(form.phone) && phoneVerified;
      case 3: return !!form.professionalField;
      case 4: return !!form.experienceLevel;
      case 5: return form.skills.length >= 3;
      case 6: return form.cvFile !== null || form.cvSkipped;
      case 7: return form.jobPreferences.length > 0;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step === 2 && !accountCreated) {
      const ok = await createAccount();
      if (!ok) return;
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (form.cvFile) await uploadCV();
      await saveProfileData();
      localStorage.removeItem(STORAGE_KEY);
      setDone(true);
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
    setLoading(false);
  };

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  // Calculate profile completion for success screen
  const getCompletionPct = () => {
    let pct = 0;
    if (form.fullName && form.email && form.phone) pct += 30;
    if (form.skills.length >= 3) pct += 20;
    if (form.experienceLevel) pct += 20;
    if (form.professionalField) pct += 10;
    if (form.cvFile) pct += 10;
    if (form.jobPreferences.length) pct += 10;
    return pct;
  };

  const slideVariants = {
    enter: { opacity: 0, x: -30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  const StepIcon = stepMeta[step - 1]?.icon || User;

  const filteredFields = fieldSearch
    ? professionalFields.filter((f) => f.includes(fieldSearch))
    : professionalFields;

  const filteredSkills = skillSearch
    ? commonSkills.filter((s) => s.includes(skillSearch))
    : commonSkills;

  const toggleSkill = (skill: string) => {
    if (form.skills.includes(skill)) {
      update("skills", form.skills.filter((s) => s !== skill));
    } else if (form.skills.length < 10) {
      update("skills", [...form.skills, skill]);
    }
  };

  const toggleJobPref = (value: string) => {
    if (form.jobPreferences.includes(value)) {
      update("jobPreferences", form.jobPreferences.filter((v) => v !== value));
    } else {
      update("jobPreferences", [...form.jobPreferences, value]);
    }
  };

  // ===== SUCCESS SCREEN =====
  if (done) {
    const pct = getCompletionPct();
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 text-center shadow-xl"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">🎉 ملفك جاهز بنسبة {pct}%</h1>
          <Progress value={pct} className="h-3" />
          <p className="text-muted-foreground">
            نوصي تكمل بياناتك عشان تزيد فرص ظهورك
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full font-display font-bold" onClick={() => navigate("/talents/profile")}>
              كمل ملفي الآن
            </Button>
            <Button variant="outline" className="w-full font-display font-bold" onClick={() => navigate("/jobs")}>
              استعرض الوظائف
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/3 via-background to-background" dir="rtl">
      {/* Minimal Header */}
      <header className="flex items-center justify-between border-b bg-card/80 px-6 py-3 backdrop-blur-lg">
        <Link to="/" className="font-display text-xl font-black text-primary">كوادر</Link>
        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
          عندك حساب؟ <span className="font-semibold text-primary">سجل دخولك</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-display font-semibold">أنشئ ملفك المهني في كوادر</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-5 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-card p-8 shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                {/* Step Header */}
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <StepIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold">{stepMeta[step - 1]?.title}</h2>
                </div>

                {/* ===== STEP 1: Name ===== */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">الاسم الكامل</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        placeholder="مثال: محمد عبدالله العمري"
                        maxLength={100}
                        autoFocus
                      />
                    </div>
                    {form.fullName.trim().length >= 2 && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-primary/5 p-3 text-sm text-primary"
                      >
                        أهلاً {form.fullName.trim().split(" ")[0]} 👋 خلنا نجهز لك ملف مهني يليق بخبرتك
                      </motion.p>
                    )}
                  </div>
                )}

                {/* ===== STEP 2: Email + Phone + Password ===== */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                      بنستخدم بياناتك عشان نوصلك بفرص مناسبة لك 🎯
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="name@example.com"
                        maxLength={255}
                        disabled={accountCreated}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder="6 أحرف على الأقل"
                        minLength={6}
                        disabled={accountCreated}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الجوال السعودي</Label>
                      <div className="flex gap-2">
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="05XXXXXXXX"
                          maxLength={13}
                          className="flex-1"
                          disabled={phoneVerified}
                          dir="ltr"
                        />
                        {!phoneVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSendOTP}
                            disabled={otpLoading || !isValidSaudiPhone(form.phone)}
                            className="shrink-0"
                          >
                            {otpLoading ? "جارٍ الإرسال..." : otpSent ? "إعادة الإرسال" : "أرسل رمز التحقق"}
                          </Button>
                        )}
                      </div>
                      {phoneVerified && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1 text-sm font-medium text-primary"
                        >
                          <CheckCircle className="h-4 w-4" /> تم توثيق رقم الجوال بنجاح ✅
                        </motion.p>
                      )}
                    </div>
                    {otpSent && !phoneVerified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        <Label htmlFor="otp">رمز التحقق</Label>
                        <div className="flex gap-2">
                          <Input
                            id="otp"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="أدخل الرمز"
                            maxLength={6}
                            className="flex-1"
                            dir="ltr"
                          />
                          <Button type="button" size="sm" onClick={handleVerifyOTP}>
                            تحقق
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة</Label>
                      <select
                        id="city"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">اختر المدينة</option>
                        {Object.values(saudiRegions).flat().sort().map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ===== STEP 3: Professional Field ===== */}
                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                      هذا أول سطر في هويتك المهنية
                    </p>
                    <Input
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      placeholder="ابحث عن مجالك..."
                      className="mb-2"
                    />
                    <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto">
                      {filteredFields.map((field) => (
                        <button
                          key={field}
                          onClick={() => { update("professionalField", field); setFieldSearch(""); }}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                            form.professionalField === field
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          {field}
                        </button>
                      ))}
                    </div>
                    {form.professionalField && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-lg bg-primary/5 p-3 text-center text-sm text-primary"
                      >
                        ممتاز! اخترت: <strong>{form.professionalField}</strong>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ===== STEP 4: Experience Level ===== */}
                {step === 4 && (
                  <div className="space-y-3">
                    {experienceLevels.map((lvl) => (
                      <button
                        key={lvl.value}
                        onClick={() => update("experienceLevel", lvl.value)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-right transition-all ${
                          form.experienceLevel === lvl.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            form.experienceLevel === lvl.value
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {form.experienceLevel === lvl.value && (
                            <CheckCircle className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{lvl.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* ===== STEP 5: Skills ===== */}
                {step === 5 && (
                  <div className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                      كل ما حددت مهاراتك بدقة، زادت فرص ظهورك للجهات ✨
                    </p>
                    {form.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.skills.map((s) => (
                          <Badge
                            key={s}
                            className="cursor-pointer gap-1 bg-primary text-primary-foreground hover:bg-primary/80"
                            onClick={() => toggleSkill(s)}
                          >
                            {s} <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {form.skills.length}/10 مهارات ({form.skills.length < 3 ? `اختر ${3 - form.skills.length} على الأقل` : "ممتاز!"})
                    </p>
                    <Input
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="ابحث عن مهارة..."
                    />
                    <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
                      {filteredSkills
                        .filter((s) => !form.skills.includes(s))
                        .map((skill) => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-all hover:border-primary/50 hover:bg-primary/5"
                          >
                            {skill}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* ===== STEP 6: CV Upload ===== */}
                {step === 6 && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <label
                        htmlFor="cv-upload"
                        className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary hover:bg-primary/10"
                      >
                        <Upload className="h-10 w-10 text-primary/60" />
                        <span className="font-display font-semibold text-primary">رفع السيرة</span>
                        <span className="text-xs text-muted-foreground">PDF أو Word — حد أقصى 5 ميجا</span>
                        <input
                          id="cv-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast({ title: "الملف كبير جداً", description: "الحد الأقصى 5 ميجا", variant: "destructive" });
                                return;
                              }
                              update("cvFile", file);
                              update("cvSkipped", false);
                            }
                          }}
                        />
                      </label>
                      {form.cvFile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-sm text-primary"
                        >
                          <FileText className="h-4 w-4" />
                          <span>{form.cvFile.name}</span>
                          <button onClick={() => update("cvFile", null)} className="mr-auto">
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={() => { update("cvSkipped", true); update("cvFile", null); }}
                    >
                      أكمل بدون رفع
                    </Button>
                    {form.cvSkipped && (
                      <p className="text-center text-xs text-muted-foreground">تقدر ترجع تضيفها لاحقًا</p>
                    )}
                  </div>
                )}

                {/* ===== STEP 7: Job Preferences ===== */}
                {step === 7 && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      {jobTypes.map((jt) => (
                        <button
                          key={jt.value}
                          onClick={() => toggleJobPref(jt.value)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                            form.jobPreferences.includes(jt.value)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {jt.label}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>المدينة المفضلة للعمل</Label>
                      <select
                        value={form.preferredCity}
                        onChange={(e) => update("preferredCity", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">اختر المدينة</option>
                        {Object.values(saudiRegions).flat().sort().map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>الراتب المتوقع (اختياري)</Label>
                      <Input
                        value={form.expectedSalary}
                        onChange={(e) => update("expectedSalary", e.target.value)}
                        placeholder="مثال: 8,000 – 12,000 ريال"
                        dir="rtl"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => s - 1)}
                  className="gap-1"
                >
                  <ArrowRight className="h-4 w-4" /> السابق
                </Button>
              ) : (
                <Link to="/register">
                  <Button variant="ghost" className="gap-1 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" /> رجوع
                  </Button>
                </Link>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  className="gap-1 font-display font-bold"
                >
                  {loading ? "جارٍ التسجيل..." : "التالي"} <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!canProceed() || loading}
                  className="gap-1 font-display font-bold"
                >
                  {loading ? "جارٍ الحفظ..." : "ابدأ تجهيز ملفك المهني"} <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Skip hint for optional steps */}
          {step >= 3 && step <= 6 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {step === 6
                ? ""
                : "تقدر تكمل هالبيانات لاحقاً من ملفك الشخصي"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default TalentRegister;
