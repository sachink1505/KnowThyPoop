import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="flex flex-col min-h-screen bg-stone-50 pb-28">
      <header className="flex items-center justify-between px-5 pt-12 pb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </header>

      <div className="px-5 space-y-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </main>
  );
}
