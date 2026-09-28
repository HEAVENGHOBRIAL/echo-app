// Généré par Supabase (generate_typescript_types) — ne pas modifier à la main.
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      card_reviews: {
        Row: {
          card_id: number
          due_at: string
          interval_days: number
          last_answer: string | null
          last_reviewed_at: string | null
          review_count: number
          user_id: string
        }
        Insert: {
          card_id: number
          due_at?: string
          interval_days?: number
          last_answer?: string | null
          last_reviewed_at?: string | null
          review_count?: number
          user_id: string
        }
        Update: {
          card_id?: number
          due_at?: string
          interval_days?: number
          last_answer?: string | null
          last_reviewed_at?: string | null
          review_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_reviews_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          card_order: number | null
          code_snippet: string | null
          explanation_en: string | null
          explanation_fr: string | null
          front: string | null
          front_en: string | null
          id: number
          level_id: number | null
        }
        Insert: {
          card_order?: number | null
          code_snippet?: string | null
          explanation_en?: string | null
          explanation_fr?: string | null
          front?: string | null
          front_en?: string | null
          id?: number
          level_id?: number | null
        }
        Update: {
          card_order?: number | null
          code_snippet?: string | null
          explanation_en?: string | null
          explanation_fr?: string | null
          front?: string | null
          front_en?: string | null
          id?: number
          level_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      level_challenges: {
        Row: {
          code_after: string | null
          code_before: string | null
          created_at: string
          distractors: Json
          hint_en: string | null
          hint_fr: string | null
          id: number
          level_id: number
          ordered: boolean
          pieces: Json
          prompt_en: string | null
          prompt_fr: string
        }
        Insert: {
          code_after?: string | null
          code_before?: string | null
          created_at?: string
          distractors?: Json
          hint_en?: string | null
          hint_fr?: string | null
          id?: never
          level_id: number
          ordered?: boolean
          pieces: Json
          prompt_en?: string | null
          prompt_fr: string
        }
        Update: {
          code_after?: string | null
          code_before?: string | null
          created_at?: string
          distractors?: Json
          hint_en?: string | null
          hint_fr?: string | null
          id?: never
          level_id?: number
          ordered?: boolean
          pieces?: Json
          prompt_en?: string | null
          prompt_fr?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_challenges_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: true
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      level_completions: {
        Row: {
          completed_at: string | null
          id: number
          level_id: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: number
          level_id?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: number
          level_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "level_completions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "level_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          description: string | null
          description_en: string | null
          id: number
          is_demo: boolean
          level_number: number
          title: string | null
          title_en: string | null
          track_id: number | null
        }
        Insert: {
          description?: string | null
          description_en?: string | null
          id?: number
          is_demo?: boolean
          level_number: number
          title?: string | null
          title_en?: string | null
          track_id?: number | null
        }
        Update: {
          description?: string | null
          description_en?: string | null
          id?: number
          is_demo?: boolean
          level_number?: number
          title?: string | null
          title_en?: string | null
          track_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "levels_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_stats"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "levels_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          id: number
          options: Json | null
          places_at_level: number | null
          question_text: string | null
          track_id: number | null
        }
        Insert: {
          correct_answer?: string | null
          id?: number
          options?: Json | null
          places_at_level?: number | null
          question_text?: string | null
          track_id?: number | null
        }
        Update: {
          correct_answer?: string | null
          id?: number
          options?: Json | null
          places_at_level?: number | null
          question_text?: string | null
          track_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_stats"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "quiz_questions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      review_sessions: {
        Row: {
          almost_count: number
          cards_total: number
          finished_at: string | null
          id: number
          known_count: number
          level_id: number | null
          started_at: string
          to_review_count: number
          user_id: string
        }
        Insert: {
          almost_count?: number
          cards_total?: number
          finished_at?: string | null
          id?: never
          known_count?: number
          level_id?: number | null
          started_at?: string
          to_review_count?: number
          user_id: string
        }
        Update: {
          almost_count?: number
          cards_total?: number
          finished_at?: string | null
          id?: never
          known_count?: number
          level_id?: number | null
          started_at?: string
          to_review_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_sessions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          badge: string | null
          color: string | null
          description: string | null
          id: number
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          badge?: string | null
          color?: string | null
          description?: string | null
          id?: number
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          badge?: string | null
          color?: string | null
          description?: string | null
          id?: number
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          current_level: number | null
          id: number
          placement_quiz_taken: boolean | null
          track_id: number | null
          user_id: string | null
        }
        Insert: {
          current_level?: number | null
          id?: number
          placement_quiz_taken?: boolean | null
          track_id?: number | null
          user_id?: string | null
        }
        Update: {
          current_level?: number | null
          id?: number
          placement_quiz_taken?: boolean | null
          track_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_stats"
            referencedColumns: ["track_id"]
          },
          {
            foreignKeyName: "user_progress_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      track_stats: {
        Row: {
          cards_total: number | null
          due_now: number | null
          mastered: number | null
          track_id: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_streak: { Args: never; Returns: number }
      record_review: {
        Args: { p_answer: string; p_card_id: number }
        Returns: {
          card_id: number
          due_at: string
          interval_days: number
          last_answer: string | null
          last_reviewed_at: string | null
          review_count: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "card_reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
