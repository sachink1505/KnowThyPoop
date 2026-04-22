"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function EntryImageViewer({ entryId }: { entryId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reveal() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/entries/${entryId}/image`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load image");
      }
      const { url } = await res.json();
      setUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load image");
    } finally {
      setLoading(false);
    }
  }

  function hide() {
    setUrl(null);
  }

  return (
    <div className="mt-3 space-y-2">
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Logged entry"
            className="w-full rounded-xl border border-stone-100"
          />
          <button
            type="button"
            onClick={hide}
            className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <EyeOff className="w-4 h-4" />
            Hide image
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={reveal}
          disabled={loading}
          className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {loading ? "Loading…" : "View image"}
        </button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
