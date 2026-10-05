"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, SendHorizontal, ShieldAlert, Users } from "lucide-react";
import { sendAttachmentAction, sendMessageAction, shareTrustedContactAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ReportDialog } from "@/components/profile/report-dialog";
import { cn } from "@/lib/utils";

export type ChatMessage = { id: string; senderId: string | null; body: string; createdAt: string; hidden: boolean; attachments: string[] };

const POLL_MS = 5000;

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUserId,
  otherName,
  initialMessages,
  initialCanWrite,
  canAttach,
  hasTrustedContact,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserId: string | null;
  otherName: string;
  initialMessages: ChatMessage[];
  initialCanWrite: boolean;
  canAttach: boolean;
  hasTrustedContact: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [canWrite, setCanWrite] = useState(initialCanWrite);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmContact, setConfirmContact] = useState(false);
  const [pending, start] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lastDate = messages.at(-1)?.createdAt;

  const refresh = useCallback(async () => {
    try {
      const url = `/api/messages/${conversationId}${lastDate ? `?after=${encodeURIComponent(lastDate)}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ChatMessage[]; canWrite: boolean };
      setCanWrite(data.canWrite);
      if (data.messages.length)
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          return [...prev, ...data.messages.filter((m) => !ids.has(m.id))];
        });
    } catch {
      /* hors ligne */
    }
  }, [conversationId, lastDate]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function send(force = false) {
    if (!text.trim()) return;
    start(async () => {
      const res = await sendMessageAction(conversationId, text, force || confirmContact);
      if (res.ok) {
        setText("");
        setError(null);
        setConfirmContact(false);
        setWarning(res.warning ?? null);
        await refresh();
      } else if (res.needsConfirmation) {
        setConfirmContact(true);
        setError(res.error);
      } else setError(res.error);
    });
  }

  function sendImage(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const res = await sendAttachmentAction(conversationId, fd);
      if (res.ok) await refresh();
      else setError(res.error);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function shareWali() {
    if (!confirm("Partager les coordonnées de votre personne de confiance dans cette conversation ?")) return;
    start(async () => {
      const res = await shareTrustedContactAction(conversationId);
      if (res.ok) await refresh();
      else setError(res.error);
    });
  }

  const time = (iso: string) => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(iso));

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[28rem] flex-col rounded-2xl border border-gray-200 bg-white lg:h-[calc(100dvh-10rem)]">
      <div className="flex items-center gap-2 border-b border-gold/30 bg-gold/10 px-4 py-2 text-xs text-ink/80">
        <ShieldAlert className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        Ne transférez jamais d'argent et ne communiquez jamais vos informations bancaires. Signalez tout comportement suspect.
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label={`Conversation avec ${otherName}`}>
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          if (m.senderId === null)
            return (
              <p key={m.id} className="mx-auto max-w-md rounded-xl bg-muted px-4 py-2 text-center text-xs text-gray-600">
                {m.body}
              </p>
            );
          return (
            <div key={m.id} className={cn("group flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] sm:max-w-[70%]", mine ? "rounded-br-sm bg-primary text-cream" : "rounded-bl-sm bg-muted text-ink")}>
                {m.hidden && <p className="mb-1 text-xs italic opacity-80">Message masqué par la modération (visible par vous seul·e).</p>}
                {m.attachments.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="Image partagée" className="mb-2 max-h-64 rounded-lg" loading="lazy" />
                ))}
                {m.body && <p className="whitespace-pre-line break-words">{m.body}</p>}
                <div className={cn("mt-1 flex items-center justify-end gap-2 text-[11px]", mine ? "text-cream/60" : "text-gray-400")}>
                  {time(m.createdAt)}
                  {!mine && otherUserId && <ReportDialog reportedUserId={otherUserId} messageId={m.id} small />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {canWrite ? (
        <form
          className="space-y-2 border-t border-gray-200 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {error && (
            <Alert tone={confirmContact ? "warning" : "danger"}>
              {error}
              {confirmContact && (
                <div className="mt-2 flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => send(true)} disabled={pending}>
                    Envoyer quand même
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setConfirmContact(false); setError(null); }}>
                    Modifier
                  </Button>
                </div>
              )}
            </Alert>
          )}
          {warning && <Alert tone="warning">{warning}</Alert>}
          <div className="flex items-end gap-2">
            {canAttach && (
              <>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && sendImage(e.target.files[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-primary/5 hover:text-primary" aria-label="Partager une image">
                  <ImagePlus className="h-5 w-5" aria-hidden />
                </button>
              </>
            )}
            {hasTrustedContact && (
              <button type="button" onClick={shareWali} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-primary/5 hover:text-primary" aria-label="Partager les coordonnées de ma personne de confiance" title="Impliquer ma personne de confiance">
                <Users className="h-5 w-5" aria-hidden />
              </button>
            )}
            <label htmlFor="chat-input" className="sr-only">
              Votre message
            </label>
            <textarea
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Écrivez un message respectueux…"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5 text-[15px] focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
            />
            <Button type="submit" className="h-11 w-11 shrink-0 px-0" disabled={pending || !text.trim()} aria-label="Envoyer">
              <SendHorizontal className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </form>
      ) : (
        <p className="border-t border-gray-200 p-4 text-center text-sm text-gray-500">Cette conversation est fermée. Vous pouvez toujours consulter l'historique.</p>
      )}
    </div>
  );
}
