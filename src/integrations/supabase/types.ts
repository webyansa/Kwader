export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          cv_file_url: string | null
          email: string
          full_name: string
          id: string
          job_id: string
          notes_internal: string | null
          phone: string | null
          portfolio_url: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          cv_file_url?: string | null
          email: string
          full_name: string
          id?: string
          job_id: string
          notes_internal?: string | null
          phone?: string | null
          portfolio_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          cv_file_url?: string | null
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          notes_internal?: string | null
          phone?: string | null
          portfolio_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string | null
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_seeker_profiles: {
        Row: {
          certifications: string | null
          city: string | null
          created_at: string
          cv_file_url: string | null
          education: string | null
          experience_level: string | null
          full_name: string | null
          id: string
          job_preferences: Json | null
          linkedin_url: string | null
          nationality: string | null
          portfolio_url: string | null
          profile_completion_percentage: number | null
          skills: string[] | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?: string | null
          city?: string | null
          created_at?: string
          cv_file_url?: string | null
          education?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          job_preferences?: Json | null
          linkedin_url?: string | null
          nationality?: string | null
          portfolio_url?: string | null
          profile_completion_percentage?: number | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?: string | null
          city?: string | null
          created_at?: string
          cv_file_url?: string | null
          education?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          job_preferences?: Json | null
          linkedin_url?: string | null
          nationality?: string | null
          portfolio_url?: string | null
          profile_completion_percentage?: number | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_email: string | null
          application_method: Database["public"]["Enums"]["application_method"]
          application_url: string | null
          boost_until: string | null
          category_id: string | null
          city: string | null
          clicks_count: number
          closing_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          is_featured: boolean
          is_urgent: boolean
          moderation_notes: string | null
          org_id: string
          published_at: string | null
          remote_type: Database["public"]["Enums"]["remote_type"]
          requirements: string | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          salary_visible: boolean
          status: Database["public"]["Enums"]["job_status"]
          subcategory_id: string | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          application_email?: string | null
          application_method?: Database["public"]["Enums"]["application_method"]
          application_url?: string | null
          boost_until?: string | null
          category_id?: string | null
          city?: string | null
          clicks_count?: number
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_featured?: boolean
          is_urgent?: boolean
          moderation_notes?: string | null
          org_id: string
          published_at?: string | null
          remote_type?: Database["public"]["Enums"]["remote_type"]
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_visible?: boolean
          status?: Database["public"]["Enums"]["job_status"]
          subcategory_id?: string | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          application_email?: string | null
          application_method?: Database["public"]["Enums"]["application_method"]
          application_url?: string | null
          boost_until?: string | null
          category_id?: string | null
          city?: string | null
          clicks_count?: number
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_featured?: boolean
          is_urgent?: boolean
          moderation_notes?: string | null
          org_id?: string
          published_at?: string | null
          remote_type?: Database["public"]["Enums"]["remote_type"]
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_visible?: boolean
          status?: Database["public"]["Enums"]["job_status"]
          subcategory_id?: string | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          license_number: string | null
          logo_url: string | null
          name_ar: string
          name_en: string | null
          owner_user_id: string | null
          phone: string | null
          plan_id: string | null
          region: string | null
          slug: string | null
          social_links: Json | null
          status: Database["public"]["Enums"]["org_status"]
          subscription_end_date: string | null
          subscription_status: Database["public"]["Enums"]["org_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name_ar: string
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          plan_id?: string | null
          region?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["org_status"]
          subscription_end_date?: string | null
          subscription_status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name_ar?: string
          name_en?: string | null
          owner_user_id?: string | null
          phone?: string | null
          plan_id?: string | null
          region?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["org_status"]
          subscription_end_date?: string | null
          subscription_status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          ad_duration_days: number
          advanced_reports: boolean
          boost_available: boolean
          created_at: string
          featured_count: number
          id: string
          is_active: boolean
          jobs_per_month: number
          name_ar: string
          name_en: string | null
          price_monthly: number
          price_yearly: number
          seats: number
          show_logo_on_card: boolean
          sort_order: number
          updated_at: string
          urgent_count: number
        }
        Insert: {
          ad_duration_days?: number
          advanced_reports?: boolean
          boost_available?: boolean
          created_at?: string
          featured_count?: number
          id?: string
          is_active?: boolean
          jobs_per_month?: number
          name_ar: string
          name_en?: string | null
          price_monthly?: number
          price_yearly?: number
          seats?: number
          show_logo_on_card?: boolean
          sort_order?: number
          updated_at?: string
          urgent_count?: number
        }
        Update: {
          ad_duration_days?: number
          advanced_reports?: boolean
          boost_available?: boolean
          created_at?: string
          featured_count?: number
          id?: string
          is_active?: boolean
          jobs_per_month?: number
          name_ar?: string
          name_en?: string | null
          price_monthly?: number
          price_yearly?: number
          seats?: number
          show_logo_on_card?: boolean
          sort_order?: number
          updated_at?: string
          urgent_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          entity_id: string
          entity_type: string
          id: string
          reason: string
          reporter_email: string
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          entity_id: string
          entity_type: string
          id?: string
          reason: string
          reporter_email: string
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string
          reporter_email?: string
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          org_id: string
          plan_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          org_id: string
          plan_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          org_id?: string
          plan_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_organization: { Args: { _org_id: string }; Returns: undefined }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_any_admin_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_job_seeker: {
        Args: { _city?: string; _full_name?: string }
        Returns: undefined
      }
      register_organization: {
        Args: {
          _city?: string
          _email?: string
          _license_number?: string
          _name_ar: string
          _phone?: string
          _plan_id: string
          _website?: string
        }
        Returns: string
      }
      reject_organization: {
        Args: { _org_id: string; _reason?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "moderator"
        | "finance"
        | "support"
        | "org_owner"
        | "org_hr_manager"
        | "org_viewer"
        | "job_seeker"
      application_method: "internal_form" | "external_url" | "email"
      application_status:
        | "new"
        | "reviewed"
        | "shortlisted"
        | "rejected"
        | "hired"
      employment_type: "full_time" | "part_time" | "contract" | "intern"
      experience_level: "junior" | "mid" | "senior" | "any"
      job_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "published"
        | "expired"
        | "archived"
        | "suspended"
      org_status: "pending" | "active" | "suspended"
      remote_type: "onsite" | "remote" | "hybrid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "moderator",
        "finance",
        "support",
        "org_owner",
        "org_hr_manager",
        "org_viewer",
        "job_seeker",
      ],
      application_method: ["internal_form", "external_url", "email"],
      application_status: [
        "new",
        "reviewed",
        "shortlisted",
        "rejected",
        "hired",
      ],
      employment_type: ["full_time", "part_time", "contract", "intern"],
      experience_level: ["junior", "mid", "senior", "any"],
      job_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "published",
        "expired",
        "archived",
        "suspended",
      ],
      org_status: ["pending", "active", "suspended"],
      remote_type: ["onsite", "remote", "hybrid"],
    },
  },
} as const
