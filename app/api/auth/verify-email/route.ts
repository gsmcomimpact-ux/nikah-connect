import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { consumeToken } from "@/lib/auth/tokens";
import { notify } from "@/lib/notifications/service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const record = token ? await consumeToken("EMAIL_VERIFY", token) : null;
  const url = request.nextUrl.clone();
  url.search = "";
  if (!record) {
    url.pathname = "/connexion";
    url.searchParams.set("email", "lien-invalide");
    return NextResponse.redirect(url);
  }
  const user = await db.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } });
  await audit({ actorId: user.id, action: "auth.email_verified", targetType: "user", targetId: user.id });
  await notify({ userId: user.id, type: "PROFILE_VERIFIED", title: "E-mail vérifié", body: "Votre adresse e-mail est confirmée. Votre profil peut désormais apparaître dans les recherches." });
  url.pathname = "/espace";
  url.searchParams.set("email", "verifie");
  return NextResponse.redirect(url);
}
