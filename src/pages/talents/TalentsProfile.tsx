import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Save } from "lucide-react";

const TalentsProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [summary, setSummary] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("job_seeker_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setCity(data.city || "");
          setSummary((data as any).summary || "");
          setExperienceLevel(data.experience_level || "");
          setSkills((data.skills || []).join(", "));
          setEducation((data as any).education || "");
          setCertifications((data as any).certifications || "");
          setLinkedinUrl(data.linkedin_url || "");
          setPortfolioUrl(data.portfolio_url || "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const skillsArr = skills.split(",").map(s => s.trim()).filter(Boolean);
    const filledFields = [fullName, city, summary, experienceLevel, skills, education].filter(Boolean).length;
    const completionPct = Math.round((filledFields / 6) * 100);

    const { error } = await supabase
      .from("job_seeker_profiles")
      .update({
        full_name: fullName || null,
        city: city || null,
        experience_level: experienceLevel || null,
        skills: skillsArr,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        summary: summary || null,
        education: education || null,
        certifications: certifications || null,
        profile_completion_percentage: completionPct,
      } as any)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "خطأ في الحفظ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ بنجاح" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">الملف المهني</h1>
          <p className="text-sm text-muted-foreground">أكمل ملفك المهني لزيادة فرصك</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>المدينة</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>نبذة مختصرة</Label>
            <Textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} placeholder="اكتب نبذة مختصرة عن خبراتك وأهدافك المهنية..." />
          </div>
          <div className="space-y-2">
            <Label>مستوى الخبرة</Label>
            <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">اختر</option>
              <option value="junior">مبتدئ</option>
              <option value="mid">متوسط</option>
              <option value="senior">خبير</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>المهارات (افصل بفاصلة)</Label>
            <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="إدارة مشاريع, تسويق, محاسبة..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التعليم والشهادات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>التعليم</Label>
            <Textarea value={education} onChange={e => setEducation(e.target.value)} rows={2} placeholder="بكالوريوس إدارة أعمال - جامعة..." />
          </div>
          <div className="space-y-2">
            <Label>الشهادات المهنية</Label>
            <Textarea value={certifications} onChange={e => setCertifications(e.target.value)} rows={2} placeholder="PMP, CPA, ..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الروابط</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>الموقع الشخصي / Portfolio</Label>
              <Input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://..." dir="ltr" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
        <Save className="ml-2 h-4 w-4" />
        {saving ? "جارٍ الحفظ..." : "حفظ الملف المهني"}
      </Button>
    </div>
  );
};

export default TalentsProfile;
