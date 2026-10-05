import { AuthCard } from "@/components/forms/auth-card";
import { pageMetadata } from "@/lib/seo/metadata";
import { ResetForm } from "./reset-form";

export const metadata = pageMetadata({ title: "Nouveau mot de passe", description: "Choisissez un nouveau mot de passe.", path: "/reinitialiser-mot-de-passe", noIndex: true });

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <AuthCard title="Nouveau mot de passe" subtitle="10 caractères minimum, avec des lettres et des chiffres.">
      <ResetForm token={token} />
    </AuthCard>
  );
}
