import CruiseSearchForm from "./CruiseSearchForm";

export default function CruiseHero() {
  return (
    <section className="relative w-full min-h-[500px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=2000&q=80"
        alt="Cruise ships on the ocean"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/70 via-[#0a1628]/40 to-transparent" />

      <div className="relative z-10 flex flex-col justify-center min-h-[500px] px-10 py-14 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-2xl">
          Discover the World's Most Breathtaking Cruises
        </h1>
        <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl">
          Explore stunning destinations and world-class experiences aboard our
          award-winning ships
        </p>

        <div className="mt-10 w-full max-w-4xl">
          <CruiseSearchForm />
        </div>
      </div>
    </section>
  );
}
