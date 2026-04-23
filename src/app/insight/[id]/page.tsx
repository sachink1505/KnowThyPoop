import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/CircularProgress";
import { InsightFeedback } from "@/components/InsightFeedback";
import { EntryImageViewer } from "@/components/EntryImageViewer";
import { ScoreExplainer } from "@/components/ScoreExplainer";
import { LocalTime } from "@/components/LocalTime";

function urgencyLabel(v: number | null) {
  if (!v) return "—";
  if (v <= 2) return "Low";
  if (v <= 3) return "Medium";
  return "High";
}

function odourLabel(v: number | null) {
  if (v == null) return "—";
  if (v <= 0) return "None";
  return v <= 2 ? "Mild" : "Strong";
}

function formatDuration(s: number | null) {
  if (s == null || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

const COLOR_HEX: Record<string, string> = {
  brown: "#8b4513",
  dark_brown: "#4a2310",
  yellow: "#d4a017",
  green: "#4a7a3a",
  red: "#9a2a2a",
  black: "#1a1a1a",
  pale: "#e8d6b0",
};

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 rounded-xl p-3">
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-stone-700">{value}</p>
    </div>
  );
}

function AnalysisRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="text-sm font-medium text-stone-400 italic">{value}</p>
    </div>
  );
}

type Props = { params: Promise<{ id: string }> };

export default async function InsightPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: entry } = await supabase
    .from("poop_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry) notFound();

  const { data: feedback } = await supabase
    .from("analysis_feedback")
    .select("*")
    .eq("entry_id", entry.id)
    .maybeSingle();

  const { data: analysis } = await supabase
    .from("poop_analysis")
    .select("*")
    .eq("entry_id", entry.id)
    .maybeSingle();

  function parseList(raw: string | null): string[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  }

  const objectiveSummary = parseList(analysis?.objective_summary ?? null);
  const insightsList = parseList(analysis?.insights ?? null);
  const correctionsList = parseList(analysis?.corrections ?? null);

  const score = entry.score;
  const urgency = urgencyLabel(entry.urgency);
  const straining = entry.straining && entry.straining > 3 ? "Yes" : "No";
  const odour = odourLabel(entry.odour);

  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-28">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Link href="/home">
          <button className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-stone-800">Your insight</h1>
          <p className="text-xs text-stone-400">
            <LocalTime iso={entry.logged_at} pattern="EEEE, d MMMM · h:mm a" />
          </p>
        </div>
      </header>

      <div className="px-5 space-y-4">
        {/* Score card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-center gap-5">
          <CircularProgress score={score ?? 0} size={90} />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">
                Gut health score
              </p>
              <ScoreExplainer />
            </div>
            {score == null ? (
              <>
                <p className="text-3xl font-bold text-stone-400 mt-0.5">—</p>
                <p className="text-xs text-stone-400 mt-1">
                  Log characteristics to see a score
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-stone-800 mt-0.5">
                  {score}
                  <span className="text-base font-normal text-stone-400"> / 100</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Based on your logged data
                </p>
              </>
            )}
          </div>
        </div>

        {/* What you logged */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            What you logged
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            <DataItem label="Urgency" value={urgency} />
            <DataItem label="Straining" value={straining} />
            <DataItem label="Odour" value={odour} />
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-0.5">Time</p>
              <p className="text-sm font-semibold text-stone-700">
                <LocalTime iso={entry.logged_at} pattern="h:mm a" />
              </p>
            </div>
            {entry.poop_color && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-400 mb-0.5">Colour</p>
                <p className="text-sm font-semibold text-stone-700 flex items-center gap-2 capitalize">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone-200 inline-block"
                    style={{ background: COLOR_HEX[entry.poop_color] ?? "#8b4513" }}
                  />
                  {entry.poop_color.replace("_", " ")}
                </p>
              </div>
            )}
            {entry.poop_volume && (
              <DataItem label="Volume" value={entry.poop_volume.replace("_", " ")} />
            )}
            {entry.poop_composition && (
              <DataItem label="Composition" value={entry.poop_composition} />
            )}
            {entry.duration_seconds != null && entry.duration_seconds > 0 && (
              <DataItem label="Duration" value={formatDuration(entry.duration_seconds)} />
            )}
          </div>
          {entry.notes && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-1">Notes</p>
              <p className="text-sm text-stone-600 leading-relaxed">
                {entry.notes}
              </p>
            </div>
          )}
        </div>

        {/* What is seen */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700 mb-2">
            What is seen
          </h2>
          {analysis ? (
            <div className="divide-y divide-stone-50">
              <AnalysisRow
                label="Stool form"
                value={analysis.stool_form ?? "—"}
              />
              <AnalysisRow
                label="Colour"
                value={(analysis.color ?? "—").replace(/_/g, " ")}
              />
              <AnalysisRow label="Size" value={analysis.size ?? "—"} />
              <AnalysisRow
                label="Surface texture"
                value={analysis.surface_texture ?? "—"}
              />
              <AnalysisRow
                label="Visible elements"
                value={
                  analysis.visible_elements && analysis.visible_elements.length
                    ? analysis.visible_elements.join(", ")
                    : "None noted"
                }
              />
            </div>
          ) : (
            <p className="text-sm text-stone-400 italic">
              No visual analysis available for this entry.
            </p>
          )}
          {objectiveSummary.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {objectiveSummary.map((b, i) => (
                <li
                  key={i}
                  className="text-sm text-stone-600 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-stone-400"
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
          {entry.image_path ? (
            <EntryImageViewer entryId={entry.id} />
          ) : (
            <div className="mt-3 bg-stone-50 rounded-xl p-3 flex items-start gap-2">
              <span className="text-base">📷</span>
              <p className="text-xs text-stone-400 leading-relaxed">
                Add a photo to your next log to get real AI-powered analysis of
                stool characteristics.
              </p>
            </div>
          )}
        </div>

        {/* Insights */}
        {insightsList.length > 0 ? (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h2 className="text-sm font-semibold text-amber-800 mb-2">
              Insights
            </h2>
            <ul className="space-y-1.5">
              {insightsList.map((b, i) => (
                <li
                  key={i}
                  className="text-sm text-amber-700 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h2 className="text-sm font-semibold text-amber-800 mb-1.5">
              Insights
            </h2>
            <p className="text-sm text-amber-700 leading-relaxed">
              Your log looks healthy overall. Urgency was{" "}
              <span className="font-medium">{urgency.toLowerCase()}</span> and
              odour was{" "}
              <span className="font-medium">{odour.toLowerCase()}</span>.{" "}
              {straining === "Yes"
                ? "You noted some straining — staying hydrated and increasing fibre can help."
                : "No straining noted — that's a great sign."}
            </p>
          </div>
        )}

        {/* Corrections */}
        {correctionsList.length > 0 && (
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <h2 className="text-sm font-semibold text-emerald-800 mb-2">
              Suggestions
            </h2>
            <ul className="space-y-1.5">
              {correctionsList.map((b, i) => (
                <li
                  key={i}
                  className="text-sm text-emerald-700 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feedback */}
        <InsightFeedback entryId={entry.id} initialFeedback={feedback ?? null} />

        {/* Disclaimer */}
        <p className="text-xs text-stone-400 text-center leading-relaxed px-2 pb-4">
          ⚠️ AI-generated insights are for informational purposes only and do
          not constitute medical advice. Always consult a qualified healthcare
          professional for any health concerns.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent flex gap-3">
        <Link href="/home" className="flex-1">
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl text-base font-semibold border-stone-200 bg-white text-stone-700 active:scale-95 transition-transform"
          >
            Go home
          </Button>
        </Link>
        <Link href="/log" className="flex-1">
          <Button className="w-full h-14 rounded-2xl text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 active:scale-95 transition-transform">
            Track another 💩
          </Button>
        </Link>
      </div>
    </main>
  );
}
