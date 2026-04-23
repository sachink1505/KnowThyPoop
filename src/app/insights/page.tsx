"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { EntryCard } from "@/components/EntryCard";
import { createClient } from "@/lib/supabase/client";
import type { PoopEntry } from "@/types/database";

export default function InsightsPage() {
  const [entries, setEntries] = useState<PoopEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchEntries() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("poop_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false });

      setEntries(data ?? []);
      setIsLoading(false);
    }
    fetchEntries();
  }, []);

  const entryDates = entries.map((e) => new Date(e.logged_at));

  const selectedEntries = selectedDate
    ? entries.filter((e) => isSameDay(new Date(e.logged_at), selectedDate))
    : [];

  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Link href="/home">
          <button className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
        </Link>
        <h1 className="text-lg font-bold text-stone-800">Past insights</h1>
      </header>

      <div className="px-5 space-y-5">
        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasEntry: entryDates }}
            modifiersClassNames={{
              hasEntry:
                "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-amber-500",
            }}
            disabled={{ after: new Date() }}
          />
        </div>

        {/* Entries for selected date */}
        {selectedDate && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
              {format(selectedDate, "EEEE, d MMMM")}
            </p>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            ) : selectedEntries.length === 0 ? (
              <div className="bg-white rounded-2xl p-5 border border-stone-100 text-center">
                <p className="text-stone-400 text-sm">No logs for this day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
