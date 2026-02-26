import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";
import { JobFiltersState, defaultFilters, useCategories } from "@/hooks/useJobs";

interface JobFiltersProps {
  filters: JobFiltersState;
  onChange: (filters: JobFiltersState) => void;
}

const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك", "حائل", "نجران"];

const JobFilters = ({ filters, onChange }: JobFiltersProps) => {
  const { data: categories } = useCategories();

  const update = (partial: Partial<JobFiltersState>) => onChange({ ...filters, ...partial });
  const reset = () => onChange(defaultFilters);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث بالمسمى الوظيفي..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pr-10"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">المدينة</Label>
        <Select value={filters.city} onValueChange={(v) => update({ city: v === "all" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="جميع المدن" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المدن</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">التصنيف</Label>
        <Select value={filters.categoryId} onValueChange={(v) => update({ categoryId: v === "all" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="جميع التصنيفات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التصنيفات</SelectItem>
            {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_ar}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">نوع العمل</Label>
        <Select value={filters.employmentType} onValueChange={(v) => update({ employmentType: v === "all" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="full_time">دوام كامل</SelectItem>
            <SelectItem value="part_time">دوام جزئي</SelectItem>
            <SelectItem value="contract">عقد</SelectItem>
            <SelectItem value="intern">تدريب</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">نمط العمل</Label>
        <Select value={filters.remoteType} onValueChange={(v) => update({ remoteType: v === "all" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="onsite">حضوري</SelectItem>
            <SelectItem value="remote">عن بُعد</SelectItem>
            <SelectItem value="hybrid">هجين</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">مستوى الخبرة</Label>
        <Select value={filters.experienceLevel} onValueChange={(v) => update({ experienceLevel: v === "all" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="junior">مبتدئ</SelectItem>
            <SelectItem value="mid">متوسط</SelectItem>
            <SelectItem value="senior">خبير</SelectItem>
            <SelectItem value="any">أي مستوى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="urgent" checked={filters.urgentOnly} onCheckedChange={(c) => update({ urgentOnly: !!c })} />
          <Label htmlFor="urgent" className="text-sm cursor-pointer">عاجلة فقط</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="featured" checked={filters.featuredOnly} onCheckedChange={(c) => update({ featuredOnly: !!c })} />
          <Label htmlFor="featured" className="text-sm cursor-pointer">مميزة فقط</Label>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={reset} className="w-full gap-2">
        <X className="h-3.5 w-3.5" />
        إعادة تعيين الفلاتر
      </Button>
    </div>
  );
};

export default JobFilters;
