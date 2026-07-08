import Link from "next/link";
import ConsultForm from "./ConsultForm";

const VISA_TYPES = [
  { label: "PR Visa",       href: "/visa/pr-visa" },
  { label: "Work Visa",     href: "/visa/work-visa" },
  { label: "Investor Visa", href: "/visa/investor-visa" },
  { label: "Study Visa",    href: "/visa/study-visa" },
  { label: "Visit Visa",    href: "/visa/visit-visa" },
];

const TAGS = ["Luxury", "Travel", "Nature", "Photography"];

export default function VisaSidebar({
  activeVisa,
  visaType,
  showTags = false,
}: {
  activeVisa: string;
  visaType: string;
  showTags?: boolean;
}) {
  return (
    <aside className="w-full md:w-72 shrink-0 flex flex-col gap-6">
      {/* Type of Visa */}
      <div className="rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#1F86C7" strokeWidth={2} aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <h3 className="text-base font-bold text-[#0E1E3A]">Type Of Visa</h3>
        </div>
        <ul className="flex flex-col divide-y divide-zinc-100">
          {VISA_TYPES.map((v) => (
            <li key={v.label}>
              <Link
                href={v.href}
                className={`block py-2.5 text-sm transition-colors hover:text-[#1F86C7] ${
                  v.label === activeVisa ? "font-semibold text-[#0E1E3A]" : "text-zinc-600"
                }`}
              >
                {v.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Consult with Us */}
      <div className="rounded-xl border border-zinc-200 p-5">
        <h3 className="text-base font-bold text-[#0E1E3A] mb-4">Consult with Us</h3>
        <ConsultForm visaType={visaType} />
      </div>

      {/* Popular Tags */}
      {showTags && (
        <div className="rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#1F86C7" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" strokeLinecap="round" />
            </svg>
            <h3 className="text-base font-bold text-[#0E1E3A]">Popular Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
