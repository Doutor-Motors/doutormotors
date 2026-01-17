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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
