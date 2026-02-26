import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      const payload = {
        name_ar: nameAr.trim(),
        name_en: nameEn.trim() || null,
        slug: slug.trim(),
        icon: icon.trim() || null,
      };
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
      toast({ title: editingId ? "✅ تم التحديث بنجاح" : "✅ تمت الإضافة بنجاح" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("categories").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "✅ تم الحذف بنجاح" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
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

  // Auto-generate slug from Arabic name
  const handleNameArChange = (value: string) => {
    setNameAr(value);
    if (!editingId) {
      const autoSlug = value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\u0621-\u064Aa-z0-9-]/g, "");
      setSlug(autoSlug);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">إدارة التصنيفات</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{categories?.length ?? 0} تصنيف</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />إضافة تصنيف
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم بالعربية *</Label>
                <Input value={nameAr} onChange={(e) => handleNameArChange(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>الاسم بالإنجليزية</Label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={100} dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} required maxLength={50} dir="ltr" className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label>أيقونة (Emoji)</Label>
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={10} className="text-center text-lg" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={save.isPending}>
                {save.isPending ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold w-12">الأيقونة</TableHead>
                <TableHead className="font-bold">الاسم بالعربية</TableHead>
                <TableHead className="font-bold">الاسم بالإنجليزية</TableHead>
                <TableHead className="font-bold">Slug</TableHead>
                <TableHead className="font-bold text-center">الترتيب</TableHead>
                <TableHead className="font-bold text-center">مفعّل</TableHead>
                <TableHead className="font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    لا توجد تصنيفات
                  </TableCell>
                </TableRow>
              ) : categories?.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-xl text-center">{cat.icon || "📁"}</TableCell>
                  <TableCell className="font-medium text-sm">{cat.name_ar}</TableCell>
                  <TableCell className="text-sm text-muted-foreground" dir="ltr">{cat.name_en || "—"}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono" dir="ltr">{cat.slug}</code>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">{cat.sort_order}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={cat.is_active}
                      onCheckedChange={(v) => toggleActive.mutate({ id: cat.id, active: v })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)} title="تعديل">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
                            deleteCategory.mutate(cat.id);
                          }
                        }}
                        title="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminCategories;
