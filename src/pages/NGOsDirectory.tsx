import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Building2, MapPin, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface NGO {
  id: string;
  name_ar: string;
  slug: string | null;
  logo_url: string | null;
  city: string | null;
  description: string | null;
  website: string | null;
}

const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "أبها", "تبوك", "حائل"];

const NGOsDirectory = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    const fetchNGOs = async () => {
      setLoading(true);
      const query = supabase
        .from("organizations")
        .select("id, name_ar, slug, logo_url, city, description, website")
        .eq("status", "active" as any)
        .order("name_ar") as any;
      
      let q = query.eq("profile_status", "approved");

      if (cityFilter && cityFilter !== "all") {
        q = q.eq("city", cityFilter);
      }
      if (search) {
        q = q.ilike("name_ar", `%${search}%`);
      }

      const { data } = await q;
      setNgos(data || []);
      setLoading(false);
    };
    fetchNGOs();
  }, [search, cityFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-bl from-primary/5 via-background to-accent/5 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-display text-4xl font-black">دليل الجمعيات</h1>
            <p className="mt-3 text-muted-foreground">
              تصفح الجمعيات والمؤسسات غير الربحية المسجلة على منصة كوادر
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم الجمعية..."
                className="ps-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="المدينة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl border bg-muted" />
              ))}
            </div>
          ) : ngos.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">لا توجد جمعيات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ngos.map((ngo) => (
                <Link
                  key={ngo.id}
                  to={`/ngos/${ngo.slug || ngo.id}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted text-xl font-bold text-primary">
                      {ngo.logo_url ? (
                        <img src={ngo.logo_url} alt={ngo.name_ar} className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        ngo.name_ar.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-foreground group-hover:text-primary">
                        {ngo.name_ar}
                      </h3>
                      {ngo.city && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {ngo.city}
                        </div>
                      )}
                      {ngo.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{ngo.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">عرض التفاصيل ←</span>
                    {ngo.website && (
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NGOsDirectory;
