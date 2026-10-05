import { LegalPageView, legalMetadata } from "@/components/marketing/legal-page";

export const metadata = legalMetadata("confidentialite");

export default function Page() {
  return <LegalPageView slug="confidentialite" />;
}
