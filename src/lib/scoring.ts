import type { Pass2Result, StoolColor } from "./llm/types";

// ─────────────────────────────────────────────────────────
// Unified characteristic-based score (photo-less OR photo).
// ─────────────────────────────────────────────────────────

export type PoopColor =
  | "brown"
  | "dark_brown"
  | "yellow"
  | "green"
  | "red"
  | "black"
  | "pale";

export type PoopVolume = "small" | "childlike" | "normal" | "large";

export type PoopComposition = "rock" | "pellets" | "smooth" | "mushy";

export type Characteristics = {
  color: PoopColor | null;
  volume: PoopVolume | null;
  composition: PoopComposition | null;
  urgency: number | null;   // 1 low, 3 medium, 5 high
  straining: number | null; // 1 no, 5 yes
  odour: number | null;     // 0 none, 1 mild, 5 strong
};

export type ScoreBreakdown = {
  total: number | null;
  components: {
    composition: number | null;
    color: number | null;
    volume: number | null;
    straining: number | null;
    urgency: number | null;
    odour: number | null;
  };
};

// Weights (max points per component, total 100)
export const WEIGHTS = {
  composition: 30,
  color: 25,
  volume: 10,
  straining: 15,
  urgency: 10,
  odour: 10,
} as const;

const COMPOSITION_SCORE: Record<PoopComposition, number> = {
  rock: 0.3,      // Bristol 1 — severe constipation
  pellets: 0.5,   // Bristol 2
  smooth: 1.0,    // Bristol 3–4 — ideal
  mushy: 0.4,    // Bristol 6–7
};

const COLOR_SCORE: Record<PoopColor, number> = {
  brown: 1.0,
  dark_brown: 0.85,
  yellow: 0.4,
  green: 0.5,
  red: 0.15,
  black: 0.15,
  pale: 0.25,
};

const VOLUME_SCORE: Record<PoopVolume, number> = {
  small: 0.4,
  childlike: 0.55,
  normal: 1.0,
  large: 0.8,
};

function strainingScore(s: number): number {
  if (s <= 1) return 1.0;
  if (s <= 2) return 0.85;
  if (s <= 3) return 0.6;
  if (s <= 4) return 0.3;
  return 0.1;
}

function urgencyScore(u: number): number {
  if (u <= 1) return 0.85;
  if (u <= 3) return 1.0;
  return 0.35;
}

function odourScore(o: number): number {
  if (o <= 0) return 1.0;
  if (o <= 1) return 0.85;
  return 0.3;
}

/**
 * Compute a 0–100 health score from whatever characteristics are present.
 * Missing fields are excluded and the score is normalized over the remaining
 * weights. Returns null total when nothing is provided.
 */
export function computeHeuristicScore(c: Characteristics): ScoreBreakdown {
  const parts: Array<{ key: keyof typeof WEIGHTS; raw: number }> = [];

  if (c.composition) parts.push({ key: "composition", raw: COMPOSITION_SCORE[c.composition] });
  if (c.color) parts.push({ key: "color", raw: COLOR_SCORE[c.color] });
  if (c.volume) parts.push({ key: "volume", raw: VOLUME_SCORE[c.volume] });
  if (c.straining != null) parts.push({ key: "straining", raw: strainingScore(c.straining) });
  if (c.urgency != null) parts.push({ key: "urgency", raw: urgencyScore(c.urgency) });
  if (c.odour != null) parts.push({ key: "odour", raw: odourScore(c.odour) });

  if (parts.length === 0) {
    return {
      total: null,
      components: {
        composition: null, color: null, volume: null,
        straining: null, urgency: null, odour: null,
      },
    };
  }

  const weightSum = parts.reduce((a, p) => a + WEIGHTS[p.key], 0);
  const weightedPoints = parts.reduce(
    (a, p) => a + p.raw * WEIGHTS[p.key],
    0
  );
  // Normalize to 100
  const total = Math.round((weightedPoints / weightSum) * 100);

  const components = {
    composition: c.composition ? Math.round(COMPOSITION_SCORE[c.composition] * WEIGHTS.composition) : null,
    color: c.color ? Math.round(COLOR_SCORE[c.color] * WEIGHTS.color) : null,
    volume: c.volume ? Math.round(VOLUME_SCORE[c.volume] * WEIGHTS.volume) : null,
    straining: c.straining != null ? Math.round(strainingScore(c.straining) * WEIGHTS.straining) : null,
    urgency: c.urgency != null ? Math.round(urgencyScore(c.urgency) * WEIGHTS.urgency) : null,
    odour: c.odour != null ? Math.round(odourScore(c.odour) * WEIGHTS.odour) : null,
  };

  return { total: Math.max(0, Math.min(100, total)), components };
}

// ─────────────────────────────────────────────────────────
// Bridge from LLM analysis → characteristics → unified score
// ─────────────────────────────────────────────────────────

const BRISTOL_TO_COMPOSITION: Record<number, PoopComposition> = {
  1: "rock",
  2: "pellets",
  3: "smooth",
  4: "smooth",
  5: "smooth",
  6: "mushy",
  7: "mushy",
};

const LLM_COLOR_TO_POOP: Record<StoolColor, PoopColor> = {
  brown: "brown",
  light_brown: "brown",
  dark_brown: "dark_brown",
  green: "green",
  yellow: "yellow",
  black: "black",
  red: "red",
  pale: "pale",
  other: "brown",
};

export function characteristicsFromAnalysis(
  analysis: Pass2Result,
  size: string | null | undefined,
): Pick<Characteristics, "color" | "volume" | "composition"> {
  const composition =
    BRISTOL_TO_COMPOSITION[analysis.stool_form] ?? "smooth";
  const color = LLM_COLOR_TO_POOP[analysis.color] ?? "brown";

  const s = (size || "").toLowerCase();
  let volume: PoopVolume = "normal";
  if (s.includes("small")) volume = "small";
  else if (s.includes("large") || s.includes("big")) volume = "large";
  else if (s.includes("child")) volume = "childlike";

  return { color, volume, composition };
}

// Back-compat export for existing callers; delegates to unified formula.
export type ScoreInputs = {
  analysis: Pass2Result;
  urgency: number | null;
  straining: number | null;
  odour: number | null;
  // legacy, unused
  weeklyEntryCount?: number;
};

export function calculateScore(inputs: ScoreInputs): {
  total: number;
  form: number;
  color: number;
  experience: number;
  frequency: number;
} {
  const { color, volume, composition } = characteristicsFromAnalysis(
    inputs.analysis,
    inputs.analysis.size,
  );
  const breakdown = computeHeuristicScore({
    color,
    volume,
    composition,
    urgency: inputs.urgency,
    straining: inputs.straining,
    odour: inputs.odour,
  });
  const total = breakdown.total ?? 0;
  // Approximate legacy bucket mapping for any old consumers:
  return {
    total,
    form: breakdown.components.composition ?? 0,
    color: breakdown.components.color ?? 0,
    experience:
      (breakdown.components.straining ?? 0) + (breakdown.components.urgency ?? 0),
    frequency: 0,
  };
}
