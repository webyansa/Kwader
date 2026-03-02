import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Mail, PenLine, ArrowRight, User, Briefcase, Building2, MapPin, Calendar, Check, Unlink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationEmployees, useTalentSearch, type OrgEmployeeType, type OrgWorkMode } from "@/hooks/useOrganizationEmployees";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type AddMethod = "talent" | "invite" | "manual" | null;

interface TalentResult {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  headline: string | null;
  city: string | null;
  skills: string[] | null;
}

const PortalAddEmployee = () => {
  const navigate = useNavigate();
  const { createEmployee, employees } = useOrganizationEmployees();
  const [method, setMethod] = useState<AddMethod>(null);

  // Talent search state
  const [talentQuery, setTalentQuery] = useState("");
  const { data: talentResults, isLoading: searchLoading } = useTalentSearch(talentQuery);
  const [selectedTalent, setSelectedTalent] = useState<TalentResult | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState<OrgEmployeeType>("full_time");
  const [workMode, setWorkMode] = useState<OrgWorkMode>("onsite");
  const [startDate, setStartDate] = useState("");
  const [managerId, setManagerId] = useState("");
  const [step, setStep] = useState(1);

  const handleSelectTalent = (talent: TalentResult) => {
    setSelectedTalent(talent);
    setFullName(talent.full_name || "");
    setTalentQuery("");
    setStep(2);
  };

  const handleSubmit = async () => {
    await createEmployee.mutateAsync({
      full_name: fullName,
      email: email || undefined,
      phone: phone || undefined,
      job_title: jobTitle,
      department: department || undefined,
      employment_type: employmentType,
      work_mode: workMode,
      start_date: startDate || undefined,
      status: method === "invite" ? "invited" : "active",
      user_id: selectedTalent?.user_id || undefined,
      manager_employee_id: managerId || undefined,
    });
    navigate("/portal/hr/employees");
  };

  const managers = employees.filter((e) => e.status === "active");

  if (!method) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">إضافة موظف</h1>
            <p className="text-sm text-muted-foreground">اختر طريقة إضافة الموظف</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Method 1: Talent Search */}
          <Card
            className="border-2 border-transparent hover:border-primary/30 cursor-pointer transition-all group relative overflow-hidden"
            onClick={() => setMethod("talent")}
          >
            <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-bl-lg">مُوصى</div>
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">ربط بحساب كوادر</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ابحث عن كادر مسجل في المنصة واربطه كموظف بالجمعية
              </p>
            </CardContent>
          </Card>

          {/* Method 2: Invite */}
          <Card
            className="border-2 border-transparent hover:border-primary/30 cursor-pointer transition-all group"
            onClick={() => setMethod("invite")}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto group-hover:bg-accent/20 transition-colors">
                <Mail className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">دعوة موظف</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                أرسل دعوة بالبريد الإلكتروني لموظف جديد
              </p>
            </CardContent>
          </Card>

          {/* Method 3: Manual */}
          <Card
            className="border-2 border-transparent hover:border-primary/30 cursor-pointer transition-all group"
            onClick={() => { setMethod("manual"); setStep(2); }}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto group-hover:bg-secondary/80 transition-colors">
                <PenLine className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">إضافة يدوية</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                أدخل بيانات الموظف يدوياً بدون ربط بحساب
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 1: Talent Search (for talent method)
  if (method === "talent" && step === 1) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMethod(null)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">البحث عن كادر</h1>
            <p className="text-sm text-muted-foreground">ابحث بالاسم أو اسم المستخدم (@)</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو @اسم_المستخدم..."
            value={talentQuery}
            onChange={(e) => setTalentQuery(e.target.value)}
            className="pr-10 h-12 text-base"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="space-y-2">
          {searchLoading && <p className="text-sm text-muted-foreground text-center py-4">جاري البحث...</p>}
          {talentResults && talentResults.length === 0 && talentQuery.length >= 2 && (
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد نتائج</p>
          )}
          {talentResults?.map((t) => (
            <Card
              key={t.user_id}
              className="border hover:border-primary/30 cursor-pointer transition-all hover:shadow-sm"
              onClick={() => handleSelectTalent(t)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={t.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {(t.full_name || "?").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{t.full_name}</p>
                    {t.username && <span className="text-xs text-primary">@{t.username}</span>}
                  </div>
                  {t.headline && <p className="text-xs text-muted-foreground truncate">{t.headline}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {t.city && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {t.city}
                      </span>
                    )}
                    {t.skills?.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 gap-1">
                  <Check className="h-3.5 w-3.5" />
                  اختيار
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 1 for invite
  if (method === "invite" && step === 1) {
    setStep(2);
  }

  // Step 2: Employment Details Form
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { setStep(1); if (method !== "talent") setMethod(null); }}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            {method === "talent" ? "تفاصيل التوظيف" : method === "invite" ? "دعوة موظف" : "إضافة موظف يدوياً"}
          </h1>
          <p className="text-sm text-muted-foreground">أدخل تفاصيل التوظيف في الجمعية</p>
        </div>
      </div>

      {/* Selected Talent Card */}
      {selectedTalent && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedTalent.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {(selectedTalent.full_name || "?").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{selectedTalent.full_name}</p>
              {selectedTalent.username && <p className="text-xs text-primary">@{selectedTalent.username}</p>}
            </div>
            <Badge className="mr-auto bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0">
              حساب كوادر مرتبط
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            البيانات الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>الجوال</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            تفاصيل الوظيفة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المسمى الوظيفي *</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="مثال: مدير برامج" />
            </div>
            <div className="space-y-2">
              <Label>القسم</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="مثال: البرامج والمشاريع" />
            </div>
            <div className="space-y-2">
              <Label>نوع التوظيف</Label>
              <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as OrgEmployeeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">دوام كامل</SelectItem>
                  <SelectItem value="part_time">دوام جزئي</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                  <SelectItem value="intern">متدرب</SelectItem>
                  <SelectItem value="volunteer">متطوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نمط العمل</Label>
              <Select value={workMode} onValueChange={(v) => setWorkMode(v as OrgWorkMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">حضوري</SelectItem>
                  <SelectItem value="remote">عن بعد</SelectItem>
                  <SelectItem value="hybrid">هجين</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاريخ البداية</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            {managers.length > 0 && (
              <div className="space-y-2">
                <Label>المدير المباشر</Label>
                <Select value={managerId} onValueChange={setManagerId}>
                  <SelectTrigger><SelectValue placeholder="اختر المدير" /></SelectTrigger>
                  <SelectContent>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.full_name} - {m.job_title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unlinked warning for manual */}
      {method === "manual" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--featured))]/10 border border-[hsl(var(--featured))]/20">
          <Unlink className="h-4 w-4 text-[hsl(var(--featured))] shrink-0" />
          <p className="text-xs text-[hsl(var(--featured))]">
            سيتم إضافة الموظف بدون ربط بحساب كوادر. يمكنك ربطه لاحقاً من ملف الموظف.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate("/portal/hr/employees")}>إلغاء</Button>
        <Button
          onClick={handleSubmit}
          disabled={!fullName || !jobTitle || createEmployee.isPending}
          className="gap-2"
        >
          {createEmployee.isPending ? "جاري الحفظ..." : (
            <>
              <UserPlus className="h-4 w-4" />
              {method === "invite" ? "إرسال الدعوة" : "إضافة الموظف"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PortalAddEmployee;
