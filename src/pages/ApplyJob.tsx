import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isJobSeeker } from "@/lib/roles";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { CheckCircle, Upload, User, UserPlus, ArrowLeft, Building2, MapPin, Briefcase, ShieldCheck, FileText, Rocket } from "lucide-react";
import { Helmet } from "react-helmet-async";

const guestSchema = z.object({
  full_name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(50).optional(),
  cover_letter: z.string().trim().max(2000).optional(),
  terms: z.literal(true, { errorMap: () => ({ message: "يجب الموافقة على الشروط" }) }),
});

const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_SIZE = 5 * 1024 * 1024;

const ApplyJob = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const isTalent = isJobSeeker(roles);
  const isLoggedIn = !!user;

  const shortId = slug?.match(/-(\d+)$/)?.[1] || slug;

  // Fetch job
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job-apply", shortId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, short_description)")
        .eq("short_id", shortId!)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: d2, error: e2 } = await supabase
          .from("jobs")
          .select("*, organizations(name_ar, logo_url, short_description)")
          .eq("id", slug!)
          .eq("status", "published")
          .maybeSingle();
        if (e2) throw e2;
        return d2;
      }
      return data;
    },
    enabled: !!shortId,
  });

  // Fetch talent profile if logged in
  const { data: talentProfile } = useQuery({
    queryKey: ["talent-profile-apply", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_seeker_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: isLoggedIn && isTalent,
  });

  // State
  type ApplyMode = "choose" | "talent" | "guest";
  const [mode, setMode] = useState<ApplyMode>(isLoggedIn && isTalent ? "talent" : "choose");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Guest form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Talent form state
  const [talentCoverLetter, setTalentCoverLetter] = useState("");
  const [talentCvFile, setTalentCvFile] = useState<File | null>(null);
  const [useProfileCv, setUseProfileCv] = useState(true);

  useEffect(() => {
    if (isLoggedIn && isTalent) setMode("talent");
  }, [isLoggedIn, isTalent]);

  const screeningQuestions = (job?.screening_questions as any[]) || [];

  const [screeningAnswers, setScreeningAnswers] = useState<Record<number, string>>({});

  const uploadCv = async (file: File, jobId: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${jobId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("cvs").upload(path, file);
    if (error) {
      toast({ title: "خطأ في رفع الملف", description: error.message, variant: "destructive" });
      return null;
    }
    return path;
  };

  const handleTalentSubmit = async () => {
    if (!job || !user || !job.org_id) {
      toast({ title: "تعذر التقديم", description: "بيانات الوظيفة غير مكتملة", variant: "destructive" });
      return;
    }
    setLoading(true);

    let cvUrl: string | null = null;
    if (!useProfileCv && talentCvFile) {
      if (!ALLOWED_TYPES.includes(talentCvFile.type)) {
        toast({ title: "خطأ", description: "يُسمح فقط بملفات PDF, DOC, DOCX", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (talentCvFile.size > MAX_SIZE) {
        toast({ title: "خطأ", description: "الحد الأقصى لحجم الملف 5MB", variant: "destructive" });
        setLoading(false);
        return;
      }
      cvUrl = await uploadCv(talentCvFile, job.id);
      if (!cvUrl) { setLoading(false); return; }
    } else if (useProfileCv && talentProfile?.cv_file_url) {
      cvUrl = talentProfile.cv_file_url;
    }

    const answersJson = screeningQuestions.map((q, i) => ({
      question: q.question || q.text,
      answer: screeningAnswers[i] || "",
    }));

    const payload = {
      job_id: job.id,
      organization_id: job.org_id,
      applicant_type: "talent",
      talent_user_id: user.id,
      created_by_user_id: user.id,
      full_name: talentProfile?.full_name || user.email?.split("@")[0] || "متقدم",
      email: user.email || "",
      phone: null,
      cv_file_url: cvUrl,
      cover_letter: talentCoverLetter || null,
      cover_message: talentCoverLetter || null,
      city: talentProfile?.city || null,
      screening_answers: answersJson.length > 0 ? answersJson : null,
      source: "web",
      status: "new" as any,
    };

    const { data: inserted, error } = await supabase.from("job_applications").insert([payload]).select("id, job_id, organization_id, talent_user_id").single();

    setLoading(false);
    if (error) {
      toast({ title: "خطأ في التقديم", description: error.message, variant: "destructive" });
    } else {
      console.info("application_created", inserted);
      toast({ title: "تم إرسال طلبك بنجاح ✅" });
      navigate("/talents/applications");
    }
  };

  const handleGuestSubmit = async () => {
    if (!job || !job.org_id) return;
    setErrors({});

    const result = guestSchema.safeParse({ full_name: fullName, email, phone, city, cover_letter: coverLetter, terms });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }

    if (!cvFile) {
      setErrors({ cv: "السيرة الذاتية مطلوبة" });
      return;
    }
    if (!ALLOWED_TYPES.includes(cvFile.type)) {
      setErrors({ cv: "يُسمح فقط بملفات PDF, DOC, DOCX" });
      return;
    }
    if (cvFile.size > MAX_SIZE) {
      setErrors({ cv: "الحد الأقصى لحجم الملف 5MB" });
      return;
    }

    setLoading(true);
    const cvUrl = await uploadCv(cvFile, job.id);
    if (!cvUrl) { setLoading(false); return; }

    const answersJson = screeningQuestions.map((q, i) => ({
      question: q.question || q.text,
      answer: screeningAnswers[i] || "",
    }));

    const payload = {
      job_id: job.id,
      organization_id: job.org_id,
      applicant_type: "guest",
      created_by_user_id: crypto.randomUUID(),
      full_name: result.data.full_name,
      email: result.data.email,
      phone: result.data.phone || null,
      city: result.data.city || null,
      guest_full_name: result.data.full_name,
      guest_email: result.data.email,
      guest_mobile: result.data.phone || null,
      cv_file_url: cvUrl,
      cover_letter: result.data.cover_letter || null,
      cover_message: result.data.cover_letter || null,
      screening_answers: answersJson.length > 0 ? answersJson : null,
      source: "web",
      status: "new" as any,
    };

    const { data: inserted, error } = await supabase.from("job_applications").insert([payload]).select("id, job_id, organization_id, talent_user_id").single();

    setLoading(false);
    if (error) {
      toast({ title: "خطأ في التقديم", description: error.message, variant: "destructive" });
    } else {
      console.info("application_created", inserted);
      toast({ title: "تم إرسال طلبك بنجاح ✅" });
      setSuccess(true);
    }
  };

  if (jobLoading) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">الوظيفة غير موجودة أو تم حذفها.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const org = job.organizations as any;

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen flex-col" dir="rtl">
        <Helmet><title>تم التقديم بنجاح | كوادر</title></Helmet>
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-16">
          <div className="mx-auto max-w-md text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">تم استلام طلبك ✅</h1>
            <p className="text-muted-foreground">سيتم مراجعة طلبك من قبل الجمعية المعلنة وسنتواصل معك عند وجود تحديث.</p>

            {mode === "guest" && (
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3 justify-center">
                  <Rocket className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-bold text-foreground">تبغى تنشئ حساب كوادر؟</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">يساعدك تتابع طلباتك بسهولة وتحفظ سيرتك وتتقدم أسرع للوظائف القادمة</p>
                <ul className="space-y-2 text-sm text-muted-foreground text-right">
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent shrink-0" />تتابع حالة طلبك</li>
                  <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-accent shrink-0" />تحفظ سيرتك الذاتية</li>
                  <li className="flex items-center gap-2"><Rocket className="h-4 w-4 text-accent shrink-0" />تتقدم أسرع للوظائف القادمة</li>
                </ul>
                <Button asChild className="w-full rounded-xl h-11">
                  <Link to={`/register/talent?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`}>
                    إنشاء حساب كوادر (دقيقة واحدة)
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                  <Link to={`/jobs/${job.slug_unique || job.id}`}>العودة للوظيفة</Link>
                </Button>
              </div>
            )}

            {mode === "talent" && (
              <div className="flex gap-3 justify-center">
                <Button asChild className="rounded-xl">
                  <Link to="/talents/applications">متابعة طلباتي</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-xl">
                  <Link to="/sector-jobs">تصفح وظائف أخرى</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Helmet><title>التقديم على: {job.title} | كوادر</title></Helmet>
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          {/* Job header */}
          <div className="mb-6 flex items-center gap-4 rounded-xl border bg-card p-4">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name_ar} className="h-12 w-12 rounded-lg border object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-foreground line-clamp-1">{job.title}</h2>
              <p className="text-sm text-muted-foreground">{org?.name_ar}</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to={`/jobs/${job.slug_unique || job.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Choose mode */}
          {mode === "choose" && (
            <div className="space-y-4">
              <h1 className="font-display text-xl font-bold text-foreground text-center">كيف تحب تقدّم؟</h1>
              <p className="text-center text-sm text-muted-foreground">اختر الطريقة الأنسب لك</p>

              <div className="grid gap-4 sm:grid-cols-2 mt-6">
                {/* Talent account */}
                <button
                  onClick={() => {
                    if (isLoggedIn && isTalent) {
                      setMode("talent");
                    } else {
                      navigate(`/login?redirect=/jobs/${slug}/apply`);
                    }
                  }}
                  className="group rounded-xl border-2 border-primary/20 bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground">قدّم بحساب كوادر</h3>
                  <Badge className="mt-2 bg-accent/10 text-accent border-0 text-xs">مستحسن</Badge>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    سجّل دخول وقدّم بسرعة مع حفظ بياناتك ومتابعة حالة طلبك
                  </p>
                </button>

                {/* Guest */}
                <button
                  onClick={() => setMode("guest")}
                  className="group rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-muted-foreground/30 hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                    <UserPlus className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-foreground">قدّم بدون حساب</h3>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    أدخل بياناتك وارفق سيرتك الذاتية للتقديم مباشرة
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Talent apply form */}
          {mode === "talent" && (
            <div className="space-y-5">
              <h1 className="font-display text-xl font-bold text-foreground">التقديم بحساب كوادر</h1>

              {/* CV selection */}
              <div className="space-y-3">
                <Label className="text-sm font-bold">السيرة الذاتية</Label>
                {talentProfile?.cv_file_url && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="cv-choice"
                      checked={useProfileCv}
                      onChange={() => setUseProfileCv(true)}
                      className="accent-primary"
                    />
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">استخدام السيرة المحفوظة في ملفك</span>
                  </label>
                )}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-secondary/50">
                  <input
                    type="radio"
                    name="cv-choice"
                    checked={!useProfileCv}
                    onChange={() => setUseProfileCv(false)}
                    className="accent-primary"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">رفع سيرة ذاتية جديدة</span>
                </label>
                {!useProfileCv && (
                  <div className="mr-8">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      {talentCvFile ? talentCvFile.name : "اختر ملف (PDF, DOC, DOCX)"}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setTalentCvFile(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                )}
              </div>

              {/* Cover letter */}
              <div className="space-y-2">
                <Label className="text-sm">رسالة قصيرة (اختياري)</Label>
                <Textarea
                  value={talentCoverLetter}
                  onChange={(e) => setTalentCoverLetter(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="اكتب رسالة مختصرة توضح اهتمامك بالوظيفة..."
                  className="rounded-xl"
                />
              </div>

              {/* Screening questions */}
              {screeningQuestions.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-bold">أسئلة الفرز</Label>
                  {screeningQuestions.map((q: any, i: number) => (
                    <div key={i} className="space-y-2 rounded-xl border p-4">
                      <p className="text-sm font-medium text-foreground">{q.question || q.text}</p>
                      {q.type === "yes_no" ? (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name={`sq-${i}`} value="نعم" onChange={(e) => setScreeningAnswers(p => ({ ...p, [i]: e.target.value }))} className="accent-primary" />
                            نعم
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name={`sq-${i}`} value="لا" onChange={(e) => setScreeningAnswers(p => ({ ...p, [i]: e.target.value }))} className="accent-primary" />
                            لا
                          </label>
                        </div>
                      ) : (
                        <Input
                          placeholder="إجابتك..."
                          value={screeningAnswers[i] || ""}
                          onChange={(e) => setScreeningAnswers(p => ({ ...p, [i]: e.target.value }))}
                          className="rounded-xl"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleTalentSubmit} disabled={loading} className="w-full h-12 rounded-xl text-base">
                {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
              </Button>

              <button onClick={() => setMode("choose")} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← رجوع
              </button>
            </div>
          )}

          {/* Guest apply form */}
          {mode === "guest" && (
            <div className="space-y-5">
              <h1 className="font-display text-xl font-bold text-foreground">التقديم بدون حساب</h1>

              <div className="space-y-2">
                <Label>الاسم الكامل *</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} className="rounded-xl h-11" />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className="rounded-xl h-11" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label>رقم الجوال</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className="rounded-xl h-11" placeholder="05xxxxxxxx" />
              </div>

              <div className="space-y-2">
                <Label>المدينة</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} maxLength={50} className="rounded-xl h-11" />
              </div>

              <div className="space-y-2">
                <Label>السيرة الذاتية * (PDF, DOC, DOCX — حد 5MB)</Label>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  {cvFile ? cvFile.name : "اختر ملف"}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
                </label>
                {errors.cv && <p className="text-xs text-destructive">{errors.cv}</p>}
              </div>

              <div className="space-y-2">
                <Label>رسالة قصيرة (اختياري)</Label>
                <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} maxLength={2000} rows={3} placeholder="اكتب رسالة مختصرة..." className="rounded-xl" />
              </div>

              {/* Screening questions */}
              {screeningQuestions.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-bold">أسئلة الفرز</Label>
                  {screeningQuestions.map((q: any, i: number) => (
                    <div key={i} className="space-y-2 rounded-xl border p-4">
                      <p className="text-sm font-medium text-foreground">{q.question || q.text}</p>
                      {q.type === "yes_no" ? (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name={`gsq-${i}`} value="نعم" onChange={(e) => setScreeningAnswers(p => ({ ...p, [i]: e.target.value }))} className="accent-primary" />
                            نعم
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name={`gsq-${i}`} value="لا" onChange={(e) => setScreeningAnswers(p => ({ ...p, [i]: e.target.value }))} className="accent-primary" />
                            لا
                          </label>
                        </div>
                      ) : (
                        <Input
                          placeholder="إجابتك..."
                          value={screeningAnswers[i] || ""}
                          onChange={(e) => setScreeningAnswers(p => ({ ...p, [i]: e.target.value }))}
                          className="rounded-xl"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={terms}
                  onCheckedChange={(v) => setTerms(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  أوافق على <span className="text-primary underline">الشروط والأحكام</span> و<span className="text-primary underline">سياسة الخصوصية</span>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}

              <Button onClick={handleGuestSubmit} disabled={loading} className="w-full h-12 rounded-xl text-base">
                {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
              </Button>

              <button onClick={() => setMode("choose")} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← رجوع
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplyJob;
