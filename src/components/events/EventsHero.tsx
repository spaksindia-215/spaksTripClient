export default function EventsHero() {
  return (
    <section className="relative w-full min-h-[520px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=80"
        alt="Event venue aerial view at night"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col justify-center min-h-[520px] px-10 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
          Best Event Planner in Badarpur Delhi,
        </h1>
        <p className="mt-4 text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
          We are a creative event company dedicated to turning ideas into
          unforgettable experiences. From corporate events to weddings, we
          manage every detail with perfection.
        </p>
      </div>
    </section>
  );
}
