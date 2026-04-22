import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-10">
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </header>
      <div className="px-5 space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
