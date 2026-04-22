"use client";

import type { ReactNode } from "react";

export type PickerOption<T extends string> = {
  value: T;
  label: string;
  visual: ReactNode;
};

type Props<T extends string> = {
  options: PickerOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: 3 | 4;
};

export function PoopPicker<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
}: Props<T>) {
  const colsClass = columns === 3 ? "grid-cols-3" : "grid-cols-4";
  return (
    <div className={`grid ${colsClass} gap-2`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 transition active:scale-95 ${
              selected
                ? "border-amber-600 bg-amber-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-amber-300"
            }`}
          >
            <div className="text-2xl leading-none flex items-center justify-center">
              {opt.visual}
            </div>
            <span
              className={`text-[11px] font-medium text-center px-1 leading-tight ${
                selected ? "text-amber-800" : "text-stone-600"
              }`}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
