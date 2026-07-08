import SectionHeading from "@/components/landing/SectionHeading";

type Review = { name: string; event: string; rating: number; comment: string; avatar: string };

const REVIEWS: Review[] = [
  {
    name: "Priya Sharma",
    event: "Wedding Planner",
    rating: 5,
    comment:
      "Absolutely magical experience! Every detail was handled with such care. Our wedding day was beyond what we had imagined. Highly recommend SpaksTrip Events!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Rahul Mehta",
    event: "Corporate Events",
    rating: 5,
    comment:
      "Professional, punctual, and creative. The team transformed our annual summit into a world-class event. Our clients were thoroughly impressed.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Anjali Verma",
    event: "Destination Wedding",
    rating: 5,
    comment:
      "We had our dream beach wedding in Goa and it was picture-perfect. The coordination across vendors was seamless. Would do it all over again!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Karan Singh",
    event: "Birthday Party Planner",
    rating: 4,
    comment:
      "My wife's 30th birthday surprise was executed flawlessly. The décor, food, and entertainment — everything was spot on. Truly a night to remember.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Neha Kapoor",
    event: "Engagement Planner",
    rating: 5,
    comment:
      "From the flower arrangements to the ring presentation, every moment was crafted with love. Our families were moved to tears. Simply outstanding!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Amit Gupta",
    event: "Cocktail Party",
    rating: 4,
    comment:
      "Organized a rooftop cocktail mixer for 80 guests. The ambiance was stunning, the bar was well-stocked, and the team was incredibly responsive.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width={16}
          height={16}
          fill={i < count ? "#F59E0B" : "none"}
          stroke="#F59E0B"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function EventReviews() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title="What Our Clients Say"
          subtitle="Real stories from real clients who trusted us with their most important moments"
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-[#F9FAFB] p-6 hover:shadow-md transition-shadow"
            >
              <Stars count={r.rating} />
              <p className="text-sm text-zinc-600 leading-relaxed flex-1">"{r.comment}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-200">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="h-10 w-10 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0E1E3A]">{r.name}</p>
                  <p className="text-xs text-zinc-500">{r.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
