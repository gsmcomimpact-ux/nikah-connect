"use client";

import { useRef, useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { reportAction } from "@/lib/actions/social";
import { reportReasonOptions } from "@/lib/constants/options";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export function ReportDialog({ reportedUserId, messageId, triggerLabel = "Signaler", small = false }: { reportedUserId: string; messageId?: string; triggerLabel?: string; small?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(fd: FormData) {
    start(async () => {
      const res = await reportAction({
        reportedUserId,
        messageId,
        reason: String(fd.get("reason") ?? ""),
        details: String(fd.get("details") ?? ""),
        alsoBlock: fd.get("alsoBlock") === "on",
      });
      setResult(res.ok ? { ok: true, text: res.message ?? "" } : { ok: false, text: res.error });
    });
  }

  return (
    <>
      {small ? (
        <button type="button" onClick={() => ref.current?.showModal()} className="text-xs text-gray-400 hover:text-red-700" aria-label="Signaler ce message">
          <Flag className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : (
        <Button type="button" size="sm" variant="ghost" className="text-red-800 hover:bg-red-50" onClick={() => ref.current?.showModal()}>
          <Flag className="h-4 w-4" aria-hidden /> {triggerLabel}
        </Button>
      )}
      <dialog ref={ref} className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl p-0 backdrop:bg-ink/50" onClose={() => setResult(null)}>
        <div className="p-6">
          <h2 className="font-display text-xl font-semibold text-primary">{messageId ? "Signaler ce message" : "Signaler ce profil"}</h2>
          <p className="mt-1 text-sm text-gray-600">Votre signalement est confidentiel : la personne concernée ne saura pas qui l'a signalée.</p>
          {result?.ok ? (
            <div className="mt-5 space-y-4">
              <Alert tone="success">{result.text}</Alert>
              <div className="text-right">
                <Button size="sm" onClick={() => ref.current?.close()}>
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            <form action={submit} className="mt-5 space-y-4">
              {result && <Alert tone="danger">{result.text}</Alert>}
              <Field label="Motif" htmlFor="reason">
                <Select id="reason" name="reason" required placeholder="Choisir un motif…" options={reportReasonOptions} />
              </Field>
              <Field label="Précisions" htmlFor="details" optional>
                <Textarea id="details" name="details" maxLength={1000} className="min-h-20" />
              </Field>
              <Checkbox name="alsoBlock" label="Bloquer également ce membre" />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => ref.current?.close()}>
                  Annuler
                </Button>
                <Button type="submit" variant="danger" size="sm" disabled={pending}>
                  {pending ? "Envoi…" : "Envoyer le signalement"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
