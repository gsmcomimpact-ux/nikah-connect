import { cn, initials } from "@/lib/utils";

/**
 * Avatar sobre : photo si autorisée, sinon initiales sur fond géométrique.
 * Volontairement de taille modérée : le profil prime sur la photo.
 */
export function Avatar({ name, photoUrl, size = "md", className }: { name: string; photoUrl?: string | null; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizes = { sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-base", lg: "h-20 w-20 text-xl", xl: "h-28 w-28 text-3xl" };
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-full border-2 border-gold/50 bg-primary", sizes[size], className)}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={`Photo de ${name}`} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-light font-display font-semibold text-cream">
          {initials(name)}
        </div>
      )}
    </div>
  );
}
