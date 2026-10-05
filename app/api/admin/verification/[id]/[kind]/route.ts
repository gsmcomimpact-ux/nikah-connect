import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/guards";
import { readFileByKey, sniffDocumentType } from "@/lib/storage";

/** Consultation d'une pièce d'identité : réservée aux administrateurs, chaque accès est journalisé. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string; kind: string }> }) {
  const user = await getSessionUser();
  if (!user || !hasRole(user, "ADMIN")) return new NextResponse(null, { status: 404 });
  const { id, kind } = await ctx.params;
  const req = await db.verificationRequest.findUnique({ where: { id } });
  const key = kind === "document" ? req?.documentKey : kind === "selfie" ? req?.selfieKey : null;
  if (!req || !key) return new NextResponse(null, { status: 404 });
  await audit({ actorId: user.id, action: "admin.identity_document_view", targetType: "verification", targetId: id, metadata: { kind } });
  const data = await readFileByKey(key);
  return new NextResponse(new Uint8Array(data), {
    headers: { "Content-Type": sniffDocumentType(data) ?? "application/octet-stream", "Cache-Control": "no-store", "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff" },
  });
}
