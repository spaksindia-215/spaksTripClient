import SectionHeading from "@/components/landing/SectionHeading";

type UpcomingEvent = { title: string; date: string; location: string; image: string };

const UPCOMING: UpcomingEvent[] = [
  {
    title: "Royal Wedding Gala",
    date: "15 May 2026",
    location: "The Leela Palace, Delhi",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Tech Summit 2026",
    date: "22 May 2026",
    location: "Aerocity Convention Centre",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Beach Destination Wedding",
    date: "1 Jun 2026",
    location: "Goa Beach Resort",
    image: "https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Grand Birthday Bash",
    date: "10 Jun 2026",
    location: "Sky Lounge, Noida",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Corporate Awards Night",
    date: "20 Jun 2026",
    location: "Taj Diplomatic Enclave",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Cocktail & Mixer Evening",
    date: "28 Jun 2026",
    location: "Rooftop Garden, Gurugram",
    image: "https://images.unsplash.com/photo-1543007631-283050bb3e8c?auto=format&fit=crop&w=800&q=80",
  },
];

export default function UpcomingEvents() {
  return (
    <section className="bg-[#F4F6F9] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="Upcoming Events"
          subtitle="Don't miss these extraordinary experiences — book your spot today"
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {UPCOMING.map((evt) => (
            <a
              key={evt.title}
              href="#"
              className="group relative block h-64 rounded-2xl overflow-hidden"
            >
              <img
                src={evt.image}
                alt={evt.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-lg font-bold leading-snug">{evt.title}</p>
                <p className="mt-1 text-sm text-white/80">{evt.date} · {evt.location}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
