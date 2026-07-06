"use client";

import { useCallback, useEffect, useState } from "react";

type Slide = {
  src: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
    alt: "Woman on cliff overlooking ocean at sunset",
  },
  {
    src: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=2000&q=80",
    alt: "Long-tail boats on Thailand beach",
  },
  {
    src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80",
    alt: "Tropical beach with palm trees",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    setIndex((prev) => {
      const total = SLIDES.length;
      return ((next % total) + total) % total;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-label="Featured destinations"
      className="relative w-full overflow-hidden bg-black"
    >
      <div className="relative h-[72vh] min-h-[420px] w-full overflow-hidden">
  <div
    className="flex h-full transition-transform duration-700 ease-in-out"
    style={{ transform: `translateX(-${index * 100}%)` }}
  >
    {SLIDES.map((slide, i) => (
      <img
        key={slide.src}
        src={slide.src}
        alt={slide.alt}
        className="h-full w-full flex-shrink-0 object-cover"
        loading={i === 0 ? "eager" : "lazy"}
      />
    ))}
  </div>

  {/* Buttons stay same */}
  <button
    type="button"
    aria-label="Previous slide"
    onClick={() => goTo(index - 1)}
    className="absolute left-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 transition"
  >
    <Chevron direction="left" />
  </button>

  <button
    type="button"
    aria-label="Next slide"
    onClick={() => goTo(index + 1)}
    className="absolute right-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 transition"
  >
    <Chevron direction="right" />
  </button>

  {/* Dots stay same */}
  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
    {SLIDES.map((_, i) => (
      <button
        key={i}
        type="button"
        aria-label={`Go to slide ${i + 1}`}
        onClick={() => goTo(i)}
        className={`h-2 rounded-full transition-all ${
          i === index ? "w-8 bg-white" : "w-2 bg-white/60"
        }`}
      />
    ))}
  </div>
</div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}
