import Skeleton from "@/components/ui/Skeleton";

export default function HotelResultsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row overflow-hidden rounded-xl bg-white border border-border-soft"
        >
          <Skeleton className="h-48 sm:h-auto sm:w-52 shrink-0" />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3.5 w-32 rounded" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-end justify-between mt-auto pt-2">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-7 w-28 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
