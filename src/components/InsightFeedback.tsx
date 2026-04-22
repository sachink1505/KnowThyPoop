"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AnalysisFeedback } from "@/types/database";

export function InsightFeedback({
  entryId,
  initialFeedback,
}: {
  entryId: string;
  initialFeedback: AnalysisFeedback | null;
}) {
  const [thumbs, setThumbs] = useState<boolean | null>(
    initialFeedback?.thumbs ?? null
  );
  const [feedbackId, setFeedbackId] = useState<string | null>(
    initialFeedback?.id ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleFeedback(value: boolean) {
    if (isLoading) return;
    setIsLoading(true);

    const supabase = createClient();
    const newValue = thumbs === value ? null : value;
    setThumbs(newValue);

    if (feedbackId) {
      await supabase
        .from("analysis_feedback")
        .update({ thumbs: newValue })
        .eq("id", feedbackId);
    } else {
      const { data } = await supabase
        .from("analysis_feedback")
        .insert({ entry_id: entryId, thumbs: newValue })
        .select("id")
        .single();
      if (data) setFeedbackId(data.id);
    }

    setIsLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
      <p className="text-sm font-semibold text-stone-700 mb-3">
        Was this insight helpful?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => handleFeedback(true)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            thumbs === true
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-stone-50 text-stone-500 border border-stone-200 hover:border-emerald-200 hover:text-emerald-600"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Helpful
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            thumbs === false
              ? "bg-red-100 text-red-600 border border-red-200"
              : "bg-stone-50 text-stone-500 border border-stone-200 hover:border-red-200 hover:text-red-500"
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          Not helpful
        </button>
      </div>
    </div>
  );
}
