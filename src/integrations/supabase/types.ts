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
      contact_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          sender_email: string
          sender_name: string
          sender_phone: string | null
          sender_type: string
          sender_user_id: string | null
          status: string
          subject: string | null
          talent_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          sender_type?: string
          sender_user_id?: string | null
          status?: string
          subject?: string | null
          talent_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          sender_type?: string
          sender_user_id?: string | null
          status?: string
          subject?: string | null
          talent_user_id?: string
        }
        Relationships: []
      }
      cv_exports: {
        Row: {
          created_at: string
          file_type: string
          file_url: string | null
          id: string
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          template_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          template_id?: string
          user_id?: string
        }
        Relationships: []
      }
      employee_invites: {
        Row: {
          created_at: string
          employee_id: string | null
          expires_at: string
          id: string
          invitee_email: string
          invitee_name: string
          invitee_phone: string | null
          organization_id: string
          role_in_org: Database["public"]["Enums"]["org_member_role"]
          status: Database["public"]["Enums"]["invite_status"]
          token: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          expires_at?: string
          id?: string
          invitee_email: string
          invitee_name: string
          invitee_phone?: string | null
          organization_id: string
          role_in_org?: Database["public"]["Enums"]["org_member_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          expires_at?: string
          id?: string
          invitee_email?: string
          invitee_name?: string
          invitee_phone?: string | null
          organization_id?: string
          role_in_org?: Database["public"]["Enums"]["org_member_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_invites_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "organization_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_type: string
          city: string | null
          cover_letter: string | null
          cover_message: string | null
          created_at: string
          created_by_user_id: string
          cv_file_url: string
          email: string
          full_name: string
          guest_email: string | null
          guest_full_name: string | null
          guest_mobile: string | null
          id: string
          job_id: string
          notes_internal: string | null
          organization_id: string
          phone: string | null
          portfolio_url: string | null
          screening_answers: Json | null
          source: string
          status: Database["public"]["Enums"]["application_status"]
          talent_user_id: string | null
          updated_at: string
        }
        Insert: {
          applicant_type?: string
          city?: string | null
          cover_letter?: string | null
          cover_message?: string | null
          created_at?: string
          created_by_user_id: string
          cv_file_url: string
          email: string
          full_name: string
          guest_email?: string | null
          guest_full_name?: string | null
          guest_mobile?: string | null
          id?: string
          job_id: string
          notes_internal?: string | null
          organization_id: string
          phone?: string | null
          portfolio_url?: string | null
          screening_answers?: Json | null
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          talent_user_id?: string | null
          updated_at?: string
        }
        Update: {
          applicant_type?: string
          city?: string | null
          cover_letter?: string | null
          cover_message?: string | null
          created_at?: string
          created_by_user_id?: string
          cv_file_url?: string
          email?: string
          full_name?: string
          guest_email?: string | null
          guest_full_name?: string | null
          guest_mobile?: string | null
          id?: string
          job_id?: string
          notes_internal?: string | null
          organization_id?: string
          phone?: string | null
          portfolio_url?: string | null
          screening_answers?: Json | null
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          talent_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_seeker_profiles: {
        Row: {
          allow_contact_requests: boolean
          allow_cv_download: boolean
          allow_cv_public_view: boolean
          available_for_work: boolean
          avatar_url: string | null
          certifications: string | null
          city: string | null
          created_at: string
          cv_file_url: string | null
          education: string | null
          experience_level: string | null
          experiences: Json | null
          full_name: string | null
          headline: string | null
          hide_contact: boolean
          id: string
          job_preferences: Json | null
          linkedin_url: string | null
          nationality: string | null
          portfolio_url: string | null
          privacy: string
          profile_completion_percentage: number | null
          projects: Json | null
          skills: string[] | null
          summary: string | null
          updated_at: string
          user_id: string
          username: string | null
          volunteering: Json | null
        }
        Insert: {
          allow_contact_requests?: boolean
          allow_cv_download?: boolean
          allow_cv_public_view?: boolean
          available_for_work?: boolean
          avatar_url?: string | null
          certifications?: string | null
          city?: string | null
          created_at?: string
          cv_file_url?: string | null
          education?: string | null
          experience_level?: string | null
          experiences?: Json | null
          full_name?: string | null
          headline?: string | null
          hide_contact?: boolean
          id?: string
          job_preferences?: Json | null
          linkedin_url?: string | null
          nationality?: string | null
          portfolio_url?: string | null
          privacy?: string
          profile_completion_percentage?: number | null
          projects?: Json | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          volunteering?: Json | null
        }
        Update: {
          allow_contact_requests?: boolean
          allow_cv_download?: boolean
          allow_cv_public_view?: boolean
          available_for_work?: boolean
          avatar_url?: string | null
          certifications?: string | null
          city?: string | null
          created_at?: string
          cv_file_url?: string | null
          education?: string | null
          experience_level?: string | null
          experiences?: Json | null
          full_name?: string | null
          headline?: string | null
          hide_contact?: boolean
          id?: string
          job_preferences?: Json | null
          linkedin_url?: string | null
          nationality?: string | null
          portfolio_url?: string | null
          privacy?: string
          profile_completion_percentage?: number | null
          projects?: Json | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          volunteering?: Json | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_email: string | null
          application_method: Database["public"]["Enums"]["application_method"]
          application_url: string | null
          benefits: string[] | null
          boost_until: string | null
          category_id: string | null
          city: string | null
          clicks_count: number
          closing_date: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          education: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_level: Database["public"]["Enums"]["experience_level"]
          experience_years_max: number | null
          experience_years_min: number | null
          id: string
          is_featured: boolean
          is_urgent: boolean
          languages: Json | null
          moderation_notes: string | null
          org_id: string
          published_at: string | null
          remote_type: Database["public"]["Enums"]["remote_type"]
          requirements: string | null
          responsibilities: string | null
          salary_display: string | null
          salary_max: number | null
          salary_min: number | null
          salary_visible: boolean
          screening_questions: Json | null
          short_id: string | null
          skills: string[] | null
          slug_ar: string | null
          slug_unique: string | null
          status: Database["public"]["Enums"]["job_status"]
          subcategory_id: string | null
          summary: string | null
          title: string
          updated_at: string
          vacancies: number | null
          views_count: number
        }
        Insert: {
          application_email?: string | null
          application_method?: Database["public"]["Enums"]["application_method"]
          application_url?: string | null
          benefits?: string[] | null
          boost_until?: string | null
          category_id?: string | null
          city?: string | null
          clicks_count?: number
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          education?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_level?: Database["public"]["Enums"]["experience_level"]
          experience_years_max?: number | null
          experience_years_min?: number | null
          id?: string
          is_featured?: boolean
          is_urgent?: boolean
          languages?: Json | null
          moderation_notes?: string | null
          org_id: string
          published_at?: string | null
          remote_type?: Database["public"]["Enums"]["remote_type"]
          requirements?: string | null
          responsibilities?: string | null
          salary_display?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_visible?: boolean
          screening_questions?: Json | null
          short_id?: string | null
          skills?: string[] | null
          slug_ar?: string | null
          slug_unique?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          subcategory_id?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          vacancies?: number | null
          views_count?: number
        }
        Update: {
          application_email?: string | null
          application_method?: Database["public"]["Enums"]["application_method"]
          application_url?: string | null
          benefits?: string[] | null
          boost_until?: string | null
          category_id?: string | null
          city?: string | null
          clicks_count?: number
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          education?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_level?: Database["public"]["Enums"]["experience_level"]
          experience_years_max?: number | null
          experience_years_min?: number | null
          id?: string
          is_featured?: boolean
          is_urgent?: boolean
          languages?: Json | null
          moderation_notes?: string | null
          org_id?: string
          published_at?: string | null
          remote_type?: Database["public"]["Enums"]["remote_type"]
          requirements?: string | null
          responsibilities?: string | null
          salary_display?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_visible?: boolean
          screening_questions?: Json | null
          short_id?: string | null
          skills?: string[] | null
          slug_ar?: string | null
          slug_unique?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          subcategory_id?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          vacancies?: number | null
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
      messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message_text: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message_text: string
          sender_id: string
          thread_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message_text?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "messages_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_threads: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          last_message_at: string
          participant_one_id: string
          participant_two_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string
          participant_one_id: string
          participant_two_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string
          participant_one_id?: string
          participant_two_id?: string
        }
        Relationships: []
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
      organization_employees: {
        Row: {
          created_at: string
          created_by_user_id: string
          department: string | null
          email: string | null
          employee_number: string | null
          employment_type: Database["public"]["Enums"]["org_employee_type"]
          full_name: string
          id: string
          job_title: string
          manager_employee_id: string | null
          national_id_or_iqama: string | null
          organization_id: string
          phone: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["employee_status"]
          talent_profile_id: string | null
          updated_at: string
          user_id: string | null
          work_mode: Database["public"]["Enums"]["org_work_mode"]
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          department?: string | null
          email?: string | null
          employee_number?: string | null
          employment_type?: Database["public"]["Enums"]["org_employee_type"]
          full_name: string
          id?: string
          job_title?: string
          manager_employee_id?: string | null
          national_id_or_iqama?: string | null
          organization_id: string
          phone?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          talent_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
          work_mode?: Database["public"]["Enums"]["org_work_mode"]
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          department?: string | null
          email?: string | null
          employee_number?: string | null
          employment_type?: Database["public"]["Enums"]["org_employee_type"]
          full_name?: string
          id?: string
          job_title?: string
          manager_employee_id?: string | null
          national_id_or_iqama?: string | null
          organization_id?: string
          phone?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          talent_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
          work_mode?: Database["public"]["Enums"]["org_work_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_employees_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "organization_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          benefits: string[] | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          founding_year: number | null
          id: string
          license_number: string | null
          logo_url: string | null
          long_description: string | null
          media_images: string[] | null
          mission: string | null
          name_ar: string
          name_en: string | null
          org_values: string[] | null
          owner_user_id: string | null
          phone: string | null
          plan_id: string | null
          profile_completion: number
          profile_status: Database["public"]["Enums"]["profile_status"]
          programs: string[] | null
          region: string | null
          short_description: string | null
          slug: string | null
          social_links: Json | null
          status: Database["public"]["Enums"]["org_status"]
          subcategories: string[] | null
          subscription_end_date: string | null
          subscription_status: Database["public"]["Enums"]["org_status"]
          supervisor_entity: string | null
          updated_at: string
          video_url: string | null
          vision: string | null
          website: string | null
          why_work_with_us: string | null
          work_environment: string | null
          work_scope: string | null
        }
        Insert: {
          address?: string | null
          benefits?: string[] | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founding_year?: number | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          long_description?: string | null
          media_images?: string[] | null
          mission?: string | null
          name_ar: string
          name_en?: string | null
          org_values?: string[] | null
          owner_user_id?: string | null
          phone?: string | null
          plan_id?: string | null
          profile_completion?: number
          profile_status?: Database["public"]["Enums"]["profile_status"]
          programs?: string[] | null
          region?: string | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["org_status"]
          subcategories?: string[] | null
          subscription_end_date?: string | null
          subscription_status?: Database["public"]["Enums"]["org_status"]
          supervisor_entity?: string | null
          updated_at?: string
          video_url?: string | null
          vision?: string | null
          website?: string | null
          why_work_with_us?: string | null
          work_environment?: string | null
          work_scope?: string | null
        }
        Update: {
          address?: string | null
          benefits?: string[] | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founding_year?: number | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          long_description?: string | null
          media_images?: string[] | null
          mission?: string | null
          name_ar?: string
          name_en?: string | null
          org_values?: string[] | null
          owner_user_id?: string | null
          phone?: string | null
          plan_id?: string | null
          profile_completion?: number
          profile_status?: Database["public"]["Enums"]["profile_status"]
          programs?: string[] | null
          region?: string | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["org_status"]
          subcategories?: string[] | null
          subscription_end_date?: string | null
          subscription_status?: Database["public"]["Enums"]["org_status"]
          supervisor_entity?: string | null
          updated_at?: string
          video_url?: string | null
          vision?: string | null
          website?: string | null
          why_work_with_us?: string | null
          work_environment?: string | null
          work_scope?: string | null
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
      profile_reviews: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["profile_status"]
          submitted_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          submitted_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      generate_arabic_slug: { Args: { _title: string }; Returns: string }
      generate_job_short_id: { Args: never; Returns: string }
      generate_username: {
        Args: { _full_name: string; _user_id: string }
        Returns: string
      }
      get_or_create_thread: {
        Args: { _other_user_id: string }
        Returns: string
      }
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
        | "in_review"
        | "interview"
        | "offer"
      employee_status:
        | "invited"
        | "pending_acceptance"
        | "active"
        | "inactive"
        | "terminated"
      employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "intern"
        | "consultant"
        | "volunteer"
      experience_level: "junior" | "mid" | "senior" | "any" | "leadership"
      invite_status: "sent" | "opened" | "accepted" | "expired" | "canceled"
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
      org_employee_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "intern"
        | "volunteer"
      org_member_role: "employee" | "hr" | "manager"
      org_status: "pending" | "active" | "suspended"
      org_work_mode: "onsite" | "remote" | "hybrid"
      profile_status:
        | "draft"
        | "submitted"
        | "changes_requested"
        | "approved"
        | "rejected"
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
        "in_review",
        "interview",
        "offer",
      ],
      employee_status: [
        "invited",
        "pending_acceptance",
        "active",
        "inactive",
        "terminated",
      ],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "intern",
        "consultant",
        "volunteer",
      ],
      experience_level: ["junior", "mid", "senior", "any", "leadership"],
      invite_status: ["sent", "opened", "accepted", "expired", "canceled"],
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
      org_employee_type: [
        "full_time",
        "part_time",
        "contract",
        "intern",
        "volunteer",
      ],
      org_member_role: ["employee", "hr", "manager"],
      org_status: ["pending", "active", "suspended"],
      org_work_mode: ["onsite", "remote", "hybrid"],
      profile_status: [
        "draft",
        "submitted",
        "changes_requested",
        "approved",
        "rejected",
      ],
      remote_type: ["onsite", "remote", "hybrid"],
    },
  },
} as const
