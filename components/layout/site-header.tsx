import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { MAIN_NAV } from "@/lib/config/navigation";
import { getSessionUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Menu principal" className="hidden items-center gap-1 lg:flex">
          {MAIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-primary/5 hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <ButtonLink href="/espace" size="sm">
              Mon espace
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/connexion" variant="ghost" size="sm">
                Connexion
              </ButtonLink>
              <ButtonLink href="/inscription" size="sm">
                Créer mon profil
              </ButtonLink>
            </>
          )}
        </div>
        <MobileMenu items={MAIN_NAV} isLoggedIn={Boolean(user)} />
      </div>
    </header>
  );
}
