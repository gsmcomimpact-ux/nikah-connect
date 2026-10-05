import "server-only";
import { db } from "@/lib/db";

export type NextAction = { title: string; description: string; href: string; cta: string };

/** Détermine la prochaine action recommandée pour guider l'utilisateur à chaque étape du parcours. */
export async function getNextAction(userId: string): Promise<NextAction> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: { profile: true, _count: { select: { photos: true } } },
  });
  const p = user.profile;
  if (!user.emailVerifiedAt)
    return { title: "Confirmez votre adresse e-mail", description: "Votre profil n'apparaît dans les recherches qu'une fois votre e-mail confirmé.", href: "/espace/parametres/verification", cta: "Renvoyer l'e-mail" };
  if (!p?.bio || p.bio.length < 80)
    return { title: "Présentez-vous", description: "Une présentation sincère de quelques lignes multiplie les échanges de qualité.", href: "/espace/profil", cta: "Compléter ma présentation" };
  if (user._count.photos === 0)
    return { title: "Ajoutez une photo (facultatif)", description: "Vous choisissez qui peut la voir : tous les membres, ou seulement en cas de compatibilité mutuelle.", href: "/espace/profil#photos", cta: "Ajouter une photo" };

  const pending = await db.like.count({ where: { toUserId: userId, type: "INTEREST", status: "PENDING" } });
  if (pending > 0)
    return { title: `${pending} demande${pending > 1 ? "s" : ""} en attente`, description: "Des membres ont manifesté leur intérêt. Prenez le temps de consulter leur profil.", href: "/espace/demandes", cta: "Voir mes demandes" };

  const unreadConv = await db.match.count({ where: { status: "ACTIVE", OR: [{ userAId: userId }, { userBId: userId }] } });
  if (unreadConv > 0 && !user.identityVerifiedAt)
    return { title: "Faites vérifier votre identité", description: "Le badge « Profil vérifié » rassure les familles et les membres avec qui vous échangez.", href: "/espace/parametres/verification", cta: "Vérifier mon identité" };

  return { title: "Découvrez vos compatibilités", description: "De nouveaux profils correspondant à vos critères et à vos valeurs vous attendent.", href: "/espace/compatibilites", cta: "Voir mes compatibilités" };
}
