import "server-only";
import { db } from "@/lib/db";
import { deleteFileByKey } from "@/lib/storage";

/**
 * Suppression de compte (droit à l'effacement).
 * - Données personnelles supprimées : profil, préférences, photos (fichiers compris),
 *   pièces d'identité, personne de confiance, favoris, demandes, notifications, sessions.
 * - Le contenu des messages envoyés est effacé ; les conversations des autres membres
 *   affichent « Membre supprimé ».
 * - Sont conservés de façon minimale : les signalements et le journal d'audit
 *   (obligations de sécurité), rattachés à un identifiant anonymisé.
 */
export async function deleteAccount(userId: string): Promise<void> {
  const [photos, verifications, attachments] = await Promise.all([
    db.photo.findMany({ where: { userId }, select: { storageKey: true } }),
    db.verificationRequest.findMany({ where: { userId }, select: { documentKey: true, selfieKey: true } }),
    db.messageAttachment.findMany({ where: { message: { senderId: userId } }, select: { storageKey: true } }),
  ]);

  await db.$transaction([
    db.message.updateMany({ where: { senderId: userId }, data: { body: "[message supprimé]" } }),
    db.messageAttachment.deleteMany({ where: { message: { senderId: userId } } }),
    db.match.updateMany({ where: { OR: [{ userAId: userId }, { userBId: userId }], status: "ACTIVE" }, data: { status: "ENDED", endedAt: new Date() } }),
    db.profile.deleteMany({ where: { userId } }),
    db.preference.deleteMany({ where: { userId } }),
    db.photo.deleteMany({ where: { userId } }),
    db.like.deleteMany({ where: { OR: [{ fromUserId: userId }, { toUserId: userId }] } }),
    db.favorite.deleteMany({ where: { OR: [{ userId }, { targetId: userId }] } }),
    db.profileView.deleteMany({ where: { OR: [{ viewerId: userId }, { viewedId: userId }] } }),
    db.notification.deleteMany({ where: { userId } }),
    db.session.deleteMany({ where: { userId } }),
    db.verificationToken.deleteMany({ where: { userId } }),
    db.verificationRequest.deleteMany({ where: { userId } }),
    db.trustedContact.deleteMany({ where: { userId } }),
    db.block.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } }),
    db.subscription.updateMany({ where: { userId }, data: { plan: "FREE", status: "CANCELED" } }),
    db.user.update({
      where: { id: userId },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
        email: `supprime-${userId}@invalid.local`,
        phone: null,
        passwordHash: "!",
        emailVerifiedAt: null,
        phoneVerifiedAt: null,
        identityVerifiedAt: null,
        signupIpHash: null,
      },
    }),
  ]);

  await Promise.all([
    ...photos.map((p) => deleteFileByKey(p.storageKey)),
    ...verifications.flatMap((v) => [deleteFileByKey(v.documentKey), deleteFileByKey(v.selfieKey)]),
    ...attachments.map((a) => deleteFileByKey(a.storageKey)),
  ]);
}

/** Export des données personnelles (droit à la portabilité), au format JSON. */
export async function exportAccountData(userId: string) {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      status: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      identityVerifiedAt: true,
      createdAt: true,
      lastActiveAt: true,
      emailNotifications: true,
      profile: { include: { interests: { include: { interest: { select: { label: true } } } } } },
      preference: true,
      photos: { select: { id: true, status: true, isPrimary: true, createdAt: true } },
      trustedContact: true,
      subscription: { select: { plan: true, status: true, currentPeriodEnd: true } },
      payments: { select: { amountCents: true, currency: true, status: true, createdAt: true } },
      likesSent: { select: { toUserId: true, type: true, status: true, note: true, createdAt: true } },
      likesReceived: { select: { fromUserId: true, type: true, status: true, createdAt: true } },
      favorites: { select: { targetId: true, createdAt: true } },
      blocksMade: { select: { blockedId: true, createdAt: true } },
      reportsMade: { select: { reportedUserId: true, reason: true, status: true, createdAt: true } },
      notifications: { select: { type: true, title: true, body: true, createdAt: true, readAt: true } },
      verificationRequests: { select: { documentType: true, status: true, createdAt: true, reviewedAt: true } },
      sessions: { select: { createdAt: true, lastUsedAt: true, userAgent: true, expiresAt: true } },
    },
  });
  const messages = await db.message.findMany({ where: { senderId: userId }, select: { conversationId: true, body: true, createdAt: true }, orderBy: { createdAt: "asc" } });
  return { exportedAt: new Date().toISOString(), user, messagesSent: messages };
}
