"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

type Props = {
  value: number | null;
  onChange: (seconds: number | null) => void;
};

function format(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

export function Stopwatch({ value, onChange }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(value ?? 0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startedAt.current != null) {
        setElapsed((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) {
      setRunning(false);
      startedAt.current = null;
      onChange(elapsed > 0 ? elapsed : null);
    } else {
      startedAt.current = Date.now();
      setRunning(true);
    }
  }

  function reset() {
    setRunning(false);
    startedAt.current = null;
    setElapsed(0);
    onChange(null);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 h-12">
      <button
        type="button"
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition ${
          running
            ? "bg-red-500 text-white"
            : "bg-amber-600 text-white"
        }`}
        aria-label={running ? "Pause" : "Start"}
      >
        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <span className="text-base font-mono font-semibold text-stone-800 tabular-nums">
        {format(elapsed)}
      </span>
      {(elapsed > 0 || value != null) && !running && (
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-stone-400 hover:text-stone-600 active:scale-95 transition"
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
