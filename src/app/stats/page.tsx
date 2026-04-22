import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Timer, CalendarClock } from "lucide-react";

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatGap(hours: number | null): string {
  if (hours == null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: entries } = await supabase
    .from("poop_entries")
    .select("logged_at,duration_seconds")
    .eq("user_id", user.id)
    .gte("logged_at", sinceIso)
    .order("logged_at", { ascending: true });

  const rows = entries ?? [];

  // Hour-of-day histogram (24 buckets)
  const hourBuckets = Array.from({ length: 24 }, () => 0);
  for (const r of rows) {
    const h = new Date(r.logged_at).getHours();
    hourBuckets[h] += 1;
  }
  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
  const maxCount = Math.max(1, ...hourBuckets);

  // Average duration
  const durations = rows
    .map((r) => r.duration_seconds)
    .filter((d): d is number => typeof d === "number" && d > 0);
  const avgDuration =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null;

  // Average gap between consecutive poops (hours)
  const ts = rows.map((r) => new Date(r.logged_at).getTime()).sort((a, b) => a - b);
  const gapsHours: number[] = [];
  for (let i = 1; i < ts.length; i++) {
    gapsHours.push((ts[i] - ts[i - 1]) / (1000 * 60 * 60));
  }
  const avgGap =
    gapsHours.length > 0
      ? gapsHours.reduce((a, b) => a + b, 0) / gapsHours.length
      : null;

  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-10">
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Link href="/home">
          <button className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-stone-800">Your stats</h1>
          <p className="text-xs text-stone-400">Last 30 days · {rows.length} logs</p>
        </div>
      </header>

      <div className="px-5 space-y-4">
        {rows.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-100">
            <p className="text-sm text-stone-500">
              No entries yet. Log a few poops to see trends here.
            </p>
          </div>
        ) : (
          <>
            {/* Timing histogram */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-stone-700">Poop timing</h2>
              </div>
              <p className="text-xs text-stone-400 mb-4">
                Most active:{" "}
                <span className="font-medium text-stone-600">
                  {peakHour.toString().padStart(2, "0")}:00
                </span>
              </p>
              <div className="flex items-end gap-[2px] h-24">
                {hourBuckets.map((count, h) => (
                  <div
                    key={h}
                    className="flex-1 bg-amber-500/80 rounded-t"
                    style={{
                      height: `${(count / maxCount) * 100}%`,
                      minHeight: count > 0 ? 2 : 0,
                    }}
                    title={`${h}:00 — ${count}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>0</span>
                <span>6</span>
                <span>12</span>
                <span>18</span>
                <span>23</span>
              </div>
            </div>

            {/* Duration + Gap */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-amber-600" />
                  <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                    Avg duration
                  </h2>
                </div>
                <p className="text-2xl font-bold text-stone-800">
                  {formatDuration(avgDuration)}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {durations.length} timed log{durations.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="w-4 h-4 text-amber-600" />
                  <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                    Avg gap
                  </h2>
                </div>
                <p className="text-2xl font-bold text-stone-800">
                  {formatGap(avgGap)}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Between consecutive poops
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
