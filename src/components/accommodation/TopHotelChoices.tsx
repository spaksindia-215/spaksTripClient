import SectionHeading from "@/components/landing/SectionHeading";

type HotelChoice = {
  title: string;
  image: string;
};

const CHOICES: HotelChoice[] = [
  { title: "Haridwar", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80" },
  { title: "Bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80" },
  { title: "Abu Dhabi", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80" },
  { title: "Mumbai", image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80" },
  { title: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80" },
  { title: "Dubai", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80" },
  { title: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80" },
  { title: "Jaipur", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80" },
  { title: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80" },
  { title: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80" },
  { title: "Rishikesh", image: "https://images.unsplash.com/photo-1591017403286-fd8493524e1d?auto=format&fit=crop&w=900&q=80" },
  { title: "Shimla", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80" },
];

export default function TopHotelChoices() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading title="Top Hotel Choices" />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CHOICES.map((h) => (
            <HotelChoiceCard key={h.title} hotel={h} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HotelChoiceCard({ hotel }: { hotel: HotelChoice }) {
  return (
    <a
      href="#"
      aria-label={`Hotels in ${hotel.title}`}
      className="group relative h-56 block overflow-hidden rounded-xl"
    >
      <img
        src={hotel.image}
        alt={hotel.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-lg font-bold text-white drop-shadow">
        {hotel.title}
      </span>
    </a>
  );
}
