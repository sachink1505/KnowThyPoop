"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

const SEGMENTS = [
  {
    label: "Composition",
    max: 30,
    color: "bg-amber-500",
    desc: "Bristol stool scale — smooth, sausage-shaped (types 3–4) scores highest.",
  },
  {
    label: "Colour",
    max: 25,
    color: "bg-stone-600",
    desc: "Medium brown is ideal. Black, red, pale or yellow score lower.",
  },
  {
    label: "Straining",
    max: 15,
    color: "bg-rose-500",
    desc: "No strain scores highest.",
  },
  {
    label: "Urgency",
    max: 10,
    color: "bg-sky-500",
    desc: "Low to medium urgency is healthiest.",
  },
  {
    label: "Volume",
    max: 10,
    color: "bg-emerald-500",
    desc: "Normal, satisfying volume scores highest.",
  },
  {
    label: "Odour",
    max: 10,
    color: "bg-violet-500",
    desc: "Mild or no odour scores highest.",
  },
];

export function ScoreExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-stone-400 hover:text-amber-700 active:scale-95 transition"
        aria-label="How is the score calculated?"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">
                    How your score works
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    A 0–100 snapshot across six traits.
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Segmented bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-2">
                {SEGMENTS.map((s) => (
                  <div
                    key={s.label}
                    className={s.color}
                    style={{ width: `${s.max}%` }}
                    title={`${s.label}: ${s.max}`}
                  />
                ))}
              </div>
              <div className="flex text-[10px] text-stone-400 mb-5">
                {SEGMENTS.map((s) => (
                  <div
                    key={s.label}
                    style={{ width: `${s.max}%` }}
                    className="text-center"
                  >
                    {s.max}
                  </div>
                ))}
              </div>

              <ul className="space-y-3">
                {SEGMENTS.map((s) => (
                  <li key={s.label} className="flex gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${s.color} mt-1.5 shrink-0`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-stone-700">
                        {s.label}{" "}
                        <span className="text-xs font-normal text-stone-400">
                          · up to {s.max}
                        </span>
                      </p>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-stone-400 mt-5 leading-relaxed">
                Missing traits are skipped — your score normalizes over what you
                logged. Add a photo to auto-fill colour, volume, and composition.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
