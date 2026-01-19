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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string
          blocked_by: string
          created_at: string
          expires_at: string | null
          id: string
          ip_address: string
          is_active: boolean
          reason: string | null
          updated_at: string
        }
        Insert: {
          blocked_at?: string
          blocked_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address: string
          is_active?: boolean
          reason?: string | null
          updated_at?: string
        }
        Update: {
          blocked_at?: string
          blocked_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      carcare_categories: {
        Row: {
          category_id: string
          created_at: string
          icon: string | null
          id: string
          keywords: string[] | null
          name_en: string
          name_pt: string
        }
        Insert: {
          category_id: string
          created_at?: string
          icon?: string | null
          id?: string
          keywords?: string[] | null
          name_en: string
          name_pt: string
        }
        Update: {
          category_id?: string
          created_at?: string
          icon?: string | null
          id?: string
          keywords?: string[] | null
          name_en?: string
          name_pt?: string
        }
        Relationships: []
      }
      carcare_procedure_cache: {
        Row: {
          brand: string
          category: string
          discovered_at: string
          expires_at: string
          id: string
          model: string
          procedure_id: string
          procedure_name: string
          procedure_name_pt: string | null
          source_url: string | null
          thumbnail_url: string | null
          updated_at: string
          video_url: string | null
          year: string | null
        }
        Insert: {
          brand: string
          category: string
          discovered_at?: string
          expires_at?: string
          id?: string
          model: string
          procedure_id: string
          procedure_name: string
          procedure_name_pt?: string | null
          source_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
          year?: string | null
        }
        Update: {
          brand?: string
          category?: string
          discovered_at?: string
          expires_at?: string
          id?: string
          model?: string
          procedure_id?: string
          procedure_name?: string
          procedure_name_pt?: string | null
          source_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
          year?: string | null
        }
        Relationships: []
      }
      coding_executions: {
        Row: {
          category: string
          created_at: string
          details: string | null
          duration_ms: number | null
          function_id: string
          function_name: string
          id: string
          is_simulated: boolean
          message: string | null
          raw_responses: string[] | null
          risk_level: string
          success: boolean
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          details?: string | null
          duration_ms?: number | null
          function_id: string
          function_name: string
          id?: string
          is_simulated?: boolean
          message?: string | null
          raw_responses?: string[] | null
          risk_level: string
          success?: boolean
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          details?: string | null
          duration_ms?: number | null
          function_id?: string
          function_name?: string
          id?: string
          is_simulated?: boolean
          message?: string | null
          raw_responses?: string[] | null
          risk_level?: string
          success?: boolean
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_executions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_form_analytics: {
        Row: {
          blocked_reason: string | null
          created_at: string
          email: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          blocked_reason?: string | null
          created_at?: string
          email?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          blocked_reason?: string | null
          created_at?: string
          email?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_rate_limits: {
        Row: {
          attempts_count: number
          blocked_until: string | null
          email: string | null
          first_attempt_at: string
          id: string
          ip_address: string
          last_attempt_at: string
        }
        Insert: {
          attempts_count?: number
          blocked_until?: string | null
          email?: string | null
          first_attempt_at?: string
          id?: string
          ip_address: string
          last_attempt_at?: string
        }
        Update: {
          attempts_count?: number
          blocked_until?: string | null
          email?: string | null
          first_attempt_at?: string
          id?: string
          ip_address?: string
          last_attempt_at?: string
        }
        Relationships: []
      }
      data_recordings: {
        Row: {
          created_at: string
          data_points_count: number | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          name: string
          parameters_count: number | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          data_points_count?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          parameters_count?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          data_points_count?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          parameters_count?: number | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_recordings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_items: {
        Row: {
          can_diy: boolean
          created_at: string
          description_human: string
          diagnostic_id: string
          diy_difficulty: number | null
          dtc_code: string
          id: string
          priority: Database["public"]["Enums"]["diagnostic_priority"]
          probable_causes: string[] | null
          severity: number
          solution_url: string | null
          status: Database["public"]["Enums"]["diagnostic_status"]
          updated_at: string
        }
        Insert: {
          can_diy?: boolean
          created_at?: string
          description_human: string
          diagnostic_id: string
          diy_difficulty?: number | null
          dtc_code: string
          id?: string
          priority?: Database["public"]["Enums"]["diagnostic_priority"]
          probable_causes?: string[] | null
          severity?: number
          solution_url?: string | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          updated_at?: string
        }
        Update: {
          can_diy?: boolean
          created_at?: string
          description_human?: string
          diagnostic_id?: string
          diy_difficulty?: number | null
          dtc_code?: string
          id?: string
          priority?: Database["public"]["Enums"]["diagnostic_priority"]
          probable_causes?: string[] | null
          severity?: number
          solution_url?: string | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_items_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          obd_raw_data: Json | null
          status: Database["public"]["Enums"]["diagnostic_status"]
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          obd_raw_data?: Json | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          obd_raw_data?: Json | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_consents: {
        Row: {
          consent_type: string
          consent_version: string
          consented_at: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consent_version?: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consent_version?: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      obd_settings: {
        Row: {
          atst_mode: string
          atst_value: number
          auto_reconnect: boolean
          connection_timeout_seconds: number
          created_at: string
          custom_init_commands: string[] | null
          id: string
          last_connection_at: string | null
          last_successful_protocol: string | null
          max_simultaneous_parameters: number
          optimize_requests: boolean
          polling_interval_ms: number
          preferred_protocol: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          atst_mode?: string
          atst_value?: number
          auto_reconnect?: boolean
          connection_timeout_seconds?: number
          created_at?: string
          custom_init_commands?: string[] | null
          id?: string
          last_connection_at?: string | null
          last_successful_protocol?: string | null
          max_simultaneous_parameters?: number
          optimize_requests?: boolean
          polling_interval_ms?: number
          preferred_protocol?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          atst_mode?: string
          atst_value?: number
          auto_reconnect?: boolean
          connection_timeout_seconds?: number
          created_at?: string
          custom_init_commands?: string[] | null
          id?: string
          last_connection_at?: string | null
          last_successful_protocol?: string | null
          max_simultaneous_parameters?: number
          optimize_requests?: boolean
          polling_interval_ms?: number
          preferred_protocol?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recording_data_points: {
        Row: {
          created_at: string
          id: string
          parameters: Json
          recording_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          parameters?: Json
          recording_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          parameters?: Json
          recording_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "recording_data_points_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "data_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string
          description: string
          diagnostic_id: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description: string
          diagnostic_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description?: string
          diagnostic_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          created_at: string
          email_sent_count: number | null
          expires_at: string | null
          id: string
          message: string
          priority: string
          read_by: string[] | null
          send_email: boolean
          sent_by: string
          target_role: string | null
          target_type: string
          target_user_ids: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_sent_count?: number | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string
          read_by?: string[] | null
          send_email?: boolean
          sent_by: string
          target_role?: string | null
          target_type?: string
          target_user_ids?: string[] | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_sent_count?: number | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string
          read_by?: string[] | null
          send_email?: boolean
          sent_by?: string
          target_role?: string | null
          target_type?: string
          target_user_ids?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_staff: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_cache: {
        Row: {
          category_original: string | null
          category_pt: string | null
          created_at: string
          description_original: string | null
          description_pt: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_processed: boolean | null
          last_synced_at: string | null
          rating: number | null
          safety_tips: Json | null
          slug: string
          source_url: string
          steps: Json | null
          thumbnail_url: string | null
          title_original: string | null
          title_pt: string | null
          tools: Json | null
          updated_at: string
          vehicle_makes: Json | null
          vehicle_models: Json | null
          vehicle_years: Json | null
          video_url: string | null
          views_count: number | null
          youtube_video_id: string | null
        }
        Insert: {
          category_original?: string | null
          category_pt?: string | null
          created_at?: string
          description_original?: string | null
          description_pt?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_processed?: boolean | null
          last_synced_at?: string | null
          rating?: number | null
          safety_tips?: Json | null
          slug: string
          source_url: string
          steps?: Json | null
          thumbnail_url?: string | null
          title_original?: string | null
          title_pt?: string | null
          tools?: Json | null
          updated_at?: string
          vehicle_makes?: Json | null
          vehicle_models?: Json | null
          vehicle_years?: Json | null
          video_url?: string | null
          views_count?: number | null
          youtube_video_id?: string | null
        }
        Update: {
          category_original?: string | null
          category_pt?: string | null
          created_at?: string
          description_original?: string | null
          description_pt?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_processed?: boolean | null
          last_synced_at?: string | null
          rating?: number | null
          safety_tips?: Json | null
          slug?: string
          source_url?: string
          steps?: Json | null
          thumbnail_url?: string | null
          title_original?: string | null
          title_pt?: string | null
          tools?: Json | null
          updated_at?: string
          vehicle_makes?: Json | null
          vehicle_models?: Json | null
          vehicle_years?: Json | null
          video_url?: string | null
          views_count?: number | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      tutorial_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name_original: string
          name_pt: string
          slug: string
          tutorials_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name_original: string
          name_pt: string
          slug: string
          tutorials_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name_original?: string
          name_pt?: string
          slug?: string
          tutorials_count?: number | null
        }
        Relationships: []
      }
      tutorial_favorites: {
        Row: {
          created_at: string
          id: string
          tutorial_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tutorial_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tutorial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_favorites_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorial_cache"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_progress: {
        Row: {
          completed_at: string | null
          completed_steps: number[]
          created_at: string
          id: string
          last_step: number
          started_at: string
          tutorial_id: string
          updated_at: string
          user_id: string
          watch_time_seconds: number
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number[]
          created_at?: string
          id?: string
          last_step?: number
          started_at?: string
          tutorial_id: string
          updated_at?: string
          user_id: string
          watch_time_seconds?: number
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number[]
          created_at?: string
          id?: string
          last_step?: number
          started_at?: string
          tutorial_id?: string
          updated_at?: string
          user_id?: string
          watch_time_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_progress_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorial_cache"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          ai_queries_count: number
          coding_executions_count: number
          created_at: string
          data_recordings_count: number
          diagnostics_count: number
          id: string
          last_reset_at: string
          month_year: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_queries_count?: number
          coding_executions_count?: number
          created_at?: string
          data_recordings_count?: number
          diagnostics_count?: number
          id?: string
          last_reset_at?: string
          month_year: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_queries_count?: number
          coding_executions_count?: number
          created_at?: string
          data_recordings_count?: number
          diagnostics_count?: number
          id?: string
          last_reset_at?: string
          month_year?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          email_account_updates: boolean
          email_critical_diagnostics: boolean
          email_diagnostic_completed: boolean
          email_marketing: boolean
          email_ticket_updates: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_account_updates?: boolean
          email_critical_diagnostics?: boolean
          email_diagnostic_completed?: boolean
          email_marketing?: boolean
          email_ticket_updates?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_account_updates?: boolean
          email_critical_diagnostics?: boolean
          email_diagnostic_completed?: boolean
          email_marketing?: boolean
          email_ticket_updates?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_type: string
          started_at: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          engine: string | null
          fuel_type: string | null
          id: string
          license_plate: string | null
          model: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          brand: string
          created_at?: string
          engine?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          model: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          brand?: string
          created_at?: string
          engine?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          model?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      video_transcription_cache: {
        Row: {
          created_at: string
          elaborated_steps: Json | null
          expires_at: string | null
          id: string
          original_transcription: string | null
          transcription_used: boolean | null
          translated_description: string | null
          translated_title: string | null
          translated_video_description: string | null
          updated_at: string
          vehicle_context: string | null
          video_url: string
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string
          elaborated_steps?: Json | null
          expires_at?: string | null
          id?: string
          original_transcription?: string | null
          transcription_used?: boolean | null
          translated_description?: string | null
          translated_title?: string | null
          translated_video_description?: string | null
          updated_at?: string
          vehicle_context?: string | null
          video_url: string
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string
          elaborated_steps?: Json | null
          expires_at?: string | null
          id?: string
          original_transcription?: string | null
          transcription_used?: boolean | null
          translated_description?: string | null
          translated_title?: string | null
          translated_video_description?: string | null
          updated_at?: string
          vehicle_context?: string | null
          video_url?: string
          youtube_video_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      contact_analytics_summary: {
        Row: {
          count: number | null
          date: string | null
          event_type: string | null
          unique_ips: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_contact_rate_limit: {
        Args: { p_email?: string; p_ip_address: string }
        Returns: Json
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_obd_command: { Args: { command: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      diagnostic_priority: "critical" | "attention" | "preventive"
      diagnostic_status: "pending" | "completed" | "resolved"
      ticket_category:
        | "technical"
        | "account"
        | "billing"
        | "diagnostic"
        | "general"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
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
      app_role: ["admin", "user"],
      diagnostic_priority: ["critical", "attention", "preventive"],
      diagnostic_status: ["pending", "completed", "resolved"],
      ticket_category: [
        "technical",
        "account",
        "billing",
        "diagnostic",
        "general",
      ],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
