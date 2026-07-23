import type { Metadata } from "next";
import SpakstripBankContent from "@/components/account/SpakstripBankContent";

export const metadata: Metadata = {
  title: "ElitesYatra Bank Details",
};

export default function SpakstripBankPage() {
  return <SpakstripBankContent />;
}
