type Review = { name: string; plan: string; rating: number; comment: string; avatar: string };

const REVIEWS: Review[] = [
  {
    name: "Suresh Patel",
    plan: "Car Insurance",
    rating: 5,
    comment: "Claim process was incredibly smooth. Within 48 hours my car was in the workshop and everything was handled without any paperwork hassle. Truly a trustworthy insurer.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Rekha Nair",
    plan: "Health Insurance",
    rating: 5,
    comment: "Got cashless hospitalization at a network hospital with zero stress. The team was responsive throughout. Highly recommend their health plans to every family.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Manish Dubey",
    plan: "Travel Insurance",
    rating: 4,
    comment: "My flight got cancelled and the claim was settled in under a week. Great coverage for international trips. Will definitely renew before my next journey.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Priya Kapoor",
    plan: "Term Life Insurance",
    rating: 5,
    comment: "Bought a term plan for my family's financial security. The advisor was transparent, premiums are affordable, and the coverage gives real peace of mind.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Arjun Sharma",
    plan: "2 Wheeler Insurance",
    rating: 4,
    comment: "Renewed my bike insurance online in under 5 minutes. Very easy process, instant policy document, and good network garages nearby. Great value for money.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Deepa Menon",
    plan: "LIC Policy",
    rating: 5,
    comment: "My LIC maturity claim was processed promptly. The support team helped me with every document. 25 years of trust — this brand never lets you down.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" width={16} height={16} fill={i < count ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth={1.5} aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function InsuranceReviews() {
  return (
    <section className="bg-[#F4F6F9] py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-extrabold text-[#0E1E3A] mb-2">Review &amp; Rating</h2>
        <p className="text-sm text-zinc-500 mb-8">What our policyholders say about their experience with us</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-md transition-shadow">
              <Stars count={r.rating} />
              <p className="text-sm text-zinc-600 leading-relaxed flex-1">"{r.comment}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
                <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="text-sm font-semibold text-[#0E1E3A]">{r.name}</p>
                  <p className="text-xs text-zinc-500">{r.plan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
