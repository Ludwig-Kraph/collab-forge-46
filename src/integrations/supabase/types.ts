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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cashier_metrics: {
        Row: {
          created_at: string | null
          date: string | null
          failed_transactions: number | null
          id: string
          outlet_id: string | null
          successful_transactions: number | null
          total_amount: number | null
          transactions_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          failed_transactions?: number | null
          id?: string
          outlet_id?: string | null
          successful_transactions?: number | null
          total_amount?: number | null
          transactions_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          failed_transactions?: number | null
          id?: string
          outlet_id?: string | null
          successful_transactions?: number | null
          total_amount?: number | null
          transactions_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashier_metrics_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          department_type: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_type: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_type?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      government_audit_trails: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          government_entity_id: string
          id: string
          ip_address: unknown
          is_compliant: boolean | null
          official_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          government_entity_id: string
          id?: string
          ip_address?: unknown
          is_compliant?: boolean | null
          official_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          government_entity_id?: string
          id?: string
          ip_address?: unknown
          is_compliant?: boolean | null
          official_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_audit_trails_government_entity_id_fkey"
            columns: ["government_entity_id"]
            isOneToOne: false
            referencedRelation: "government_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "government_audit_trails_official_id_fkey"
            columns: ["official_id"]
            isOneToOne: false
            referencedRelation: "government_officials"
            referencedColumns: ["id"]
          },
        ]
      }
      government_compliance_reports: {
        Row: {
          compliance_score: number | null
          created_at: string | null
          generated_at: string | null
          generated_by: string | null
          government_entity_id: string
          id: string
          issues_found: number | null
          report_period: string
          report_type: string
          total_expenditure: number | null
          total_revenue: number | null
        }
        Insert: {
          compliance_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          government_entity_id: string
          id?: string
          issues_found?: number | null
          report_period: string
          report_type: string
          total_expenditure?: number | null
          total_revenue?: number | null
        }
        Update: {
          compliance_score?: number | null
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          government_entity_id?: string
          id?: string
          issues_found?: number | null
          report_period?: string
          report_type?: string
          total_expenditure?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "government_compliance_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "government_officials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "government_compliance_reports_government_entity_id_fkey"
            columns: ["government_entity_id"]
            isOneToOne: false
            referencedRelation: "government_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      government_entities: {
        Row: {
          county_name: string | null
          created_at: string | null
          entity_code: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["government_level"]
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          county_name?: string | null
          created_at?: string | null
          entity_code: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["government_level"]
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          county_name?: string | null
          created_at?: string | null
          entity_code?: string
          entity_name?: string
          entity_type?: Database["public"]["Enums"]["government_level"]
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      government_officials: {
        Row: {
          access_level: number | null
          appointed_at: string | null
          can_be_blocked: boolean | null
          created_at: string | null
          government_entity_id: string
          id: string
          is_super_admin: boolean | null
          office_title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: number | null
          appointed_at?: string | null
          can_be_blocked?: boolean | null
          created_at?: string | null
          government_entity_id: string
          id?: string
          is_super_admin?: boolean | null
          office_title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: number | null
          appointed_at?: string | null
          can_be_blocked?: boolean | null
          created_at?: string | null
          government_entity_id?: string
          id?: string
          is_super_admin?: boolean | null
          office_title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_officials_government_entity_id_fkey"
            columns: ["government_entity_id"]
            isOneToOne: false
            referencedRelation: "government_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      government_revenue_streams: {
        Row: {
          collected_amount: number | null
          created_at: string | null
          fiscal_year: string
          government_entity_id: string
          id: string
          stream_category: string
          stream_name: string
          target_amount: number | null
          updated_at: string | null
        }
        Insert: {
          collected_amount?: number | null
          created_at?: string | null
          fiscal_year: string
          government_entity_id: string
          id?: string
          stream_category: string
          stream_name: string
          target_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          collected_amount?: number | null
          created_at?: string | null
          fiscal_year?: string
          government_entity_id?: string
          id?: string
          stream_category?: string
          stream_name?: string
          target_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_revenue_streams_government_entity_id_fkey"
            columns: ["government_entity_id"]
            isOneToOne: false
            referencedRelation: "government_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      inter_governmental_communications: {
        Row: {
          created_at: string | null
          from_entity_id: string
          from_official_id: string
          id: string
          is_encrypted: boolean | null
          is_read: boolean | null
          message: string
          priority: string | null
          subject: string
          to_entity_id: string
        }
        Insert: {
          created_at?: string | null
          from_entity_id: string
          from_official_id: string
          id?: string
          is_encrypted?: boolean | null
          is_read?: boolean | null
          message: string
          priority?: string | null
          subject: string
          to_entity_id: string
        }
        Update: {
          created_at?: string | null
          from_entity_id?: string
          from_official_id?: string
          id?: string
          is_encrypted?: boolean | null
          is_read?: boolean | null
          message?: string
          priority?: string | null
          subject?: string
          to_entity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inter_governmental_communications_from_entity_id_fkey"
            columns: ["from_entity_id"]
            isOneToOne: false
            referencedRelation: "government_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inter_governmental_communications_from_official_id_fkey"
            columns: ["from_official_id"]
            isOneToOne: false
            referencedRelation: "government_officials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inter_governmental_communications_to_entity_id_fkey"
            columns: ["to_entity_id"]
            isOneToOne: false
            referencedRelation: "government_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          department_id: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          organization_id: string
          outlet_id: string | null
          role: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          department_id?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by: string
          organization_id: string
          outlet_id?: string | null
          role: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          organization_id?: string
          outlet_id?: string | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: Database["public"]["Enums"]["mpesa_account_type"]
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: Database["public"]["Enums"]["mpesa_account_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: Database["public"]["Enums"]["mpesa_account_type"]
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      outlets: {
        Row: {
          classification: string
          county: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          location: string
          mpesa_account_id: string | null
          name: string
          organization_id: string
          outlet_type: string
          subcounty: string | null
          updated_at: string | null
        }
        Insert: {
          classification: string
          county?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          mpesa_account_id?: string | null
          name: string
          organization_id: string
          outlet_type: string
          subcounty?: string | null
          updated_at?: string | null
        }
        Update: {
          classification?: string
          county?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          mpesa_account_id?: string | null
          name?: string
          organization_id?: string
          outlet_type?: string
          subcounty?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outlets_mpesa_account_id_fkey"
            columns: ["mpesa_account_id"]
            isOneToOne: false
            referencedRelation: "mpesa_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outlets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_rbac_user: boolean | null
          organization_id: string | null
          phone_number: string
          pin_hash: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          is_rbac_user?: boolean | null
          organization_id?: string | null
          phone_number: string
          pin_hash?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_rbac_user?: boolean | null
          organization_id?: string | null
          phone_number?: string
          pin_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_departments: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          is_manager: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          is_manager?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          is_manager?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_outlets: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          outlet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          outlet_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          outlet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_outlets_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          free_stk_pushes_remaining: number
          id: string
          is_active: boolean
          max_stk_pushes: number | null
          max_users: number
          started_at: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          used_stk_pushes: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          free_stk_pushes_remaining?: number
          id?: string
          is_active?: boolean
          max_stk_pushes?: number | null
          max_users?: number
          started_at?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          used_stk_pushes?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          free_stk_pushes_remaining?: number
          id?: string
          is_active?: boolean
          max_stk_pushes?: number | null
          max_users?: number
          started_at?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          used_stk_pushes?: number
          user_id?: string
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          created_at: string
          id: string
          is_resolved: boolean
          message: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_resolved?: boolean
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_resolved?: boolean
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          description: string | null
          id: string
          mpesa_account_id: string
          mpesa_receipt_number: string | null
          phone_number: string
          status: string
          transaction_date: string
          transaction_id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          mpesa_account_id: string
          mpesa_receipt_number?: string | null
          phone_number: string
          status?: string
          transaction_date?: string
          transaction_id: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          mpesa_account_id?: string
          mpesa_receipt_number?: string | null
          phone_number?: string
          status?: string
          transaction_date?: string
          transaction_id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_mpesa_account_id_fkey"
            columns: ["mpesa_account_id"]
            isOneToOne: false
            referencedRelation: "mpesa_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
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
      admin_exists: { Args: never; Returns: boolean }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          _action: string
          _changes?: Json
          _entity_id?: string
          _entity_type: string
          _ip_address?: unknown
          _user_agent?: string
        }
        Returns: string
      }
      super_admin_exists: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "user"
        | "viewer"
        | "super_admin"
        | "developer"
        | "corporate_admin"
      government_level: "national" | "county"
      mpesa_account_type: "till" | "paybill" | "pochi"
      subscription_tier:
        | "free_trial"
        | "basic"
        | "standard"
        | "professional"
        | "enterprise"
        | "corporate"
        | "government"
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
        "admin",
        "manager",
        "user",
        "viewer",
        "super_admin",
        "developer",
        "corporate_admin",
      ],
      government_level: ["national", "county"],
      mpesa_account_type: ["till", "paybill", "pochi"],
      subscription_tier: [
        "free_trial",
        "basic",
        "standard",
        "professional",
        "enterprise",
        "corporate",
        "government",
      ],
    },
  },
} as const
