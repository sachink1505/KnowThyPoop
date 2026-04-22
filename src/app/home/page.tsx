import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Timer, Camera, Sparkles, UserCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/EntryCard";

const FEATURE_CARDS = [
  {
    icon: Timer,
    title: "Track your poop timing",
    desc: "Log when and how long to spot patterns in your rhythm.",
    bg: "bg-amber-500",
  },
  {
    icon: Camera,
    title: "Click a picture for health insights",
    desc: "Our AI analyses colour, form, and texture.",
    bg: "bg-stone-600",
  },
  {
    icon: Sparkles,
    title: "Get suggestions to improve quality",
    desc: "Personalised tips based on your gut health data.",
    bg: "bg-emerald-500",
  },
];

function dateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeStreak(loggedAts: string[]): number {
  if (loggedAts.length === 0) return 0;
  const days = new Set(loggedAts.map(dateKey));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);
  if (!days.has(dateKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dateKey(cursor.toISOString()))) return 0;
  }

  let streak = 0;
  while (days.has(dateKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      className="w-full max-w-[220px] mx-auto"
      aria-hidden
    >
      <ellipse cx="120" cy="142" rx="80" ry="8" fill="#E7E5E4" />
      <path
        d="M70 110 Q70 60 120 60 Q170 60 170 110 Z"
        fill="#FCD34D"
        stroke="#92400E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M70 110 Q70 130 90 135 L150 135 Q170 130 170 110 Z"
        fill="#F59E0B"
        stroke="#92400E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="102" cy="95" r="4" fill="#44403C" />
      <circle cx="138" cy="95" r="4" fill="#44403C" />
      <path
        d="M108 110 Q120 118 132 110"
        stroke="#44403C"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="92" cy="107" r="3" fill="#FB923C" opacity="0.6" />
      <circle cx="148" cy="107" r="3" fill="#FB923C" opacity="0.6" />
      <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
        <path d="M40 40 L48 48" />
        <path d="M200 40 L192 48" />
        <path d="M35 70 L45 70" />
        <path d="M205 70 L195 70" />
      </g>
      <circle cx="50" cy="25" r="3" fill="#FBBF24" />
      <circle cx="190" cy="28" r="2.5" fill="#FBBF24" />
      <circle cx="210" cy="90" r="2" fill="#FBBF24" />
    </svg>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [{ data: profile }, { data: entries }, { data: streakRows }] =
    await Promise.all([
      supabase.from("profiles").select("name").eq("id", user.id).single(),
      supabase
        .from("poop_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(10),
      supabase
        .from("poop_entries")
        .select("logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", sixtyDaysAgo.toISOString())
        .order("logged_at", { ascending: false }),
    ]);

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hasEntries = entries && entries.length > 0;
  const latestEntry = entries?.[0] ?? null;
  const recentEntries = entries?.slice(1, 4) ?? [];
  const streak = computeStreak((streakRows ?? []).map((r) => r.logged_at));

  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-5">
        <div>
          <p className="text-stone-400 text-sm">Hello,</p>
          <h1 className="text-xl font-bold text-stone-800">{firstName} 👋</h1>
        </div>
        <Link href="/profile">
          <button className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-transform">
            <UserCircle className="w-6 h-6 text-stone-500" />
          </button>
        </Link>
      </header>

      <div className="flex-1 px-5 space-y-5">
        {/* Streak pill */}
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-stone-100 w-fit">
            {streak > 2 ? (
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            ) : (
              <Flame className="w-4 h-4 text-stone-400" />
            )}
            <span className="text-sm font-semibold text-stone-700">
              {streak} {streak === 1 ? "day" : "days"} logged in a row
            </span>
          </div>
        )}

        {!hasEntries ? (
          /* ── Empty state ── */
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-center">
              <EmptyIllustration />
              <p className="font-semibold text-stone-800 text-base mt-3">
                Nothing logged yet
              </p>
              <p className="text-stone-400 text-xs mt-1">
                Tap the button below to log your first poop.
              </p>
            </div>
            {FEATURE_CARDS.map(({ icon: Icon, title, desc, bg }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-start gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{title}</p>
                  <p className="text-stone-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Non-empty state ── */
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                Latest log
              </p>
              {latestEntry && <EntryCard entry={latestEntry} large />}
            </div>

            {recentEntries.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                  Recent
                </p>
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/insights"
              className="block text-center text-sm font-medium text-amber-700 hover:text-amber-800 active:scale-95 transition-transform py-2"
            >
              View past insights →
            </Link>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
        <Link href="/log">
          <Button className="w-full h-14 rounded-2xl text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 active:scale-95 transition-transform">
            Track today&apos;s poop 💩
          </Button>
        </Link>
      </div>
    </main>
  );
}
