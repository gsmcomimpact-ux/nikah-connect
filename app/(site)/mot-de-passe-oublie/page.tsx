import Link from "next/link";
import { AuthCard } from "@/components/forms/auth-card";
import { pageMetadata } from "@/lib/seo/metadata";
import { ForgotForm } from "./forgot-form";

export const metadata = pageMetadata({ title: "Mot de passe oublié", description: "Réinitialisez votre mot de passe.", path: "/mot-de-passe-oublie", noIndex: true });

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Mot de passe oublié" subtitle="Indiquez votre adresse e-mail : nous vous enverrons un lien de réinitialisation." footer={<Link href="/connexion" className="text-primary hover:underline">Retour à la connexion</Link>}>
      <ForgotForm />
    </AuthCard>
  );
}
