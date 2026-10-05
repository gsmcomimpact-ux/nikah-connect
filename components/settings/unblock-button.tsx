"use client";

import { useTransition } from "react";
import { unblockUserAction } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";

export function UnblockButton({ targetId }: { targetId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => void (await unblockUserAction(targetId)))}>
      Débloquer
    </Button>
  );
}
