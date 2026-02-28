import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Globe, Mail, Phone, Eye, Shield, Target, Heart, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const PortalProfilePreview = () => {
  const { orgId } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    supabase.from("organizations").select("*").eq("id", orgId).single().then(({ data }) => {
      setOrg(data);
      setLoading(false);
    });
  }, [orgId]);

  if (loading || !org) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">معاينة الملف</h1>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5" asChild>
          <Link to="/portal/profile"><ArrowLeft className="h-3.5 w-3.5" /> العودة للتعديل</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] p-3 text-center text-xs text-muted-foreground">
        هذه معاينة تقريبية لشكل ملف الجمعية كما سيظهر للكوادر في دليل الجمعيات
      </div>

      {/* Hero */}
      <Card className="border-border/60 overflow-hidden">
        <div className="h-24 bg-gradient-to-l from-primary/5 to-primary/10" />
        <CardContent className="p-6 -mt-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-card shadow-sm text-3xl font-bold text-primary overflow-hidden">
              {org.logo_url ? <img src={org.logo_url} alt={org.name_ar} className="h-full w-full object-cover" /> : org.name_ar?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-black text-foreground">{org.name_ar}</h2>
              <div className="mt-2 flex flex-wrap gap-3">
                {org.city && <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {org.city}{org.region ? ` - ${org.region}` : ""}</span>}
                {org.website && <a href={org.website} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><Globe className="h-3.5 w-3.5" /> الموقع</a>}
                {org.email && <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {org.email}</span>}
                {org.phone && <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {org.phone}</span>}
              </div>
            </div>
          </div>
          {org.short_description && <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{org.short_description}</p>}
        </CardContent>
      </Card>

      {/* About */}
      {org.long_description && (
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-3">عن الجمعية</h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{org.long_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Vision & Mission */}
      {(org.vision || org.mission) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {org.vision && (
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">الرؤية</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{org.vision}</p>
              </CardContent>
            </Card>
          )}
          {org.mission && (
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">الرسالة</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{org.mission}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Values & Programs */}
      {(org.org_values?.length > 0 || org.programs?.length > 0) && (
        <Card className="border-border/60">
          <CardContent className="p-6 space-y-4">
            {org.org_values?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-foreground mb-2">القيم</p>
                <div className="flex flex-wrap gap-1.5">{org.org_values.map((v: string, i: number) => <Badge key={i} variant="secondary" className="rounded-full px-3 text-xs">{v}</Badge>)}</div>
              </div>
            )}
            {org.programs?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-foreground mb-2">البرامج والمبادرات</p>
                <div className="flex flex-wrap gap-1.5">{org.programs.map((v: string, i: number) => <Badge key={i} variant="outline" className="rounded-full px-3 text-xs">{v}</Badge>)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Governance */}
      {(org.license_number || org.founding_year || org.supervisor_entity) && (
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">بيانات الحوكمة</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              {org.license_number && <div><span className="text-xs text-muted-foreground">رقم الترخيص</span><p className="font-medium">{org.license_number}</p></div>}
              {org.founding_year && <div><span className="text-xs text-muted-foreground">سنة التأسيس</span><p className="font-medium">{org.founding_year}</p></div>}
              {org.supervisor_entity && <div><span className="text-xs text-muted-foreground">جهة الإشراف</span><p className="font-medium">{org.supervisor_entity}</p></div>}
              {org.work_scope && <div><span className="text-xs text-muted-foreground">نطاق العمل</span><p className="font-medium">{org.work_scope}</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Culture */}
      {(org.why_work_with_us || org.benefits?.length > 0) && (
        <Card className="border-border/60">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">ثقافة العمل</h3>
            </div>
            {org.why_work_with_us && <p className="text-sm text-muted-foreground leading-relaxed">{org.why_work_with_us}</p>}
            {org.work_environment && <div className="text-sm"><span className="text-xs text-muted-foreground ml-2">بيئة العمل:</span><Badge variant="secondary" className="rounded-full text-xs">{org.work_environment}</Badge></div>}
            {org.benefits?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">{org.benefits.map((b: string, i: number) => <Badge key={i} variant="outline" className="rounded-full text-xs px-3">{b}</Badge>)}</div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default PortalProfilePreview;
