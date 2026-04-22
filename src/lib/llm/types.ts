export type Pass1Result = {
  is_stool: boolean;
  confidence: number;
  rejection_reason: string | null;
  is_blurry: boolean;
};

export type StoolColor =
  | "brown"
  | "light_brown"
  | "dark_brown"
  | "green"
  | "yellow"
  | "black"
  | "red"
  | "pale"
  | "other";

export type StoolSize = "small" | "medium" | "large";

export type Pass2Result = {
  stool_form: number;
  color: StoolColor;
  size: StoolSize;
  surface_texture: string;
  visible_elements: string[];
  objective_summary: string[];
  insights: string[];
  corrections: string[];
};

export type EntryContext = {
  urgency: number | null;
  straining: number | null;
  odour: number | null;
  notes: string | null;
};

export interface LLMProvider {
  validateImage(imageBase64: string, mimeType: string): Promise<Pass1Result>;
  analyze(
    imageBase64: string,
    mimeType: string,
    context: EntryContext
  ): Promise<{ result: Pass2Result; raw: unknown }>;
}
