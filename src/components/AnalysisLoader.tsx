"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STATUS_MESSAGES = [
  "Analysing your poop…",
  "Checking stool form…",
  "Looking at colour and texture…",
  "Cross-referencing the Bristol scale…",
  "Thinking about hydration and fibre…",
  "Preparing your insights…",
];

export function AnalysisLoader() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-50/95 backdrop-blur-sm flex flex-col items-center justify-center px-8">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
      <p className="text-lg font-semibold text-stone-800 text-center">
        {STATUS_MESSAGES[idx]}
      </p>
      <p className="text-sm text-stone-500 text-center mt-2">
        This usually takes a few seconds.
      </p>
    </div>
  );
}
