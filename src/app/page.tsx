"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const TAGLINES = [
  "Your poop is the data centre of your health.",
  "Every poop tells a story. Want to know yours?",
];

export default function WelcomePage() {
  const router = useRouter();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTaglineIndex((i) => (i + 1) % TAGLINES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 pb-28">
      <div className="text-center max-w-sm">
        <div className="mb-6 text-6xl">💩</div>
        <h1 className="text-4xl font-bold tracking-tight text-stone-800 mb-6">
          Know Thy Poop
        </h1>
        <p
          className="text-stone-500 text-lg leading-relaxed min-h-[3.5rem] transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
          {TAGLINES[taglineIndex]}
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
        <Button
          onClick={() => router.push("/auth")}
          className="w-full h-14 rounded-2xl text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200"
        >
          Get Started
        </Button>
      </div>
    </main>
  );
}
