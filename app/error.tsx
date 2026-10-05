"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-2xl font-semibold text-primary">Une erreur est survenue</h1>
      <p className="max-w-md text-gray-600">Nous n'avons pas pu afficher cette page. Réessayez dans un instant.</p>
      <Button onClick={reset}>Réessayer</Button>
    </main>
  );
}
