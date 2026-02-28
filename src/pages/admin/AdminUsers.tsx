import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserRow {
  user_id: string;
  full_name: string | null;
  status: string;
  created_at: string;
  roles: string[];
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, status, created_at")
      .order("created_at", { ascending: false });

    if (!profiles) { setLoading(false); return; }

    // Fetch all roles
    const { data: allRoles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const roleMap: Record<string, string[]> = {};
    allRoles?.forEach((r) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    const combined: UserRow[] = profiles.map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      status: p.status,
      created_at: p.created_at,
      roles: roleMap[p.user_id] || [],
    }));

    setUsers(combined);
    setLoading(false);
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "مدير أعلى",
      admin: "مدير",
      moderator: "محرر",
      org_owner: "مالك جمعية",
      org_hr_manager: "مدير توظيف",
      org_viewer: "مشاهد",
      job_seeker: "باحث عن وظيفة",
      finance: "مالية",
      support: "دعم",
    };
    return map[role] || role;
  };

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نشط</Badge>;
    if (status === "suspended") return <Badge variant="destructive">موقوف</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const filtered = users.filter((u) =>
    !search || u.full_name?.includes(search) || u.user_id.includes(search) || u.roles.some((r) => r.includes(search))
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
        </div>
        <Badge variant="secondary">{users.length} مستخدم</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو الدور..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الأدوار</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ التسجيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0
                        ? user.roles.map((r) => (
                            <Badge key={r} variant="outline" className="text-xs">{roleLabel(r)}</Badge>
                          ))
                        : <span className="text-xs text-muted-foreground">بدون دور</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد نتائج</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
