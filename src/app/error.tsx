"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-stone-50 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
        <AlertTriangle className="w-9 h-9 text-amber-600" />
      </div>
      <h1 className="text-2xl font-bold text-stone-800">Something went wrong</h1>
      <p className="text-sm text-stone-500 mt-2 max-w-sm leading-relaxed">
        We hit an unexpected error. You can try again, or head back home.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs text-stone-400">Reference: {error.digest}</p>
      )}
      <div className="flex gap-3 mt-8 w-full max-w-xs">
        <Button
          onClick={reset}
          className="flex-1 h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
        <Link href="/home" className="flex-1">
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl border-stone-200 text-stone-700 font-semibold"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>
    </main>
  );
}
