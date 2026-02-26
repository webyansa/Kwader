import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobFiltersState {
  search: string;
  city: string;
  categoryId: string;
  employmentType: string;
  remoteType: string;
  experienceLevel: string;
  urgentOnly: boolean;
  featuredOnly: boolean;
}

export const defaultFilters: JobFiltersState = {
  search: "",
  city: "",
  categoryId: "",
  employmentType: "",
  remoteType: "",
  experienceLevel: "",
  urgentOnly: false,
  featuredOnly: false,
};

export const useJobs = (filters: JobFiltersState) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, slug), categories!jobs_category_id_fkey(name_ar, slug)")
        .eq("status", "published")
        .order("is_urgent", { ascending: false })
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false });

      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters.employmentType) {
        query = query.eq("employment_type", filters.employmentType as any);
      }
      if (filters.remoteType) {
        query = query.eq("remote_type", filters.remoteType as any);
      }
      if (filters.experienceLevel) {
        query = query.eq("experience_level", filters.experienceLevel as any);
      }
      if (filters.urgentOnly) {
        query = query.eq("is_urgent", true);
      }
      if (filters.featuredOnly) {
        query = query.eq("is_featured", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, organizations(name_ar, logo_url, slug, city, email, website), categories!jobs_category_id_fkey(name_ar, slug)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
};
