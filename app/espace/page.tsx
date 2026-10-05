import Link from "next/link";
import { ArrowRight, Eye, HeartHandshake, MessagesSquare, Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { SafetyNotice } from "@/components/ui/safety-notice";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileActions } from "@/components/profile/profile-actions";
import { requireUser } from "@/lib/auth/guards";
import { getRelationStatuses } from "@/lib/profile/relations";
import { planFeatures } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import { getCompatibilities } from "@/lib/matching/candidates";
import { getNextAction } from "@/lib/profile/next-action";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ bienvenue?: string; email?: string }> }) {
  const params = await searchParams;
  const user = await requireUser();
  const plan = planFeatures(user.subscription);
  const since = new Date(Date.now() - 30 * 86400_000);
  const [next, compat, pending, matches, views, profile] = await Promise.all([
    getNextAction(user.id),
    getCompatibilities(user.id, { limit: 3 }),
    db.like.count({ where: { toUserId: user.id, type: "INTEREST", status: "PENDING" } }),
    db.match.count({ where: { status: "ACTIVE", OR: [{ userAId: user.id }, { userBId: user.id }] } }),
    db.profileView.count({ where: { viewedId: user.id, createdAt: { gte: since } } }),
    db.profile.findUnique({ where: { userId: user.id }, select: { completeness: true, displayName: true } }),
  ]);
  const relations = await getRelationStatuses(user.id, compat.cards.map((c) => c.userId));

  const stats = [
    { label: "Demandes reçues", value: pending, href: "/espace/demandes", icon: HeartHandshake },
    { label: "Compatibilités mutuelles", value: matches, href: "/espace/messages", icon: MessagesSquare },
    { label: "Suggestions", value: compat.total, href: "/espace/compatibilites", icon: Sparkles },
    { label: "Visites (30 j)", value: plan.profileStats ? views : "—", href: "/espace/abonnement", icon: Eye },
  ];

  return (
    <div className="space-y-6">
      {params.bienvenue && <Alert tone="success" title="Bienvenue !">Votre profil est créé. Découvrez dès maintenant les profils compatibles avec vos valeurs.</Alert>}
      {params.email === "verifie" && <Alert tone="success">Votre adresse e-mail est confirmée.</Alert>}

      <div>
        <h1 className="font-display text-2xl font-semibold text-primary sm:text-3xl">Assalamou alaykoum, {profile?.displayName}</h1>
        <p className="mt-1 text-sm text-gray-600">Voici où en est votre parcours.</p>
      </div>

      <Card className="relative overflow-hidden border-gold/40 bg-gradient-to-br from-white to-gold/5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">Prochaine étape recommandée</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-primary">{next.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{next.description}</p>
        <ButtonLink href={next.href} size="sm" className="mt-4">
          {next.cta} <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gold/60">
            <s.icon className="h-5 w-5 text-gold" aria-hidden />
            <p className="mt-3 text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-gray-600">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Vos meilleures compatibilités</h2>
            <Link href="/espace/compatibilites" className="text-sm font-medium text-primary hover:underline">
              Tout voir
            </Link>
          </div>
          {compat.cards.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-600">Aucune suggestion pour le moment. Élargissez vos préférences pour découvrir davantage de profils.</p>
              <ButtonLink href="/espace/profil/preferences" variant="outline" size="sm" className="mt-3">
                Ajuster mes préférences
              </ButtonLink>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {compat.cards.map((c) => (
                <ProfileCard key={c.userId} profile={c} actions={<ProfileActions targetId={c.userId} compact initialStatus={relations.get(c.userId)?.status} conversationId={relations.get(c.userId)?.conversationId} />} />
              ))}
            </div>
          )}
        </section>
        <div className="space-y-4">
          <Card>
            <CardTitle className="text-base">Profil complété à {profile?.completeness ?? 0} %</CardTitle>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={profile?.completeness ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gold" style={{ width: `${profile?.completeness ?? 0}%` }} />
            </div>
            <Link href="/espace/profil" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              Améliorer mon profil
            </Link>
          </Card>
          <SafetyNotice compact />
        </div>
      </div>
    </div>
  );
}
