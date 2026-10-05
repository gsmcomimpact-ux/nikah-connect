import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/forms/auth-card";
import { Alert } from "@/components/ui/alert";
import { getSessionUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo/metadata";
import { safeRedirectPath } from "@/lib/security/sanitize";
import { LoginForm } from "./login-form";

export const metadata = pageMetadata({ title: "Connexion", description: "Connectez-vous à votre espace membre.", path: "/connexion", noIndex: true });

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; email?: string }> }) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);
  if (await getSessionUser()) redirect(next);
  return (
    <AuthCard
      title="Bon retour parmi nous"
      subtitle="Connectez-vous à votre espace membre"
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-primary hover:underline">
            Créer mon profil
          </Link>
        </>
      }
    >
      {params.email === "lien-invalide" && (
        <Alert tone="warning" className="mb-4">
          Ce lien de confirmation est invalide ou a expiré. Connectez-vous pour en recevoir un nouveau.
        </Alert>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
