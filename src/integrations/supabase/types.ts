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
      cases: {
        Row: {
          allergy_text: string | null
          attachment_file_ids: string[] | null
          care_first_name: string | null
          care_last_name: string | null
          care_pesel: string | null
          chronic_conditions: string[] | null
          chronic_other: string | null
          created_at: string
          employers: Json | null
          free_text_reason: string
          has_allergy: boolean | null
          has_meds: boolean | null
          id: string
          illness_end: string
          illness_start: string
          late_justification: string | null
          long_leave: boolean | null
          long_leave_docs_file_id: string | null
          main_category: Database["public"]["Enums"]["main_category"]
          meds_list: string | null
          payment_method: string | null
          payment_psp_ref: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          pregnancy_card_file_id: string | null
          pregnancy_leave: boolean | null
          pregnant: boolean | null
          profile_id: string
          recipient_type: Database["public"]["Enums"]["recipient_type"]
          status: Database["public"]["Enums"]["case_status"]
          symptom_duration: Database["public"]["Enums"]["symptom_duration"]
          symptoms: string[] | null
          uniformed_nip: string | null
          uniformed_service_name: string | null
          updated_at: string
        }
        Insert: {
          allergy_text?: string | null
          attachment_file_ids?: string[] | null
          care_first_name?: string | null
          care_last_name?: string | null
          care_pesel?: string | null
          chronic_conditions?: string[] | null
          chronic_other?: string | null
          created_at?: string
          employers?: Json | null
          free_text_reason: string
          has_allergy?: boolean | null
          has_meds?: boolean | null
          id?: string
          illness_end: string
          illness_start: string
          late_justification?: string | null
          long_leave?: boolean | null
          long_leave_docs_file_id?: string | null
          main_category: Database["public"]["Enums"]["main_category"]
          meds_list?: string | null
          payment_method?: string | null
          payment_psp_ref?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pregnancy_card_file_id?: string | null
          pregnancy_leave?: boolean | null
          pregnant?: boolean | null
          profile_id: string
          recipient_type: Database["public"]["Enums"]["recipient_type"]
          status?: Database["public"]["Enums"]["case_status"]
          symptom_duration: Database["public"]["Enums"]["symptom_duration"]
          symptoms?: string[] | null
          uniformed_nip?: string | null
          uniformed_service_name?: string | null
          updated_at?: string
        }
        Update: {
          allergy_text?: string | null
          attachment_file_ids?: string[] | null
          care_first_name?: string | null
          care_last_name?: string | null
          care_pesel?: string | null
          chronic_conditions?: string[] | null
          chronic_other?: string | null
          created_at?: string
          employers?: Json | null
          free_text_reason?: string
          has_allergy?: boolean | null
          has_meds?: boolean | null
          id?: string
          illness_end?: string
          illness_start?: string
          late_justification?: string | null
          long_leave?: boolean | null
          long_leave_docs_file_id?: string | null
          main_category?: Database["public"]["Enums"]["main_category"]
          meds_list?: string | null
          payment_method?: string | null
          payment_psp_ref?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pregnancy_card_file_id?: string | null
          pregnancy_leave?: boolean | null
          pregnant?: boolean | null
          profile_id?: string
          recipient_type?: Database["public"]["Enums"]["recipient_type"]
          status?: Database["public"]["Enums"]["case_status"]
          symptom_duration?: Database["public"]["Enums"]["symptom_duration"]
          symptoms?: string[] | null
          uniformed_nip?: string | null
          uniformed_service_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string
          consent_call: boolean
          consent_employment: boolean
          consent_ip: string | null
          consent_marketing_email: boolean | null
          consent_marketing_tel: boolean | null
          consent_no_guarantee: boolean
          consent_terms: boolean
          consent_timestamp: string
          consent_truth: boolean
          country: string
          created_at: string
          email: string
          first_name: string
          flat_no: string | null
          house_no: string
          id: string
          is_guest: boolean
          last_name: string
          pesel: string
          phone: string
          postcode: string
          street: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city: string
          consent_call?: boolean
          consent_employment?: boolean
          consent_ip?: string | null
          consent_marketing_email?: boolean | null
          consent_marketing_tel?: boolean | null
          consent_no_guarantee?: boolean
          consent_terms?: boolean
          consent_timestamp?: string
          consent_truth?: boolean
          country?: string
          created_at?: string
          email: string
          first_name: string
          flat_no?: string | null
          house_no: string
          id?: string
          is_guest?: boolean
          last_name: string
          pesel: string
          phone: string
          postcode: string
          street: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string
          consent_call?: boolean
          consent_employment?: boolean
          consent_ip?: string | null
          consent_marketing_email?: boolean | null
          consent_marketing_tel?: boolean | null
          consent_no_guarantee?: boolean
          consent_terms?: boolean
          consent_timestamp?: string
          consent_truth?: boolean
          country?: string
          created_at?: string
          email?: string
          first_name?: string
          flat_no?: string | null
          house_no?: string
          id?: string
          is_guest?: boolean
          last_name?: string
          pesel?: string
          phone?: string
          postcode?: string
          street?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      case_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "completed"
        | "rejected"
      main_category:
        | "cold_pain"
        | "gastro"
        | "bladder"
        | "injury"
        | "menstruation"
        | "back_pain"
        | "eye"
        | "migraine"
        | "acute_stress"
        | "psych"
      payment_status: "pending" | "success" | "fail"
      recipient_type:
        | "pl_employer"
        | "uniformed"
        | "student"
        | "foreign_employer"
        | "care"
      symptom_duration: "today" | "yesterday" | "2_3" | "4_5" | "gt_5"
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
      case_status: ["draft", "submitted", "in_review", "completed", "rejected"],
      main_category: [
        "cold_pain",
        "gastro",
        "bladder",
        "injury",
        "menstruation",
        "back_pain",
        "eye",
        "migraine",
        "acute_stress",
        "psych",
      ],
      payment_status: ["pending", "success", "fail"],
      recipient_type: [
        "pl_employer",
        "uniformed",
        "student",
        "foreign_employer",
        "care",
      ],
      symptom_duration: ["today", "yesterday", "2_3", "4_5", "gt_5"],
    },
  },
} as const
