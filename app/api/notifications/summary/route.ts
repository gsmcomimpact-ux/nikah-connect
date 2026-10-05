import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const [count, latest] = await Promise.all([
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.notification.findFirst({ where: { userId: user.id, readAt: null }, orderBy: { createdAt: "desc" }, select: { title: true } }),
  ]);
  return NextResponse.json({ notifications: count, latestTitle: latest?.title ?? null });
}
