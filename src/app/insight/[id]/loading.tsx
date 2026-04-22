import { Skeleton } from "@/components/ui/skeleton";

export default function InsightLoading() {
  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-28">
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </header>

      <div className="px-5 space-y-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </main>
  );
}
