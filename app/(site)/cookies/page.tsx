import { LegalPageView, legalMetadata } from "@/components/marketing/legal-page";

export const metadata = legalMetadata("cookies");

export default function Page() {
  return <LegalPageView slug="cookies" />;
}
