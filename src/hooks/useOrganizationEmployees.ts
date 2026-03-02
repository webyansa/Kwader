import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export type EmployeeStatus = "invited" | "pending_acceptance" | "active" | "inactive" | "terminated";
export type OrgEmployeeType = "full_time" | "part_time" | "contract" | "intern" | "volunteer";
export type OrgWorkMode = "onsite" | "remote" | "hybrid";

export interface OrganizationEmployee {
  id: string;
  organization_id: string;
  user_id: string | null;
  talent_profile_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  national_id_or_iqama: string | null;
  employee_number: string | null;
  job_title: string;
  department: string | null;
  manager_employee_id: string | null;
  employment_type: OrgEmployeeType;
  work_mode: OrgWorkMode;
  start_date: string | null;
  status: EmployeeStatus;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  // joined fields
  talent_avatar?: string | null;
  talent_username?: string | null;
  talent_headline?: string | null;
  talent_skills?: string[] | null;
  manager_name?: string | null;
}

export interface CreateEmployeeData {
  full_name: string;
  email?: string;
  phone?: string;
  job_title: string;
  department?: string;
  employment_type: OrgEmployeeType;
  work_mode: OrgWorkMode;
  start_date?: string;
  status?: EmployeeStatus;
  user_id?: string;
  talent_profile_id?: string;
  manager_employee_id?: string;
  national_id_or_iqama?: string;
}

export function useOrganizationEmployees() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orgId } = useQuery({
    queryKey: ["user-org-id", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.rpc("get_user_org_id", { _user_id: user.id });
      return data as string | null;
    },
    enabled: !!user?.id,
  });

  const employeesQuery = useQuery({
    queryKey: ["organization-employees", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("organization_employees")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with talent profile data
      const enriched: OrganizationEmployee[] = [];
      for (const emp of data || []) {
        let talent_avatar = null;
        let talent_username = null;
        let talent_headline = null;
        let talent_skills: string[] | null = null;

        if (emp.user_id) {
          const { data: tp } = await supabase
            .from("job_seeker_profiles")
            .select("avatar_url, username, headline, skills")
            .eq("user_id", emp.user_id)
            .maybeSingle();
          if (tp) {
            talent_avatar = tp.avatar_url;
            talent_username = tp.username;
            talent_headline = tp.headline;
            talent_skills = tp.skills;
          }
        }

        // Get manager name
        let manager_name: string | null = null;
        if (emp.manager_employee_id) {
          const mgr = (data || []).find((e: any) => e.id === emp.manager_employee_id);
          if (mgr) manager_name = mgr.full_name;
        }

        enriched.push({
          ...emp,
          talent_avatar,
          talent_username,
          talent_headline,
          talent_skills,
          manager_name,
        } as OrganizationEmployee);
      }
      return enriched;
    },
    enabled: !!orgId,
  });

  const createEmployee = useMutation({
    mutationFn: async (data: CreateEmployeeData) => {
      if (!orgId || !user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("organization_employees").insert({
        organization_id: orgId,
        created_by_user_id: user.id,
        full_name: data.full_name,
        email: data.email || null,
        phone: data.phone || null,
        job_title: data.job_title,
        department: data.department || null,
        employment_type: data.employment_type,
        work_mode: data.work_mode,
        start_date: data.start_date || null,
        status: data.status || "active",
        user_id: data.user_id || null,
        talent_profile_id: data.talent_profile_id || null,
        manager_employee_id: data.manager_employee_id || null,
        national_id_or_iqama: data.national_id_or_iqama || null,
      });
      if (error) throw error;

      // Send notification if linked to a talent
      if (data.user_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("name_ar")
          .eq("id", orgId)
          .single();

        await supabase.from("notifications").insert({
          user_id: data.user_id,
          title: `تم توظيفك لدى ${org?.name_ar || "جمعية"}`,
          body: `تم تعيينك بمسمى "${data.job_title}" في ${org?.name_ar}`,
          link: "/talents/dashboard",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-employees"] });
      toast({ title: "تمت إضافة الموظف بنجاح" });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateEmployeeData> & { id: string }) => {
      const { error } = await supabase
        .from("organization_employees")
        .update({ ...data, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-employees"] });
      toast({ title: "تم تحديث بيانات الموظف" });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const stats = {
    total: employeesQuery.data?.filter((e) => e.status === "active").length || 0,
    pending: employeesQuery.data?.filter((e) => ["invited", "pending_acceptance"].includes(e.status)).length || 0,
    unlinked: employeesQuery.data?.filter((e) => !e.user_id && e.status === "active").length || 0,
  };

  return {
    employees: employeesQuery.data || [],
    isLoading: employeesQuery.isLoading,
    stats,
    orgId,
    createEmployee,
    updateEmployee,
  };
}

export function useTalentSearch(query: string) {
  return useQuery({
    queryKey: ["talent-search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const searchTerm = query.startsWith("@") ? query.slice(1) : query;

      const { data, error } = await supabase
        .from("job_seeker_profiles")
        .select("user_id, full_name, username, avatar_url, headline, city, skills")
        .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
  });
}
