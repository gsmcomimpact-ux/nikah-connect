import {
  BadgeCheck,
  Bell,
  HeartHandshake,
  Home,
  Lock,
  MessagesSquare,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Star,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  bell: Bell,
  "heart-handshake": HeartHandshake,
  home: Home,
  lock: Lock,
  messages: MessagesSquare,
  scale: Scale,
  search: Search,
  settings: Settings,
  "shield-alert": ShieldAlert,
  sparkles: Sparkles,
  star: Star,
  user: User,
  users: Users,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} aria-hidden />;
}
