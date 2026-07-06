export type TaxiPackage = {
  title: string;
  subtitle?: string;
  image: string;
};

export default function TaxiPackageCard({ pkg }: { pkg: TaxiPackage }) {
  return (
    <article className="relative h-52 overflow-hidden rounded-md">
      <img
        src={pkg.image}
        alt={pkg.title}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-base font-bold leading-snug text-white drop-shadow">
          {pkg.title}
        </p>
        {pkg.subtitle ? (
          <p className="mt-1 text-xs text-white/80 drop-shadow">{pkg.subtitle}</p>
        ) : null}
      </div>
    </article>
  );
}
