import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";

type Props = {
  title: string;
  subtitle: string;
  href?: string;
  ctaLabel?: string;
};

export default function InventoryUnavailable({ title, subtitle, href, ctaLabel }: Props) {
  return (
    <div className="rounded-2xl border border-border-soft bg-white">
      <EmptyState
        title={title}
        subtitle={subtitle}
        cta={
          href && ctaLabel ? (
            <Link
              href={href}
              className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {ctaLabel}
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}
