import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <h1 className="font-display text-3xl font-semibold text-primary">Page introuvable</h1>
      <p className="max-w-md text-gray-600">Cette page n'existe pas ou n'est plus disponible. Si vous cherchiez un profil, il a peut-être été masqué par son propriétaire.</p>
      <ButtonLink href="/">Retour à l'accueil</ButtonLink>
    </main>
  );
}
