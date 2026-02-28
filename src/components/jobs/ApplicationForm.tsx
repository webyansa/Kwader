import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Upload } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  phone: z.string().trim().max(20).optional(),
  cover_letter: z.string().trim().max(2000).optional(),
});

const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_SIZE = 5 * 1024 * 1024;

interface ApplicationFormProps {
  jobId: string;
}

const ApplicationForm = ({ jobId }: ApplicationFormProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = schema.safeParse({ full_name: fullName, email, phone, cover_letter: coverLetter });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }

    if (cvFile) {
      if (!ALLOWED_TYPES.includes(cvFile.type)) {
        setErrors({ cv: "يُسمح فقط بملفات PDF, DOC, DOCX" });
        return;
      }
      if (cvFile.size > MAX_SIZE) {
        setErrors({ cv: "الحد الأقصى لحجم الملف 5MB" });
        return;
      }
    }

    if (!cvFile) {
      setErrors({ cv: "السيرة الذاتية مطلوبة" });
      return;
    }

    setLoading(true);
    let cvUrl: string | null = null;

    if (cvFile) {
      const ext = cvFile.name.split(".").pop();
      const path = `${jobId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, cvFile);
      if (upErr) {
        toast({ title: "خطأ في رفع الملف", description: upErr.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      cvUrl = path;
    }

    // Fetch job to get organization_id
    const { data: jobData } = await supabase.from("jobs").select("org_id").eq("id", jobId).single();
    const orgId = jobData?.org_id;
    if (!orgId) {
      toast({ title: "خطأ", description: "تعذر جلب بيانات الوظيفة", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("job_applications").insert([{
      job_id: jobId,
      organization_id: orgId,
      applicant_type: "guest",
      created_by_user_id: crypto.randomUUID(),
      full_name: result.data.full_name,
      email: result.data.email,
      guest_full_name: result.data.full_name,
      guest_email: result.data.email,
      guest_mobile: result.data.phone || null,
      phone: result.data.phone || null,
      cover_letter: result.data.cover_letter || null,
      cover_message: result.data.cover_letter || null,
      cv_file_url: cvUrl,
      source: "web",
    }]);

    setLoading(false);
    if (error) {
      toast({ title: "خطأ في التقديم", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center">
        <CheckCircle className="h-12 w-12 text-success" />
        <h3 className="font-display text-lg font-bold text-foreground">تم إرسال طلبك بنجاح!</h3>
        <p className="text-sm text-muted-foreground">سيتم مراجعة طلبك من قبل الجمعية المعلنة.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
      <h3 className="font-display text-lg font-bold text-foreground">التقديم على هذه الوظيفة</h3>
      <div className="space-y-2">
        <Label>الاسم الكامل *</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
      </div>
      <div className="space-y-2">
        <Label>البريد الإلكتروني *</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label>رقم الهاتف</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
      </div>
      <div className="space-y-2">
        <Label>السيرة الذاتية (PDF, DOC, DOCX — حد 5MB)</Label>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed bg-muted/30 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">
            <Upload className="h-4 w-4" />
            {cvFile ? cvFile.name : "اختر ملف"}
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {errors.cv && <p className="text-xs text-destructive">{errors.cv}</p>}
      </div>
      <div className="space-y-2">
        <Label>رسالة التغطية</Label>
        <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} maxLength={2000} rows={4} placeholder="اكتب رسالة مختصرة..." />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </Button>
    </form>
  );
};

export default ApplicationForm;
