"use client";

import { useState } from "react";

type FAQItem = { question: string; answer: string };

const FAQS: FAQItem[] = [
  {
    question: "What is Permanent Residency (PR) ?",
    answer: "We offer a wide range of tours, including cultural, adventure, luxury, and customized itineraries. Popular destinations include Europe, Africa (e.g., Morocco),",
  },
  {
    question: "Are the tours customizable?",
    answer: "Yes, all our tour packages can be fully customized to meet your preferences, budget, and travel schedule. Contact our team to plan your perfect itinerary.",
  },
  {
    question: "What safety measures do you follow?",
    answer: "We follow all government-mandated safety protocols, work only with verified partners, and ensure 24/7 support for travellers during their journey.",
  },
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 4–6 weeks in advance for domestic tours and 2–3 months for international tours to ensure the best availability and pricing.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "Cancellations made 30+ days before departure receive a full refund. Cancellations within 15–30 days incur a 25% fee. Within 15 days, 50% is non-refundable.",
  },
];

export default function VisaFAQ({ title }: { title: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-[#fdecea] py-16 overflow-hidden">
      {/* Decorative wavy lines */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-30"
        viewBox="0 0 500 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d={`M${-50 + i * 30} 0 Q${200 + i * 20} ${150 + i * 30} ${500} ${300 + i * 20}`}
            stroke="#e57373"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="relative mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-extrabold text-[#0E1E3A] mb-8">
          FAQ&apos;s Related to {title}
        </h2>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.question}
                className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base font-semibold ${isOpen ? "text-[#E0382E]" : "text-[#0E1E3A]"}`}>
                    {isOpen ? `${i + 1}. ` : ""}{faq.question}
                  </span>
                  <span className="ml-4 shrink-0 text-zinc-500 text-xl font-light">
                    {isOpen ? (
                      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <rect x="4" y="11" width="16" height="2" rx="1" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
