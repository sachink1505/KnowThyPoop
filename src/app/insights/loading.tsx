import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-28">
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </header>
      <div className="px-5 space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </main>
  );
}
