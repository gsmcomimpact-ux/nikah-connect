import { PageTitle } from "@/components/layout/page-title";
import { Card, CardTitle } from "@/components/ui/card";
import { PrivacyForm } from "@/components/settings/forms";
import { UnblockButton } from "@/components/settings/unblock-button";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Confidentialité" };

export default async function PrivacyPage() {
  const user = await requireUser();
  const [profile, blocks] = await Promise.all([
    db.profile.findUniqueOrThrow({ where: { userId: user.id }, select: { photoVisibility: true, isVisible: true } }),
    db.block.findMany({ where: { blockerId: user.id }, include: { blocked: { select: { id: true, profile: { select: { displayName: true } } } } }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div className="space-y-6">
      <PageTitle title="Confidentialité" description="Vous gardez la maîtrise de ce que vous partagez. Vos coordonnées ne sont jamais affichées." />
      <Card>
        <PrivacyForm defaults={{ ...profile, emailNotifications: user.emailNotifications }} />
      </Card>
      <Card>
        <CardTitle className="text-lg">Membres bloqués</CardTitle>
        {blocks.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Vous n'avez bloqué aucun membre.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {blocks.map((b) => (
              <li key={b.blockedId} className="flex items-center justify-between py-3">
                <span className="text-sm">
                  {b.blocked.profile?.displayName ?? "Membre"} <span className="text-gray-400">· bloqué le {formatDate(b.createdAt)}</span>
                </span>
                <UnblockButton targetId={b.blockedId} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
