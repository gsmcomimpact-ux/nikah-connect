import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hashIp } from "@/lib/security/crypto";
import { getClientIp } from "@/lib/security/request";

/** Journalise une action sensible (connexion, modération, suppression, accès à un document…). */
export async function audit(params: {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    const ip = await getClientIp().catch(() => null);
    await db.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata,
        ipHash: hashIp(ip),
      },
    });
  } catch (err) {
    console.error("[audit] échec de journalisation", err);
  }
}
