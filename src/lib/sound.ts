export function playFlush() {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio("/sounds/flush.mp3");
    audio.volume = 0.5;
    void audio.play().catch(() => {});
  } catch {
    // ignore — autoplay blocked or asset missing
  }
}
