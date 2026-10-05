"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { HeartHandshake, MessageCircle, Star, X } from "lucide-react";
import { passAction, sendInterestAction, toggleFavoriteAction } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Status = "none" | "sent" | "matched" | "received";

/** Actions sobres sur un profil : « Intéressé(e) », « Passer », demande avec message, favori. */
export function ProfileActions({ targetId, initialStatus = "none", initialFavorite = false, compact = false, conversationId }: { targetId: string; initialStatus?: Status; initialFavorite?: boolean; compact?: boolean; conversationId?: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [hidden, setHidden] = useState(false);
  const [pending, start] = useTransition();

  const interest = () =>
    start(async () => {
      const res = await sendInterestAction(targetId, note || undefined);
      if (res.ok) {
        setStatus(res.matched ? "matched" : "sent");
        setShowNote(false);
        setFeedback({ ok: true, text: res.message ?? "Demande envoyée." });
        if (res.matched && res.conversationId) router.push(`/espace/messages/${res.conversationId}`);
        else if (!compact) router.refresh();
      } else setFeedback({ ok: false, text: res.error });
    });

  const pass = () =>
    start(async () => {
      const res = await passAction(targetId);
      if (res.ok) {
        if (compact) setHidden(true);
        setFeedback({ ok: true, text: res.message ?? "" });
      } else setFeedback({ ok: false, text: res.error });
    });

  const fav = () =>
    start(async () => {
      const res = await toggleFavoriteAction(targetId);
      if (res.ok) setFavorite((f) => !f);
      setFeedback({ ok: res.ok, text: res.ok ? (res.message ?? "") : res.error });
    });

  if (hidden) return <p className="w-full text-center text-xs text-gray-500">Profil passé.</p>;

  if (status === "matched")
    return (
      <Button size="sm" className="flex-1" onClick={() => router.push(conversationId ? `/espace/messages/${conversationId}` : "/espace/messages")}>
        <MessageCircle className="h-4 w-4" aria-hidden /> Échanger
      </Button>
    );

  return (
    <div className={cn("w-full space-y-2", compact && "contents")}>
      <div className={cn("flex flex-wrap gap-2", compact ? "flex-1" : "")}>
        {status === "sent" ? (
          <span className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-primary/10 px-4 text-sm font-medium text-primary">Demande envoyée</span>
        ) : (
          <Button size="sm" className="flex-1" onClick={() => (compact ? interest() : setShowNote((s) => !s))} disabled={pending}>
            <HeartHandshake className="h-4 w-4" aria-hidden /> {status === "received" ? "Accepter (intéressé·e)" : compact ? "Intéressé(e)" : "Envoyer une demande"}
          </Button>
        )}
        {!compact && (
          <>
            {status === "none" && (
              <Button size="sm" variant="secondary" onClick={pass} disabled={pending}>
                <X className="h-4 w-4" aria-hidden /> Passer
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={fav} disabled={pending} aria-pressed={favorite}>
              <Star className={cn("h-4 w-4", favorite && "fill-gold text-gold")} aria-hidden /> {favorite ? "En favori" : "Favori"}
            </Button>
          </>
        )}
        {compact && status === "none" && (
          <Button size="sm" variant="secondary" onClick={pass} disabled={pending} aria-label="Passer ce profil">
            Passer
          </Button>
        )}
      </div>
      {showNote && !compact && (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-cream/60 p-3">
          <label htmlFor={`note-${targetId}`} className="text-sm font-medium">
            Un mot pour accompagner votre demande <span className="font-normal text-gray-500">(facultatif)</span>
          </label>
          <Textarea id={`note-${targetId}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="min-h-20" placeholder="Présentez-vous en quelques mots, avec respect. Pas de coordonnées." />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowNote(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={interest} disabled={pending}>
              {pending ? "Envoi…" : "Envoyer la demande"}
            </Button>
          </div>
        </div>
      )}
      {feedback && (
        <p role="status" className={cn("w-full text-xs", feedback.ok ? "text-primary" : "text-red-700")}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}
