"use client";

export const AVATAR_SEEDS = [
  "bean",
  "sprout",
  "cocoa",
  "mango",
  "peach",
  "ember",
  "sage",
  "clay",
];

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
}

type Props = {
  value: string;
  onChange: (seed: string) => void;
};

export function AvatarPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATAR_SEEDS.map((seed) => {
        const selected = seed === value;
        return (
          <button
            key={seed}
            type="button"
            onClick={() => onChange(seed)}
            className={`aspect-square rounded-full overflow-hidden border-2 transition active:scale-95 ${
              selected
                ? "border-amber-600 ring-2 ring-amber-200"
                : "border-stone-200 hover:border-amber-300"
            }`}
            aria-label={`Avatar ${seed}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl(seed)} alt="" className="w-full h-full bg-amber-50" />
          </button>
        );
      })}
    </div>
  );
}
