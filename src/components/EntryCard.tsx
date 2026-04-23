"use client";

import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import type { PoopEntry } from "@/types/database";

function urgencyLabel(v: number | null) {
  if (!v) return null;
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
  if (v == null) return null;
  if (v <= 0) return "No odour";
  return v <= 2 ? "Mild" : "Strong";
}

function formatDuration(s: number | null) {
  if (s == null || s <= 0) return null;
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

const COMP_ICON: Record<string, string> = {
  rock: "/poop-icons/rock.svg",
  pellets: "/poop-icons/pellets.svg",
  smooth: "/poop-icons/smooth.svg",
  mushy: "/poop-icons/mushy.svg",
};

const VOLUME_EMOJI: Record<string, string> = {
  small: "🥜",
  childlike: "👶",
  normal: "👍",
  large: "💪",
};

export function EntryCard({ entry, large }: { entry: PoopEntry; large?: boolean }) {
  const score = entry.score;
  const urgency = urgencyLabel(entry.urgency);
  const odour = odourLabel(entry.odour);
  const duration = formatDuration(entry.duration_seconds);

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

            {/* Trait chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {entry.poop_color && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-50 rounded-full pl-1 pr-2 py-0.5"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-stone-200"
                    style={{ background: COLOR_HEX[entry.poop_color] }}
                  />
                  {entry.poop_color.replace("_", " ")}
                </span>
              )}
              {entry.poop_composition && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-50 rounded-full pl-1 pr-2 py-0.5">
                  <Image
                    src={COMP_ICON[entry.poop_composition]}
                    alt=""
                    width={14}
                    height={14}
                  />
                  {entry.poop_composition}
                </span>
              )}
              {entry.poop_volume && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-50 rounded-full px-2 py-0.5">
                  <span>{VOLUME_EMOJI[entry.poop_volume]}</span>
                  {entry.poop_volume.replace("_", " ")}
                </span>
              )}
              {duration && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-50 rounded-full px-2 py-0.5">
                  ⏱ {duration}
                </span>
              )}
            </div>

            {/* Secondary row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {urgency && (
                <span className={`text-xs font-medium ${urgencyColor(entry.urgency)}`}>
                  {urgency} urgency
                </span>
              )}
              {urgency && odour && <span className="text-stone-200">·</span>}
              {odour && <span className="text-xs text-stone-500">{odour}</span>}
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
