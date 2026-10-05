import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = ["nc_session", "__Host-nc_session"];
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Proxy (ex-middleware) :
 *  1. Protection CSRF : toute requête modifiante doit provenir du même site (en-têtes Origin / Sec-Fetch-Site).
 *  2. Redirection « optimiste » vers la connexion pour les espaces privés.
 * L'autorisation réelle est toujours revérifiée côté serveur (pages, actions, API).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!SAFE_METHODS.has(request.method) && !pathname.startsWith("/api/billing/webhook")) {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let sameOrigin = false;
    if (origin) {
      try {
        sameOrigin = new URL(origin).host === host;
      } catch {
        sameOrigin = false;
      }
    } else {
      sameOrigin = fetchSite === "same-origin";
    }
    if (!sameOrigin) {
      return new NextResponse(JSON.stringify({ error: "Requête refusée (origine invalide)" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const isPrivate = pathname === "/espace" || pathname.startsWith("/espace/") || pathname === "/admin" || pathname.startsWith("/admin/");
  if (isPrivate && request.method === "GET" && !SESSION_COOKIES.some((c) => request.cookies.has(c))) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)"],
};
