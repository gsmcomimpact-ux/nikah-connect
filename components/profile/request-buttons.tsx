"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { respondToRequestAction, withdrawRequestAction } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";

export function RespondButtons({ likeId }: { likeId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const respond = (accept: boolean) =>
    start(async () => {
      const res = await respondToRequestAction(likeId, accept);
      if (res.ok && res.conversationId) router.push(`/espace/messages/${res.conversationId}`);
      else {
        setMsg(res.ok ? (res.message ?? null) : res.error);
        router.refresh();
      }
    });
  return (
    <div className="flex w-full flex-wrap gap-2">
      <Button size="sm" className="flex-1" disabled={pending} onClick={() => respond(true)}>
        Accepter
      </Button>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => respond(false)}>
        Décliner
      </Button>
      {msg && <p className="w-full text-xs text-gray-600">{msg}</p>}
    </div>
  );
}

export function WithdrawButton({ likeId }: { likeId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await withdrawRequestAction(likeId);
          router.refresh();
        })
      }
    >
      Retirer ma demande
    </Button>
  );
}
