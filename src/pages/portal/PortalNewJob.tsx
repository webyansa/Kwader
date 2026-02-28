import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Save, Send, Briefcase, MapPin, Clock, DollarSign, FileText, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const sections = [
  { id: "basic", label: "الأساسية", icon: Briefcase },
  { id: "details", label: "التفاصيل", icon: FileText },
  { id: "requirements", label: "المتطلبات", icon: Users },
  { id: "compensation", label: "المزايا", icon: DollarSign },
];

const PortalNewJob = () => {
  const [activeSection, setActiveSection] = useState("basic");
  const [form, setForm] = useState({
    title: "", city: "", employment_type: "", experience_level: "", remote_type: "",
    description: "", responsibilities: "", requirements: "",
    salary_min: "", salary_max: "", salary_visible: true,
    application_method: "internal_form", closing_date: "",
  });

  const sectionIdx = sections.findIndex(s => s.id === activeSection);
  const progress = ((sectionIdx + 1) / sections.length) * 100;

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-lg" asChild>
            <Link to="/portal/jobs"><ArrowRight className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">نشر وظيفة جديدة</h1>
            <p className="text-xs text-muted-foreground mt-0.5">أضف تفاصيل الوظيفة وأرسلها للمراجعة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
            <Save className="h-3.5 w-3.5" /> حفظ كمسودة
          </Button>
          <Button size="sm" className="rounded-lg gap-1.5">
            <Send className="h-3.5 w-3.5" /> إرسال للمراجعة
          </Button>
        </div>
      </div>

      {/* Section Progress */}
      <div className="flex items-center gap-1">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg transition-all ${
              s.id === activeSection ? "bg-primary text-primary-foreground shadow-sm" :
              i < sectionIdx ? "bg-primary/10 text-primary" :
              "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardContent className="p-6 space-y-5">
              {activeSection === "basic" && (
                <>
                  <div>
                    <Label className="text-xs font-medium">المسمى الوظيفي *</Label>
                    <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="مثال: مدير مشاريع" className="mt-1.5 rounded-lg" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-medium">المدينة *</Label>
                      <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="الرياض" className="mt-1.5 rounded-lg" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">نوع الدوام *</Label>
                      <Select value={form.employment_type} onValueChange={v => update("employment_type", v)}>
                        <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">دوام كامل</SelectItem>
                          <SelectItem value="part_time">دوام جزئي</SelectItem>
                          <SelectItem value="contract">عقد مؤقت</SelectItem>
                          <SelectItem value="intern">تدريب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">مستوى الخبرة *</Label>
                      <Select value={form.experience_level} onValueChange={v => update("experience_level", v)}>
                        <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">مبتدئ</SelectItem>
                          <SelectItem value="mid">متوسط</SelectItem>
                          <SelectItem value="senior">خبير</SelectItem>
                          <SelectItem value="any">غير محدد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">نوع العمل</Label>
                      <Select value={form.remote_type} onValueChange={v => update("remote_type", v)}>
                        <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder="اختر" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="onsite">حضوري</SelectItem>
                          <SelectItem value="remote">عن بعد</SelectItem>
                          <SelectItem value="hybrid">هجين</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">تاريخ الإغلاق</Label>
                    <Input type="date" value={form.closing_date} onChange={e => update("closing_date", e.target.value)} className="mt-1.5 rounded-lg max-w-xs" dir="ltr" />
                  </div>
                </>
              )}

              {activeSection === "details" && (
                <>
                  <div>
                    <Label className="text-xs font-medium">وصف الوظيفة *</Label>
                    <Textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="اكتب وصفاً شاملاً للوظيفة..." className="mt-1.5 rounded-lg" rows={6} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">المهام والمسؤوليات</Label>
                    <Textarea value={form.responsibilities} onChange={e => update("responsibilities", e.target.value)} placeholder="اذكر المهام الرئيسية..." className="mt-1.5 rounded-lg" rows={5} />
                  </div>
                </>
              )}

              {activeSection === "requirements" && (
                <div>
                  <Label className="text-xs font-medium">المتطلبات والمؤهلات</Label>
                  <Textarea value={form.requirements} onChange={e => update("requirements", e.target.value)} placeholder="المؤهلات والخبرات المطلوبة..." className="mt-1.5 rounded-lg" rows={8} />
                </div>
              )}

              {activeSection === "compensation" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-medium">الحد الأدنى للراتب</Label>
                      <Input type="number" value={form.salary_min} onChange={e => update("salary_min", e.target.value)} placeholder="5000" className="mt-1.5 rounded-lg" dir="ltr" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">الحد الأقصى للراتب</Label>
                      <Input type="number" value={form.salary_max} onChange={e => update("salary_max", e.target.value)} placeholder="15000" className="mt-1.5 rounded-lg" dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">طريقة التقديم</Label>
                    <Select value={form.application_method} onValueChange={v => update("application_method", v)}>
                      <SelectTrigger className="mt-1.5 rounded-lg max-w-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal_form">نموذج المنصة</SelectItem>
                        <SelectItem value="external_url">رابط خارجي</SelectItem>
                        <SelectItem value="email">بريد إلكتروني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Section navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="rounded-lg gap-1.5"
                  disabled={sectionIdx === 0}
                  onClick={() => setActiveSection(sections[sectionIdx - 1]?.id)}
                >
                  <ArrowRight className="h-4 w-4" /> السابق
                </Button>
                {sectionIdx < sections.length - 1 ? (
                  <Button className="rounded-lg gap-1.5" onClick={() => setActiveSection(sections[sectionIdx + 1]?.id)}>
                    التالي <span className="hidden sm:inline">— {sections[sectionIdx + 1]?.label}</span>
                  </Button>
                ) : (
                  <Button className="rounded-lg gap-1.5">
                    <Send className="h-4 w-4" /> إرسال للمراجعة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">معاينة الإعلان</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">{form.title || "المسمى الوظيفي"}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {form.city && <Badge variant="secondary" className="rounded-full text-[10px] gap-1"><MapPin className="h-3 w-3" />{form.city}</Badge>}
                    {form.employment_type && <Badge variant="secondary" className="rounded-full text-[10px] gap-1"><Clock className="h-3 w-3" />{form.employment_type === "full_time" ? "دوام كامل" : form.employment_type === "part_time" ? "جزئي" : form.employment_type === "contract" ? "عقد" : "تدريب"}</Badge>}
                    {form.salary_min && <Badge variant="secondary" className="rounded-full text-[10px] gap-1"><DollarSign className="h-3 w-3" />{form.salary_min}{form.salary_max ? ` - ${form.salary_max}` : ""} ر.س</Badge>}
                  </div>
                  {form.description && <p className="text-xs text-muted-foreground line-clamp-4">{form.description}</p>}
                </div>
              </CardContent>
            </Card>
            <p className="text-[10px] text-muted-foreground text-center">هذه معاينة تقريبية لشكل الإعلان</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PortalNewJob;
