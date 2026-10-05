import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { label: string; tone: "green" | "gold" | "gray" | "red" | "blue" }> = {
  ACTIVE: { label: "Actif", tone: "green" },
  SUSPENDED: { label: "Suspendu", tone: "gold" },
  BANNED: { label: "Banni", tone: "red" },
  DELETED: { label: "Supprimé", tone: "gray" },
  OPEN: { label: "Ouvert", tone: "red" },
  IN_REVIEW: { label: "En cours", tone: "gold" },
  RESOLVED: { label: "Traité", tone: "green" },
  DISMISSED: { label: "Classé", tone: "gray" },
  PENDING: { label: "En attente", tone: "gold" },
  APPROVED: { label: "Approuvé", tone: "green" },
  REJECTED: { label: "Refusé", tone: "red" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { label: status, tone: "gray" as const };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
