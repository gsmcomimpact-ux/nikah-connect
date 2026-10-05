import "server-only";
import type { NotificationType } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/config/env";
import { sendEmail } from "@/lib/notifications/channels";

/** Types de notifications également envoyées par e-mail (si l'utilisateur l'accepte). */
const EMAIL_TYPES: NotificationType[] = ["REQUEST_RECEIVED", "REQUEST_ACCEPTED", "PROFILE_VERIFIED", "SECURITY_ALERT", "REPORT_HANDLED"];

export async function notify(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  await db.notification.create({ data: params });

  if (EMAIL_TYPES.includes(params.type)) {
    const user = await db.user.findUnique({ where: { id: params.userId }, select: { email: true, emailNotifications: true, status: true, isDemo: true } });
    const mandatory = params.type === "SECURITY_ALERT";
    if (user && !user.isDemo && user.status !== "DELETED" && (user.emailNotifications || mandatory)) {
      const link = params.link ? `\n\n${env.appUrl}${params.link}` : "";
      // Les e-mails ne contiennent jamais le contenu des messages privés.
      void sendEmail(user.email, params.title, `${params.body}${link}`);
    }
  }
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, readAt: null } });
}
