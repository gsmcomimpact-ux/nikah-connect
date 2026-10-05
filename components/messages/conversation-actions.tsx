"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2, XCircle } from "lucide-react";
import { deleteConversationAction } from "@/lib/actions/messages";
import { endMatchAction } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";

export function ConversationActions({ conversationId, otherUserId, active }: { conversationId: string; otherUserId: string | null; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-1">
      {active && otherUserId && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!confirm("Clôturer cet échange ? La conversation passera en lecture seule pour vous deux.")) return;
            start(async () => {
              await endMatchAction(otherUserId);
              router.refresh();
            });
          }}
        >
          <XCircle className="h-4 w-4" aria-hidden /> Clôturer
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          if (!confirm("Supprimer cette conversation de votre liste ? L'historique ne sera plus visible pour vous.")) return;
          start(async () => {
            await deleteConversationAction(conversationId);
            router.push("/espace/messages");
          });
        }}
      >
        <Trash2 className="h-4 w-4" aria-hidden /> Supprimer
      </Button>
    </div>
  );
}
