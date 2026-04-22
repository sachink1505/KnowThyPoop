import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-stone-50 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
        <Compass className="w-9 h-9 text-stone-500" />
      </div>
      <h1 className="text-2xl font-bold text-stone-800">Page not found</h1>
      <p className="text-sm text-stone-500 mt-2 max-w-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/home" className="mt-8 w-full max-w-xs">
        <Button className="w-full h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold">
          <Home className="w-4 h-4 mr-2" />
          Back to home
        </Button>
      </Link>
    </main>
  );
}
