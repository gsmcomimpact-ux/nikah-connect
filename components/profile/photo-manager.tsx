"use client";

import { useActionState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { deletePhotoAction, setPrimaryPhotoAction, uploadPhotoAction } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/validation/form";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

type PhotoItem = { id: string; status: "PENDING" | "APPROVED" | "REJECTED"; isPrimary: boolean };

export function PhotoManager({ photos }: { photos: PhotoItem[] }) {
  const [state, action] = useActionState(uploadPhotoAction, initialFormState);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-4">
      <FormMessage state={state} />
      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/media/photo/${p.id}`} alt="Votre photo" className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-1 p-2">
                {p.status === "APPROVED" ? <Badge tone="green">Validée</Badge> : p.status === "PENDING" ? <Badge tone="gold">En attente</Badge> : <Badge tone="red">Refusée</Badge>}
                <div className="flex">
                  <button type="button" disabled={pending || p.isPrimary} onClick={() => start(() => setPrimaryPhotoAction(p.id))} className="rounded-full p-1.5 text-gray-500 hover:text-gold disabled:text-gold" aria-label={p.isPrimary ? "Photo principale" : "Définir comme photo principale"} title={p.isPrimary ? "Photo principale" : "Définir comme principale"}>
                    <Star className={p.isPrimary ? "h-4 w-4 fill-gold" : "h-4 w-4"} aria-hidden />
                  </button>
                  <button type="button" disabled={pending} onClick={() => confirm("Supprimer cette photo ?") && start(() => deletePhotoAction(p.id))} className="rounded-full p-1.5 text-gray-500 hover:text-red-700" aria-label="Supprimer la photo">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form action={action} className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-cream/50 p-4 sm:flex-row sm:items-center">
        <label htmlFor="photo" className="sr-only">
          Choisir une photo
        </label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="flex-1 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary" />
        <SubmitButton size="sm" pendingText="Envoi…">
          Ajouter la photo
        </SubmitButton>
      </form>
      <p className="text-xs text-gray-500">JPEG, PNG ou WebP, 5 Mo max. Photos pudiques uniquement, validées par la modération. Les métadonnées (dont la localisation GPS) sont automatiquement supprimées.</p>
    </div>
  );
}
