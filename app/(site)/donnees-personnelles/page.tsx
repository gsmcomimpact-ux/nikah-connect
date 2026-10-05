import { LegalPageView, legalMetadata } from "@/components/marketing/legal-page";

export const metadata = legalMetadata("donnees-personnelles");

export default function Page() {
  return <LegalPageView slug="donnees-personnelles" />;
}
