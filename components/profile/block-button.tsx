"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Ban } from "lucide-react";
import { blockUserAction } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";

export function BlockButton({ targetId, name }: { targetId: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Bloquer ${name} ? Vous ne verrez plus ce profil et il ne pourra plus vous contacter.`)) return;
        start(async () => {
          const res = await blockUserAction(targetId);
          if (res.ok) router.push("/espace");
          else alert(res.error);
        });
      }}
    >
      <Ban className="h-4 w-4" aria-hidden /> Bloquer
    </Button>
  );
}
