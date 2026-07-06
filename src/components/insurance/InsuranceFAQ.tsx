"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "What is insurance and why do I need it?",
    answer: "Insurance is a financial safety net that protects you against unexpected losses. It ensures that in the event of an accident, illness, or other unforeseen event, you are not left bearing the full financial burden alone.",
  },
  {
    question: "How do I file an insurance claim?",
    answer: "To file a claim, contact our support team or visit our online portal. You will need to provide your policy number, details of the incident, and relevant supporting documents. Our team will guide you through every step.",
  },
  {
    question: "What is a premium and how is it calculated?",
    answer: "A premium is the amount you pay periodically (monthly/annually) to keep your insurance active. It is calculated based on factors like your age, health, vehicle type, coverage amount, and risk profile.",
  },
  {
    question: "Can I buy insurance online?",
    answer: "Yes! You can purchase, renew, and manage all your insurance policies entirely online through our platform. The process is simple, paperless, and takes just a few minutes.",
  },
  {
    question: "What is the difference between term life and whole life insurance?",
    answer: "Term life insurance provides coverage for a fixed period (e.g., 20 years) and pays out only if you pass away during that term. Whole life insurance provides lifelong coverage and includes a savings/investment component.",
  },
];

export default function InsuranceFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-[#fdecea] py-16 overflow-hidden">
      <svg aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-30" viewBox="0 0 500 600" fill="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M${-50 + i * 30} 0 Q${200 + i * 20} ${150 + i * 30} ${500} ${300 + i * 20}`} stroke="#e57373" strokeWidth="1" />
        ))}
      </svg>

      <div className="relative mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-extrabold text-[#0E1E3A] mb-8">FAQ&apos;s Related to Insurance</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question} className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base font-semibold ${isOpen ? "text-[#E0382E]" : "text-[#0E1E3A]"}`}>
                    {isOpen ? `${i + 1}. ` : ""}{faq.question}
                  </span>
                  <span className="ml-4 shrink-0 text-zinc-500">
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
