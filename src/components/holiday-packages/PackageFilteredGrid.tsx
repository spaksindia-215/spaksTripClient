"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import TourPackageCard, { type TourPackage } from "./TourPackageCard";

type FilterKey = "All" | "Budget" | "Premium" | "Luxury";

type Props = {
  packages: TourPackage[];
};

export default function PackageFilteredGrid({ packages }: Props) {
  const [filter, setFilter] = useState<FilterKey>("All");

  const displayed = filter === "All"
    ? packages
    : packages.filter((p) => p.category === filter);

  const hasCategories = packages.some((p) => p.category);

  return (
    <div className="flex flex-col gap-6">
      {hasCategories && (
        <div className="flex flex-wrap gap-2">
          {(["All", "Budget", "Premium", "Luxury"] as FilterKey[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((pkg) => (
          <TourPackageCard key={pkg.title} pkg={pkg} />
        ))}
      </div>
    </div>
  );
}
