export default function AboutUs() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-4 -top-4 h-40 w-48 rounded-2xl bg-[#4F46E5]"
          />
          <div className="relative overflow-hidden rounded-2xl bg-[#9ACD32]">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
              alt="Happy travelers with backpacks"
              className="h-[460px] w-full object-cover mix-blend-multiply"
              loading="lazy"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-4 left-12 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-md"
          >
            <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden="true">
              <path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-8h4v8h-4Z" fill="#E74C3C" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0E1E3A]">
            About Us
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-500">
            We&apos;re thrilled to have you on board. At Spaks Trip, we specialize
            in crafting unforgettable journeys — whether you&apos;re exploring
            the charm of India or venturing across the globe.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-zinc-500">
            From flight bookings and hotel stays to visa support, cruises, and
            curated experiences — we handle it all. Get ready to travel smarter,
            safer, and in style. Let your next adventure begin with us!
          </p>
        </div>
      </div>
    </section>
  );
}
