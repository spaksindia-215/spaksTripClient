import Skeleton from "@/components/ui/Skeleton";

export default function FlightResultsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-border-soft p-5 grid grid-cols-[1fr_2fr_1fr_auto] gap-4 items-center"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16 mt-2" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div><Skeleton className="h-5 w-14" /><Skeleton className="h-2.5 w-20 mt-2" /></div>
            <Skeleton className="h-0.5 w-24 mx-2" />
            <div><Skeleton className="h-5 w-14" /><Skeleton className="h-2.5 w-20 mt-2" /></div>
          </div>
          <div className="text-right">
            <Skeleton className="h-6 w-24 ml-auto" />
            <Skeleton className="h-2.5 w-16 mt-2 ml-auto" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      ))}
    </div>
  );
}
