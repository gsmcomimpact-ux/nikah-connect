import Link from "next/link";
import { AdminTitle } from "@/components/admin/table";
import { Button } from "@/components/ui/button";
import { moderatePhotoAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Photos à modérer" };

export default async function PhotosModerationPage() {
  await requireAdmin();
  const photos = await db.photo.findMany({ where: { status: "PENDING" }, include: { user: { select: { id: true, profile: { select: { displayName: true } } } } }, orderBy: { createdAt: "asc" }, take: 60 });
  return (
    <>
      <AdminTitle title="Photos à modérer" description="Critères : photo pudique, personne identifiable, pas de texte, de coordonnées ni de contenu inapproprié." />
      {photos.length === 0 && <p className="text-sm text-gray-500">Aucune photo en attente.</p>}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {photos.map((p) => (
          <li key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/media/photo/${p.id}`} alt="Photo à modérer" className="aspect-square w-full object-cover" />
            <div className="space-y-2 p-3">
              <Link href={`/admin/utilisateurs/${p.user.id}`} className="block truncate text-sm font-medium text-primary underline">{p.user.profile?.displayName ?? "Membre"}</Link>
              <div className="flex gap-2">
                <form action={moderatePhotoAction.bind(null, p.id, true)} className="flex-1">
                  <Button size="sm" type="submit" className="w-full">Valider</Button>
                </form>
                <form action={moderatePhotoAction.bind(null, p.id, false)} className="flex-1">
                  <Button size="sm" type="submit" variant="danger" className="w-full">Refuser</Button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
