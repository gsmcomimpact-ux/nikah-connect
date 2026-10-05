import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { exportAccountData } from "@/lib/account/lifecycle";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/security/rate-limit";

/** Export des données personnelles (portabilité). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const limit = await rateLimit(`export:${user.id}`, 5, 3600);
  if (!limit.ok) return NextResponse.json({ error: "Trop d'exports. Réessayez plus tard." }, { status: 429 });
  const data = await exportAccountData(user.id);
  await audit({ actorId: user.id, action: "account.export" });
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="mes-donnees-${new Date().toISOString().slice(0, 10)}.json"` },
  });
}
