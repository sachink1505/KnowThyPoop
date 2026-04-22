import type { Pass2Result, StoolColor } from "./llm/types";

export type ScoreInputs = {
  analysis: Pass2Result;
  urgency: number | null;     // 1 low, 3 medium, 5 high
  straining: number | null;   // 1 no, 5 yes
  weeklyEntryCount: number;   // entries in last 7 days (inclusive)
};

export type ScoreBreakdown = {
  total: number;
  form: number;
  color: number;
  experience: number;
  frequency: number;
};

const FORM_BASE: Record<number, number> = {
  1: 10,
  2: 20,
  3: 32,
  4: 40,
  5: 32,
  6: 20,
  7: 10,
};

const COLOR_POINTS: Record<StoolColor, number> = {
  brown: 25,
  light_brown: 20,
  dark_brown: 20,
  green: 15,
  yellow: 10,
  black: 5,
  red: 5,
  pale: 5,
  other: 10,
};

function scoreForm(form: number, surfaceTexture: string): number {
  const base = FORM_BASE[form] ?? 10;
  const t = (surfaceTexture || "").toLowerCase();
  let adj = 0;
  if (t.includes("smooth")) adj += 2;
  if (t.includes("very lumpy") || t.includes("watery") || t.includes("mushy"))
    adj -= 3;
  return Math.max(0, Math.min(40, base + adj));
}

function scoreColor(color: StoolColor): number {
  return COLOR_POINTS[color] ?? 10;
}

function scoreExperience(
  urgency: number | null,
  straining: number | null
): number {
  let s = 0;
  // straining: treat 1 as "no", >=4 as "yes"
  if (straining != null) {
    if (straining <= 2) s += 8;
    else if (straining >= 4) s -= 5;
  }
  // urgency: 1 low, 3 medium, 5 high
  if (urgency != null) {
    if (urgency === 3) s += 4;
    else if (urgency <= 2) s += 2;
    else if (urgency >= 4) s -= 3;
  }
  return Math.max(0, Math.min(20, s));
}

function scoreFrequency(weeklyEntryCount: number): number {
  if (weeklyEntryCount >= 5 && weeklyEntryCount <= 14) return 15;
  if (
    (weeklyEntryCount >= 2 && weeklyEntryCount <= 4) ||
    (weeklyEntryCount >= 15 && weeklyEntryCount <= 21)
  )
    return 10;
  return 5;
}

export function calculateScore(inputs: ScoreInputs): ScoreBreakdown {
  const form = scoreForm(inputs.analysis.stool_form, inputs.analysis.surface_texture);
  const color = scoreColor(inputs.analysis.color);
  const experience = scoreExperience(inputs.urgency, inputs.straining);
  const frequency = scoreFrequency(inputs.weeklyEntryCount);
  return {
    form,
    color,
    experience,
    frequency,
    total: Math.max(0, Math.min(100, form + color + experience + frequency)),
  };
}
