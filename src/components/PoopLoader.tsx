type Props = {
  label?: string;
  fullScreen?: boolean;
};

/**
 * A themed loader: a bouncing poop emoji over a small amber ring.
 * Used for route transitions to avoid a blank white flash.
 */
export function PoopLoader({ label = "Loading…", fullScreen = true }: Props) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"
          aria-hidden
        />
        <span className="text-4xl ktp-wobble" aria-hidden>
          💩
        </span>
      </div>
      {label && (
        <p className="text-sm font-medium text-stone-500">{label}</p>
      )}
    </div>
  );

  if (!fullScreen) return content;
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
      {content}
    </main>
  );
}
