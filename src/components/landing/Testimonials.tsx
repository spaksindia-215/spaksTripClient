"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

type Testimonial = {
  title: string;
  body: string;
  name: string;
  location: string;
  rating: number;
  avatar: string;
  featured?: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  {
    title: "Great Hospitalization",
    body:
      "Dream Tours is the only way to go. We had the time of our life on our trip to the Ark. The customer service was wonderful & the staff was very helpful.",
    name: "Andrew Fetcher",
    location: "Newyork, United States",
    rating: 5.0,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    featured: true,
  },
  {
    title: "Hidden Treasure",
    body:
      "I went on the Gone with the Wind tour, and it was my first multi-day bus tour. The experience was terrific, thanks to the friendly tour guides.",
    name: "Bryan Bradfield",
    location: "Cape Town, South Africa",
    rating: 5.0,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    title: "Easy to Find your Leisuere Place",
    body:
      "Thanks for arranging a smooth travel experience for us. Our cab driver was polite, timely, and helpful. The team ensured making it a stress-free trip.",
    name: "Prajakta Sasane",
    location: "Paris, France",
    rating: 5.0,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    title: "Incredible Safari",
    body:
      "The safari itinerary was perfectly paced. We saw the Big Five and our guide's knowledge made every stop memorable. Would book again without hesitation.",
    name: "Liam Carter",
    location: "Nairobi, Kenya",
    rating: 5.0,
    avatar:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=200&q=80",
  },
  {
    title: "Seamless Booking",
    body:
      "From visa to hotel, everything was taken care of. I just had to show up and enjoy. Highly recommend Spaks Trip for hassle-free international travel.",
    name: "Sofia Rossi",
    location: "Rome, Italy",
    rating: 5.0,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
];

const VISIBLE = 3;

export default function Testimonials() {
  const [start, setStart] = useState(0);
  const total = TESTIMONIALS.length;
  const visible = Array.from({ length: VISIBLE }, (_, i) => TESTIMONIALS[(start + i) % total]);

  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute right-10 top-10 text-[#E0382E]" aria-hidden="true">
        <svg viewBox="0 0 60 60" width={60} height={60} fill="currentColor">
          <path d="M30 0 34 26 60 30 34 34 30 60 26 34 0 30 26 26Z" />
        </svg>
        <svg viewBox="0 0 40 40" width={40} height={40} fill="#9ACD32" className="absolute -right-6 top-2">
          <path d="M20 0 22 18 40 20 22 22 20 40 18 22 0 20 18 18Z" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading title="What’s Our User Says" />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <CircleButton
            ariaLabel="Previous testimonials"
            onClick={() => setStart((s) => (s - 1 + total) % total)}
            direction="left"
          />
          <CircleButton
            ariaLabel="Next testimonials"
            onClick={() => setStart((s) => (s + 1) % total)}
            direction="right"
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
      <h3 className="text-lg font-bold text-[#0E1E3A]">{testimonial.title}</h3>
      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-zinc-600">
        {testimonial.body}
      </p>
      <div className="my-5 h-px bg-zinc-200" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="h-11 w-11 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <p
              className={`text-sm font-semibold ${
                testimonial.featured ? "text-[#E0382E]" : "text-[#0E1E3A]"
              }`}
            >
              {testimonial.name}
            </p>
            <p className="text-xs text-zinc-500">{testimonial.location}</p>
          </div>
        </div>
        <span className="rounded-md bg-[#FFC72C] px-2 py-1 text-xs font-bold text-[#0E1E3A]">
          {testimonial.rating.toFixed(1)}
        </span>
      </div>
    </article>
  );
}

function CircleButton({
  ariaLabel,
  onClick,
  direction,
}: {
  ariaLabel: string;
  onClick: () => void;
  direction: "left" | "right";
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full bg-white text-zinc-700 shadow ring-1 ring-black/5 hover:bg-zinc-50"
    >
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}
