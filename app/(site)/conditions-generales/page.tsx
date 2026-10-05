import { LegalPageView, legalMetadata } from "@/components/marketing/legal-page";

export const metadata = legalMetadata("conditions-generales");

export default function Page() {
  return <LegalPageView slug="conditions-generales" />;
}
