import { LegalPageView, legalMetadata } from "@/components/marketing/legal-page";

export const metadata = legalMetadata("suppression-de-compte");

export default function Page() {
  return <LegalPageView slug="suppression-de-compte" />;
}
