import Link from "next/link";
import { format } from "date-fns";
import type { PoopEntry } from "@/types/database";

function urgencyLabel(v: number | null) {
  if (!v) return "—";
  if (v <= 2) return "Low";
  if (v <= 3) return "Medium";
  return "High";
}

function urgencyColor(v: number | null) {
  if (!v) return "text-stone-400";
  if (v <= 2) return "text-emerald-600";
  if (v <= 3) return "text-amber-600";
  return "text-red-500";
}

function odourLabel(v: number | null) {
  if (!v) return "—";
  return v <= 2 ? "Mild" : "Strong";
}

export function EntryCard({ entry, large }: { entry: PoopEntry; large?: boolean }) {
  const score = entry.score;

  return (
    <Link href={`/insight/${entry.id}`}>
      <div
        className={`bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-[0.98] transition-transform cursor-pointer ${
          large ? "p-5" : "p-4"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-400">
              {format(
                new Date(entry.logged_at),
                large ? "EEEE, d MMM · h:mm a" : "d MMM · h:mm a"
              )}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-sm font-medium ${urgencyColor(entry.urgency)}`}>
                {urgencyLabel(entry.urgency)} urgency
              </span>
              <span className="text-stone-200">·</span>
              <span className="text-sm text-stone-500">
                {odourLabel(entry.odour)} odour
              </span>
              {entry.straining && entry.straining > 3 && (
                <>
                  <span className="text-stone-200">·</span>
                  <span className="text-xs text-stone-400">Straining</span>
                </>
              )}
            </div>
            {large && entry.notes && (
              <p className="text-sm text-stone-400 mt-2 line-clamp-2">{entry.notes}</p>
            )}
          </div>

          <div className="flex flex-col items-center shrink-0">
            <div
              className={`rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center ${
                large ? "w-14 h-14" : "w-12 h-12"
              }`}
            >
              <span
                className={`font-bold text-amber-700 ${large ? "text-lg" : "text-base"}`}
              >
                {score ?? "—"}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              {score == null ? "no score" : "score"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
