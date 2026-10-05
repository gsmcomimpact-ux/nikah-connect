import { LegalPageView, legalMetadata } from "@/components/marketing/legal-page";

export const metadata = legalMetadata("regles-communautaires");

export default function Page() {
  return <LegalPageView slug="regles-communautaires" />;
}
