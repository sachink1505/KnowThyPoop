export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          age: number | null;
          phone: string | null;
          reminder_time: string | null;
          avatar_seed: string | null;
          country_code: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          age?: number | null;
          phone?: string | null;
          reminder_time?: string | null;
          avatar_seed?: string | null;
          country_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          age?: number | null;
          phone?: string | null;
          reminder_time?: string | null;
          avatar_seed?: string | null;
          country_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_issues: {
        Row: {
          id: string;
          user_id: string;
          issue_type: string;
          custom_issue: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          issue_type: string;
          custom_issue?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          issue_type?: string;
          custom_issue?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      poop_entries: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          urgency: number | null;
          straining: number | null;
          odour: number | null;
          notes: string | null;
          image_path: string | null;
          image_hash: string | null;
          score: number | null;
          poop_color: string | null;
          poop_volume: string | null;
          poop_composition: string | null;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          urgency?: number | null;
          straining?: number | null;
          odour?: number | null;
          notes?: string | null;
          image_path?: string | null;
          image_hash?: string | null;
          score?: number | null;
          poop_color?: string | null;
          poop_volume?: string | null;
          poop_composition?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          logged_at?: string;
          urgency?: number | null;
          straining?: number | null;
          odour?: number | null;
          notes?: string | null;
          image_path?: string | null;
          image_hash?: string | null;
          score?: number | null;
          poop_color?: string | null;
          poop_volume?: string | null;
          poop_composition?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      poop_analysis: {
        Row: {
          id: string;
          entry_id: string;
          stool_form: string | null;
          color: string | null;
          size: string | null;
          surface_texture: string | null;
          visible_elements: string[] | null;
          objective_summary: string | null;
          insights: string | null;
          corrections: string | null;
          raw_response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          stool_form?: string | null;
          color?: string | null;
          size?: string | null;
          surface_texture?: string | null;
          visible_elements?: string[] | null;
          objective_summary?: string | null;
          insights?: string | null;
          corrections?: string | null;
          raw_response?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          stool_form?: string | null;
          color?: string | null;
          size?: string | null;
          surface_texture?: string | null;
          visible_elements?: string[] | null;
          objective_summary?: string | null;
          insights?: string | null;
          corrections?: string | null;
          raw_response?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      analysis_feedback: {
        Row: {
          id: string;
          entry_id: string;
          thumbs: boolean | null;
          feedback_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          thumbs?: boolean | null;
          feedback_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          thumbs?: boolean | null;
          feedback_text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserIssue = Database["public"]["Tables"]["user_issues"]["Row"];
export type PoopEntry = Database["public"]["Tables"]["poop_entries"]["Row"];
export type PoopAnalysis = Database["public"]["Tables"]["poop_analysis"]["Row"];
export type AnalysisFeedback = Database["public"]["Tables"]["analysis_feedback"]["Row"];
