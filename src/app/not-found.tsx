import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-stone-50 px-6 text-center">
      <div className="text-7xl mb-6 ktp-wobble" aria-hidden>💩</div>
      <h1 className="text-2xl font-bold text-stone-800">
        This page went down the drain
      </h1>
      <p className="text-sm text-stone-500 mt-2 max-w-sm leading-relaxed">
        The page doesn&apos;t exist, or has moved on.
      </p>
      <Link href="/home" className="mt-8 w-full max-w-xs">
        <Button className="w-full h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold">
          <Home className="w-4 h-4 mr-2" />
          Back home
        </Button>
      </Link>
    </main>
  );
}
