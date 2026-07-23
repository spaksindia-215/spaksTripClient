import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import MarketplaceGrid from "@/components/holiday-packages/MarketplaceGrid";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import { slugToState } from "@/lib/indianStates";

// Browse-by-state listings page — the destination of a state card on
// /national-tour-packages (and /packages, which links here too since a state's
// domestic listings are the same regardless of entry point). Server component
// resolves the dynamic slug (async params in this Next version) to the state.
type PageProps = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: slug } = await params;
  const state = slugToState(slug);
  if (!state) return {};
  return {
    title: `${state} Tour Packages | ElitesYatra`,
    description: `Discover curated tour, taxi, and holiday packages across ${state}.`,
  };
}

export default async function StateTourPackagesPage({ params }: PageProps) {
  const { state: slug } = await params;
  const state = slugToState(slug);
  if (!state) notFound();

  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <PackagePageHero title={`${state} Tour Packages`} image="/forest.jpg" />
        <section className="mx-auto max-w-7xl px-6 py-16">
          <MarketplaceGrid
            kinds={["holiday", "tour_package", "taxi_package"]}
            scope="domestic"
            state={state}
            emptyHint={`Packages in ${state} will appear here once operators list them.`}
          />
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
