"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guards";

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireApiUser({ allowSuspended: true });
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/espace", "layout");
}

export async function deleteReadNotificationsAction(): Promise<void> {
  const user = await requireApiUser({ allowSuspended: true });
  await db.notification.deleteMany({ where: { userId: user.id, readAt: { not: null } } });
  revalidatePath("/espace/notifications");
}
