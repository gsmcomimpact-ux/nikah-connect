import { Monitor } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordForm } from "@/components/settings/forms";
import { revokeOtherSessionsAction, revokeSessionAction } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth/guards";
import { currentSessionHash } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatDate, formatRelative } from "@/lib/utils";

export const metadata = { title: "Sécurité" };

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Connexion",
  "auth.logout": "Déconnexion",
  "auth.password_change": "Mot de passe modifié",
  "auth.password_reset": "Mot de passe réinitialisé",
  "auth.locked": "Compte verrouillé après des échecs",
  "auth.email_verified": "E-mail vérifié",
  "auth.phone_verified": "Téléphone vérifié",
  "auth.sessions_revoke_all": "Autres appareils déconnectés",
  "auth.session_revoke": "Appareil déconnecté",
};

function describeAgent(ua: string | null) {
  if (!ua) return "Appareil inconnu";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navigateur";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return `${browser}${os ? ` · ${os}` : ""}`;
}

export default async function SecurityPage() {
  const user = await requireUser({ allowSuspended: true });
  const [sessions, current, events] = await Promise.all([
    db.session.findMany({ where: { userId: user.id, expiresAt: { gt: new Date() } }, orderBy: { lastUsedAt: "desc" } }),
    currentSessionHash(),
    db.auditLog.findMany({ where: { actorId: user.id, action: { startsWith: "auth." } }, orderBy: { createdAt: "desc" }, take: 15 }),
  ]);
  return (
    <div className="space-y-6">
      <PageTitle title="Sécurité" />
      <Card>
        <CardTitle className="text-lg">Changer de mot de passe</CardTitle>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Appareils connectés</CardTitle>
          <form action={revokeOtherSessionsAction}>
            <Button size="sm" variant="outline" type="submit">Déconnecter les autres appareils</Button>
          </form>
        </div>
        <ul className="mt-3 divide-y divide-gray-100">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <Monitor className="h-5 w-5 text-gray-400" aria-hidden />
              <div className="flex-1 text-sm">
                <p className="font-medium">
                  {describeAgent(s.userAgent)} {s.tokenHash === current && <Badge tone="green">Cet appareil</Badge>}
                </p>
                <p className="text-gray-500">Dernière activité {formatRelative(s.lastUsedAt)} · connecté le {formatDate(s.createdAt)}</p>
              </div>
              {s.tokenHash !== current && (
                <form action={revokeSessionAction.bind(null, s.id)}>
                  <Button size="sm" variant="ghost" type="submit">Déconnecter</Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardTitle className="text-lg">Activité récente</CardTitle>
        <ul className="mt-3 space-y-2 text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex justify-between gap-4">
              <span>{ACTION_LABELS[e.action] ?? e.action}</span>
              <span className="text-gray-500">{formatDate(e.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-500">Une activité inhabituelle ? Changez votre mot de passe et déconnectez les autres appareils.</p>
      </Card>
    </div>
  );
}
