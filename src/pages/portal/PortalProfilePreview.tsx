import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Globe, Mail, Phone, Eye, Calendar, Shield, Target, Heart } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">معاينة الملف</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/portal/profile"><ArrowRight className="ml-1.5 h-3.5 w-3.5" /> العودة للتعديل</Link>
        </Button>
      </div>

      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="py-3 text-center text-xs text-muted-foreground">
          هذه معاينة تقريبية لشكل ملف الجمعية كما سيظهر في دليل الجمعيات
        </CardContent>
      </Card>

      {/* Hero */}
      <div className="rounded-xl border bg-card p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border bg-muted text-3xl font-bold text-primary overflow-hidden">
            {org.logo_url ? <img src={org.logo_url} alt={org.name_ar} className="h-full w-full object-cover" /> : org.name_ar?.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-3xl font-black text-foreground">{org.name_ar}</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {org.city && <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {org.city}{org.region ? ` - ${org.region}` : ""}</span>}
              {org.website && <a href={org.website} className="inline-flex items-center gap-1 text-sm text-primary"><Globe className="h-4 w-4" /> الموقع</a>}
              {org.email && <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> {org.email}</span>}
              {org.phone && <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> {org.phone}</span>}
            </div>
          </div>
        </div>
        {org.short_description && <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{org.short_description}</p>}
      </div>

      {/* About */}
      {org.long_description && (
        <Card>
          <CardHeader><CardTitle className="text-base">عن الجمعية</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{org.long_description}</p></CardContent>
        </Card>
      )}

      {/* Vision & Mission */}
      {(org.vision || org.mission) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {org.vision && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> الرؤية</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{org.vision}</p></CardContent>
            </Card>
          )}
          {org.mission && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> الرسالة</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{org.mission}</p></CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Values & Programs */}
      {(org.org_values?.length > 0 || org.programs?.length > 0) && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {org.org_values?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">القيم</p>
                <div className="flex flex-wrap gap-2">{org.org_values.map((v: string, i: number) => <Badge key={i} variant="secondary">{v}</Badge>)}</div>
              </div>
            )}
            {org.programs?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">البرامج والمبادرات</p>
                <div className="flex flex-wrap gap-2">{org.programs.map((v: string, i: number) => <Badge key={i} variant="outline">{v}</Badge>)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Governance */}
      {(org.license_number || org.founding_year || org.supervisor_entity) && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> بيانات الحوكمة</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              {org.license_number && <div><span className="text-muted-foreground">رقم الترخيص:</span> <span className="font-medium">{org.license_number}</span></div>}
              {org.founding_year && <div><span className="text-muted-foreground">سنة التأسيس:</span> <span className="font-medium">{org.founding_year}</span></div>}
              {org.supervisor_entity && <div><span className="text-muted-foreground">جهة الإشراف:</span> <span className="font-medium">{org.supervisor_entity}</span></div>}
              {org.work_scope && <div><span className="text-muted-foreground">نطاق العمل:</span> <span className="font-medium">{org.work_scope}</span></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Culture */}
      {(org.why_work_with_us || org.benefits?.length > 0) && (
        <Card>
          <CardHeader><CardTitle className="text-base">ثقافة العمل</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {org.why_work_with_us && <p className="text-sm text-muted-foreground">{org.why_work_with_us}</p>}
            {org.work_environment && <div className="text-sm"><span className="text-muted-foreground">بيئة العمل:</span> <Badge variant="secondary">{org.work_environment}</Badge></div>}
            {org.benefits?.length > 0 && (
              <div className="flex flex-wrap gap-2">{org.benefits.map((b: string, i: number) => <Badge key={i} variant="outline">{b}</Badge>)}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortalProfilePreview;
