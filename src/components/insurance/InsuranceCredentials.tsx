type Credential = { title: string; desc: string; bg: string; icon: React.ReactNode };

const CREDENTIALS: Credential[] = [
  {
    title: "11,800+ Network Garages",
    desc: "Enjoy cashless services at over 11,800 network garages, conveniently located across India for hassle-free repairs.",
    bg: "#EF4444",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    title: "8,000+ Network Hospitals",
    desc: "Access cashless treatment at more than 8,000 network hospitals, ensuring support wherever you need it.",
    bg: "#7C3AED",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
        <path d="M12 3l7 4v5c0 4-3 7.5-7 9-4-1.5-7-5-7-9V7l7-4z" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
  },
  {
    title: "Trusted Brand",
    desc: "25 glorious years of serving our customers with prompt and reliable insurance solutions they can count on.",
    bg: "#0891B2",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    title: "Claim Experience",
    desc: "Your trust drives us to deliver fast, fair, and worry-free claim resolutions every single time.",
    bg: "#16A34A",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

export default function InsuranceCredentials() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-2xl font-extrabold text-[#0E1E3A] mb-8">Our Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CREDENTIALS.map((c) => (
            <div
              key={c.title}
              className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: c.bg }}
              >
                {c.icon}
              </span>
              <div>
                <p className="text-base font-bold text-[#0E1E3A] mb-1">{c.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
