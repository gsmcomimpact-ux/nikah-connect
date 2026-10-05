import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { adminDeleteUserAction, banUserAction, grantPremiumAction, reactivateUserAction, setAdminRoleAction, suspendUserAction, verifyIdentityManuallyAction } from "@/lib/actions/admin";
import { hasRole, requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { countryName } from "@/lib/constants/geo";
import { REPORT_REASON_LABELS } from "@/lib/constants/options";
import { ageFromDate, formatDate } from "@/lib/utils";

export const metadata = { title: "Fiche utilisateur" };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      subscription: true,
      adminUser: true,
      reportsReceived: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { reportsMade: true, likesSent: true, messages: true, blocksReceived: true } },
    },
  });
  if (!user) notFound();
  const logs = await db.auditLog.findMany({ where: { OR: [{ actorId: id }, { targetId: id }] }, orderBy: { createdAt: "desc" }, take: 25 });
  const sameIp = user.signupIpHash ? await db.user.count({ where: { signupIpHash: user.signupIpHash, NOT: { id } } }) : 0;
  const isAdminTarget = Boolean(user.adminUser);

  return (
    <>
      <AdminTitle title={user.profile?.displayName ?? user.email} description={`${user.email} · inscrit le ${formatDate(user.createdAt)}`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={user.status} />
              {user.isDemo && <span className="text-xs text-gray-500">Profil de démonstration</span>}
              {user.adminUser && <span className="text-xs font-medium text-primary">Rôle : {user.adminUser.role}</span>}
            </div>
            {user.suspensionReason && <p className="mt-2 text-sm text-gray-600">Motif : {user.suspensionReason}{user.suspendedUntil ? ` (jusqu'au ${formatDate(user.suspendedUntil)})` : ""}</p>}
            {user.profile && (
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-500">Âge</dt><dd>{ageFromDate(user.profile.dateOfBirth)} ans</dd></div>
                <div><dt className="text-gray-500">Localisation</dt><dd>{user.profile.city}, {countryName(user.profile.country)}</dd></div>
                <div><dt className="text-gray-500">Vérifications</dt><dd>E-mail {user.emailVerifiedAt ? "✓" : "✗"} · Téléphone {user.phoneVerifiedAt ? "✓" : "✗"} · Identité {user.identityVerifiedAt ? "✓" : "✗"}</dd></div>
                <div><dt className="text-gray-500">Offre</dt><dd>{user.subscription?.plan ?? "FREE"}{user.subscription?.currentPeriodEnd ? ` jusqu'au ${formatDate(user.subscription.currentPeriodEnd)}` : ""}</dd></div>
                <div><dt className="text-gray-500">Activité</dt><dd>{user._count.likesSent} demandes · {user._count.messages} messages · bloqué {user._count.blocksReceived} fois</dd></div>
                <div><dt className="text-gray-500">Comptes depuis la même connexion</dt><dd className={sameIp > 2 ? "font-semibold text-red-700" : ""}>{sameIp}</dd></div>
              </dl>
            )}
            {user.profile?.bio && <p className="mt-4 whitespace-pre-line rounded-xl bg-muted p-3 text-sm">{user.profile.bio}</p>}
            {user.profile && (
              <Link href={`/espace/membres/${user.id}`} className="mt-3 inline-block text-sm text-primary underline">
                Voir le profil tel qu'affiché
              </Link>
            )}
          </Card>

          <Card>
            <CardTitle className="text-lg">Signalements reçus</CardTitle>
            <div className="mt-3">
              <AdminTable head={["Date", "Motif", "Source", "Statut"]} empty={user.reportsReceived.length === 0}>
                {user.reportsReceived.map((r) => (
                  <tr key={r.id}>
                    <Td>{formatDate(r.createdAt, { dateStyle: "short" })}</Td>
                    <Td>{REPORT_REASON_LABELS[r.reason]}{r.details && <p className="text-xs text-gray-500">{r.details}</p>}</Td>
                    <Td>{r.source === "SYSTEM" ? "Automatique" : "Membre"}</Td>
                    <Td><StatusBadge status={r.status} /></Td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          </Card>

          <Card>
            <CardTitle className="text-lg">Historique</CardTitle>
            <ul className="mt-3 space-y-1.5 text-sm">
              {logs.map((l) => (
                <li key={l.id} className="flex justify-between gap-4">
                  <span className="font-mono text-xs">{l.action}{l.actorId && l.actorId !== id ? " (par un admin)" : ""}</span>
                  <span className="text-xs text-gray-500">{formatDate(l.createdAt, { dateStyle: "short", timeStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          {!isAdminTarget && user.status !== "DELETED" && (
            <Card>
              <CardTitle className="text-base">Modération</CardTitle>
              {user.status === "ACTIVE" ? (
                <form action={suspendUserAction.bind(null, id)} className="mt-3 space-y-2">
                  <Input name="days" type="number" min={1} max={365} defaultValue={7} aria-label="Durée en jours" />
                  <Input name="reason" placeholder="Motif communiqué au membre" maxLength={300} />
                  <Button type="submit" size="sm" variant="outline" className="w-full">Suspendre</Button>
                </form>
              ) : hasRole(admin, "ADMIN") ? (
                <form action={reactivateUserAction.bind(null, id)} className="mt-3">
                  <Button type="submit" size="sm" className="w-full">Réactiver le compte</Button>
                </form>
              ) : null}
              {hasRole(admin, "ADMIN") && user.status !== "BANNED" && (
                <form action={banUserAction.bind(null, id)} className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  <Input name="reason" placeholder="Motif du bannissement" maxLength={300} />
                  <Button type="submit" size="sm" variant="danger" className="w-full">Bannir définitivement</Button>
                </form>
              )}
            </Card>
          )}
          {hasRole(admin, "ADMIN") && user.status !== "DELETED" && (
            <Card>
              <CardTitle className="text-base">Compte</CardTitle>
              {!user.identityVerifiedAt && (
                <form action={verifyIdentityManuallyAction.bind(null, id)} className="mt-3">
                  <Button type="submit" size="sm" variant="outline" className="w-full">Marquer l'identité comme vérifiée</Button>
                </form>
              )}
              <form action={grantPremiumAction.bind(null, id)} className="mt-3 flex gap-2">
                <Input name="days" type="number" min={1} max={730} defaultValue={30} aria-label="Jours de Premium" />
                <Button type="submit" size="sm" variant="gold">Offrir Premium</Button>
              </form>
            </Card>
          )}
          {hasRole(admin, "SUPER_ADMIN") && user.id !== admin.id && user.status !== "DELETED" && (
            <Card>
              <CardTitle className="text-base">Super-administration</CardTitle>
              <form action={setAdminRoleAction.bind(null, id)} className="mt-3 flex gap-2">
                <Select name="role" defaultValue={user.adminUser?.role ?? "NONE"} options={[{ value: "NONE", label: "Aucun rôle" }, { value: "MODERATOR", label: "Modérateur" }, { value: "ADMIN", label: "Administrateur" }, { value: "SUPER_ADMIN", label: "Super-admin" }]} />
                <Button type="submit" size="sm" variant="outline">Appliquer</Button>
              </form>
              <form action={adminDeleteUserAction.bind(null, id)} className="mt-4 border-t border-gray-100 pt-4">
                <Button type="submit" size="sm" variant="danger" className="w-full">Supprimer le compte et ses données</Button>
              </form>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
