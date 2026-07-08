import HotelSearchForm from "./HotelSearchForm";

export default function HotelHero() {
  return (
    <section aria-label="Hotel booking" className="relative isolate">
      <div className="relative h-105 w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-brand-950/55 via-brand-900/40 to-brand-900/60" />
        <div className="absolute inset-x-0 top-0 mx-auto max-w-7xl px-6 pt-16 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[12px] font-semibold tracking-wide uppercase border border-white/20">
            Domestic & International
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
            Find your perfect stay
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] md:text-[17px] font-medium text-white/90">
            Compare prices across 50,000+ hotels worldwide. Best price guarantee
            with free cancellation on select properties.
          </p>
        </div>
      </div>

      <div className="relative z-10 -mt-28 px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <HotelSearchForm />
        </div>
      </div>
    </section>
  );
}
