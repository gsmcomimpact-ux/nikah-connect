import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/forms/auth-card";
import { Stepper } from "@/components/forms/stepper";
import { getSessionUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo/metadata";
import { SignupForm } from "./signup-form";

export const metadata = pageMetadata({
  title: "Créer mon profil",
  description: "Inscription gratuite : créez votre profil et découvrez des personnes qui partagent vos valeurs et votre projet de mariage.",
  path: "/inscription",
});

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect(user.onboardingStep < 6 ? `/inscription/etape/${user.onboardingStep}` : "/espace");
  return (
    <AuthCard
      wide
      title="Créer mon profil"
      subtitle="Étape 1 sur 5 — Votre compte. Vos coordonnées ne seront jamais affichées."
      footer={
        <>
          Déjà inscrit(e) ?{" "}
          <Link href="/connexion" className="font-medium text-primary hover:underline">
            Connexion
          </Link>
        </>
      }
    >
      <div className="mb-8">
        <Stepper current={1} />
      </div>
      <SignupForm />
    </AuthCard>
  );
}
