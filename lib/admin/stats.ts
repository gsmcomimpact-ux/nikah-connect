import "server-only";
import { db } from "@/lib/db";

export async function getAdminStats() {
  const now = Date.now();
  const d7 = new Date(now - 7 * 86400_000);
  const d30 = new Date(now - 30 * 86400_000);
  const [users, newUsers7, newUsers30, verified, active7, matches, matches30, conversations, openReports, suspended, banned, premium, pendingVerifications, pendingPhotos, flaggedMessages] = await Promise.all([
    db.user.count({ where: { status: { not: "DELETED" } } }),
    db.user.count({ where: { createdAt: { gte: d7 }, status: { not: "DELETED" } } }),
    db.user.count({ where: { createdAt: { gte: d30 }, status: { not: "DELETED" } } }),
    db.user.count({ where: { identityVerifiedAt: { not: null } } }),
    db.user.count({ where: { lastActiveAt: { gte: d7 }, status: "ACTIVE" } }),
    db.match.count(),
    db.match.count({ where: { createdAt: { gte: d30 } } }),
    db.conversation.count(),
    db.report.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    db.user.count({ where: { status: "SUSPENDED" } }),
    db.user.count({ where: { status: "BANNED" } }),
    db.subscription.count({ where: { plan: "PREMIUM", status: "ACTIVE" } }),
    db.verificationRequest.count({ where: { status: "PENDING" } }),
    db.photo.count({ where: { status: "PENDING" } }),
    db.message.count({ where: { flagged: true, status: "VISIBLE" } }),
  ]);
  return { users, newUsers7, newUsers30, verified, active7, matches, matches30, conversations, openReports, suspended, banned, premium, pendingVerifications, pendingPhotos, flaggedMessages };
}

/** Inscriptions par jour sur les 14 derniers jours. */
export async function signupsPerDay() {
  const rows = await db.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', created_at) AS day, COUNT(*)::bigint AS count
    FROM users WHERE created_at >= NOW() - INTERVAL '14 days' AND status <> 'DELETED'
    GROUP BY 1 ORDER BY 1`;
  return rows.map((r) => ({ day: r.day, count: Number(r.count) }));
}
