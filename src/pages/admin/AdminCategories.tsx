import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, ArrowUp, ArrowDown } from "lucide-react";

const AdminCategories = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!nameAr.trim() || !slug.trim()) throw new Error("الحقول المطلوبة فارغة");
      const payload = { name_ar: nameAr.trim(), name_en: nameEn.trim() || null, slug: slug.trim(), icon: icon.trim() || null };
      if (editingId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const maxOrder = categories?.length ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 0;
        const { error } = await supabase.from("categories").insert({ ...payload, sort_order: maxOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: editingId ? "تم التحديث" : "تمت الإضافة" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("categories").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingId(null);
    setNameAr("");
    setNameEn("");
    setSlug("");
    setIcon("");
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setNameAr(cat.name_ar);
    setNameEn(cat.name_en || "");
    setSlug(cat.slug);
    setIcon(cat.icon || "");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">إدارة التصنيفات</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />إضافة تصنيف</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم بالعربية *</Label>
                <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>الاسم بالإنجليزية</Label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={100} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} required maxLength={50} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>أيقونة (Emoji)</Label>
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={10} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={save.isPending}>
                {save.isPending ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الأيقونة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>مفعّل</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">جارٍ التحميل...</TableCell></TableRow>
            ) : categories?.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="text-lg">{cat.icon || "—"}</TableCell>
                <TableCell className="font-medium">{cat.name_ar}</TableCell>
                <TableCell className="text-sm text-muted-foreground" dir="ltr">{cat.slug}</TableCell>
                <TableCell className="text-sm">{cat.sort_order}</TableCell>
                <TableCell>
                  <Switch checked={cat.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: cat.id, active: v })} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCategories;
