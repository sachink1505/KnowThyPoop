"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Props = {
  iso: string;
  pattern: string;
};

/**
 * Renders a timestamp in the user's device local timezone. Renders nothing
 * on the server so SSR/client don't disagree — this avoids hydration flicker
 * showing UTC before hydration.
 */
export function LocalTime({ iso, pattern }: Props) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    setText(format(new Date(iso), pattern));
  }, [iso, pattern]);
  return <>{text ?? ""}</>;
}
