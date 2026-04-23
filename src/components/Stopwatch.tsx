"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";

type Props = {
  value: number | null;
  onChange: (seconds: number | null) => void;
};

const STORAGE_KEY = "ktp.stopwatch";

type Persisted = {
  startedAt: number | null; // epoch ms when running; null when paused
  baseSeconds: number;       // accumulated seconds while paused
};

function readStore(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (
      typeof parsed.baseSeconds !== "number" ||
      (parsed.startedAt != null && typeof parsed.startedAt !== "number")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(p: Persisted) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function clearStore() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

export function Stopwatch({ value, onChange }: Props) {
  // Restore state on mount from localStorage (survives app minimize/foreground).
  const initial = (() => {
    const stored = readStore();
    if (stored) return stored;
    return { startedAt: null, baseSeconds: value ?? 0 } as Persisted;
  })();

  const [startedAt, setStartedAt] = useState<number | null>(initial.startedAt);
  const [baseSeconds, setBaseSeconds] = useState<number>(initial.baseSeconds);
  const [, force] = useState(0); // tick

  const running = startedAt != null;
  const elapsed = running
    ? baseSeconds + Math.floor((Date.now() - startedAt) / 1000)
    : baseSeconds;

  // Push any restored running state to the parent on mount so the saved value
  // reflects the true clock.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (running || baseSeconds > 0) {
      onChange(elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick while running — also survives background because we compute from
  // Date.now() each tick rather than accumulating. If the WebView throttles
  // the interval while backgrounded, the next fire still catches up.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Recompute on visibility change / focus so the UI snaps up after resume.
  useEffect(() => {
    const resync = () => force((n) => n + 1);
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    return () => {
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("focus", resync);
    };
  }, []);

  const persist = useCallback((p: Persisted) => {
    if (p.startedAt == null && p.baseSeconds === 0) clearStore();
    else writeStore(p);
  }, []);

  function toggle() {
    if (running) {
      const now = Date.now();
      const addedSecs = Math.floor((now - (startedAt ?? now)) / 1000);
      const newBase = baseSeconds + addedSecs;
      setStartedAt(null);
      setBaseSeconds(newBase);
      persist({ startedAt: null, baseSeconds: newBase });
      onChange(newBase > 0 ? newBase : null);
    } else {
      const now = Date.now();
      setStartedAt(now);
      persist({ startedAt: now, baseSeconds });
    }
  }

  function reset() {
    setStartedAt(null);
    setBaseSeconds(0);
    clearStore();
    onChange(null);
  }

  function addMinute() {
    // Add 60 seconds regardless of running state.
    if (running) {
      const newBase = baseSeconds + 60;
      setBaseSeconds(newBase);
      persist({ startedAt, baseSeconds: newBase });
      onChange(newBase + Math.floor((Date.now() - (startedAt ?? 0)) / 1000));
    } else {
      const newBase = baseSeconds + 60;
      setBaseSeconds(newBase);
      persist({ startedAt: null, baseSeconds: newBase });
      onChange(newBase);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 h-12">
      <button
        type="button"
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition ${
          running ? "bg-red-500 text-white" : "bg-amber-600 text-white"
        }`}
        aria-label={running ? "Pause" : "Start"}
      >
        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <span className="text-base font-mono font-semibold text-stone-800 tabular-nums flex-1 text-center">
        {formatTime(elapsed)}
      </span>
      <button
        type="button"
        onClick={addMinute}
        className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center active:scale-95 transition"
        aria-label="Add one minute"
        title="+1 min"
      >
        <Plus className="w-4 h-4" />
      </button>
      {(elapsed > 0 || value != null) && !running && (
        <button
          type="button"
          onClick={reset}
          className="w-8 h-8 text-stone-400 hover:text-stone-600 active:scale-95 transition flex items-center justify-center"
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
