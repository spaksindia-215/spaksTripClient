import Accordion from "@/components/ui/Accordion";

type DocItem = {
  name: string;
  required: boolean;
  note?: string;
};

const DOCUMENTS: Record<string, DocItem[]> = {
  "study-visa": [
    { name: "Valid passport (min 18 months validity)", required: true },
    { name: "University / institution acceptance letter", required: true },
    { name: "Proof of sufficient funds (bank statement)", required: true },
    { name: "Academic transcripts & certificates", required: true },
    { name: "Language proficiency test (IELTS/TOEFL)", required: true },
    { name: "Statement of Purpose (SOP)", required: true },
    { name: "Medical examination report", required: false, note: "Some countries require" },
    { name: "Travel history (previous visas)", required: false },
    { name: "Passport-sized photographs", required: true },
  ],
  "work-visa": [
    { name: "Valid passport (min 6 months validity)", required: true },
    { name: "Employer offer letter / employment contract", required: true },
    { name: "Educational certificates & degrees", required: true },
    { name: "Experience letters from previous employers", required: true },
    { name: "Bank statements (last 3–6 months)", required: true },
    { name: "Police clearance certificate", required: true },
    { name: "Medical examination report", required: true },
    { name: "Professional licences (if applicable)", required: false },
    { name: "Passport-sized photographs", required: true },
  ],
  "pr-visa": [
    { name: "Valid passport", required: true },
    { name: "Proof of language proficiency (IELTS)", required: true },
    { name: "Educational Credential Assessment (ECA)", required: true },
    { name: "Work experience documents", required: true },
    { name: "Bank statements (proof of funds)", required: true },
    { name: "Police clearance certificate (all countries lived)", required: true },
    { name: "Medical examination results", required: true },
    { name: "Express Entry / Points-based profile", required: true },
    { name: "Passport-sized photographs", required: true },
  ],
  "investor-visa": [
    { name: "Valid passport", required: true },
    { name: "Business ownership proof or investment documents", required: true },
    { name: "Proof of net worth / assets", required: true },
    { name: "Business plan", required: true },
    { name: "Audited financial statements (3 years)", required: true },
    { name: "Bank statements", required: true },
    { name: "Tax returns", required: true },
    { name: "Police clearance certificate", required: true },
    { name: "Passport-sized photographs", required: true },
  ],
  "visit-visa": [
    { name: "Valid passport (min 6 months validity)", required: true },
    { name: "Return / onward travel tickets", required: true },
    { name: "Hotel booking / invitation letter", required: true },
    { name: "Bank statements (last 3 months)", required: true },
    { name: "Employment letter / leave sanction", required: false },
    { name: "Travel itinerary", required: true },
    { name: "Travel insurance", required: false, note: "Mandatory for Schengen" },
    { name: "Passport-sized photographs", required: true },
  ],
};

type Props = {
  type: string; // e.g. "study-visa"
};

export default function DocumentChecklist({ type }: Props) {
  const docs = DOCUMENTS[type] ?? DOCUMENTS["visit-visa"];
  const required = docs.filter((d) => d.required);
  const optional = docs.filter((d) => !d.required);

  return (
    <section className="py-14 bg-surface-muted">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-[24px] font-extrabold text-ink mb-2">Required Documents</h2>
        <p className="text-[14px] text-ink-muted mb-6">
          Prepare these documents before starting your application.
        </p>

        <div className="rounded-xl bg-white border border-border-soft shadow-(--shadow-xs) overflow-hidden">
          <Accordion
            items={[
              {
                value: "required",
                title: `Mandatory Documents (${required.length})`,
                content: (
                  <ul className="flex flex-col gap-3 py-1">
                    {required.map((doc) => (
                      <li key={doc.name} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-500">
                          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <div>
                          <span className="text-[13px] font-semibold text-ink">{doc.name}</span>
                          {doc.note && <span className="ml-1 text-[11px] text-ink-muted">({doc.note})</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ),
              },
              ...(optional.length > 0
                ? [
                    {
                      value: "optional",
                      title: `Additional / Optional Documents (${optional.length})`,
                      content: (
                        <ul className="flex flex-col gap-3 py-1">
                          {optional.map((doc) => (
                            <li key={doc.name} className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-sunken border border-border">
                                <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-ink-muted">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                              <div>
                                <span className="text-[13px] text-ink-soft">{doc.name}</span>
                                {doc.note && <span className="ml-1 text-[11px] text-ink-muted">({doc.note})</span>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>
    </section>
  );
}
