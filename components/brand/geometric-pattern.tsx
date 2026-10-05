import { cn } from "@/lib/utils";

/** Motif géométrique islamique (étoile à huit branches) très discret, en arrière-plan. */
export function GeometricPattern({ className, opacity = 0.06, color = "currentColor" }: { className?: string; opacity?: number; color?: string }) {
  const id = "nc-geo";
  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} style={{ opacity }}>
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1">
            <path d="M28 4 L34 22 L52 28 L34 34 L28 52 L22 34 L4 28 L22 22 Z" />
            <rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" />
            <rect x="16" y="16" width="24" height="24" />
            <circle cx="28" cy="28" r="4" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
