/**
 * Illustration abstraite et pudique : deux arches qui se rejoignent sous une
 * même étoile — symbole de deux chemins qui s'unissent. Aucune représentation
 * réaliste de personnes.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 420" role="img" aria-label="Deux arches stylisées réunies sous une étoile, symbole d'union" className={className}>
      <defs>
        <linearGradient id="hi-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand-primary-light)" />
          <stop offset="1" stopColor="var(--brand-primary)" />
        </linearGradient>
        <linearGradient id="hi-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecd27a" />
          <stop offset="1" stopColor="var(--brand-gold)" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="210" r="196" fill="var(--brand-muted)" />
      <circle cx="210" cy="210" r="196" fill="none" stroke="var(--brand-gold)" strokeOpacity=".35" strokeDasharray="2 8" />
      {/* Arche gauche */}
      <path d="M92 350V200a62 62 0 0 1 124 0v150z" fill="url(#hi-a)" opacity=".92" />
      {/* Arche droite */}
      <path d="M204 350V200a62 62 0 0 1 124 0v150z" fill="url(#hi-a)" opacity=".75" />
      {/* Intersection dorée */}
      <path d="M204 350V200a62 62 0 0 1 12-36.6A62 62 0 0 1 216 200v150z" fill="url(#hi-g)" opacity=".9" />
      {/* Deux silhouettes très stylisées (formes de gouttes) */}
      <ellipse cx="150" cy="232" rx="16" ry="20" fill="var(--brand-cream)" opacity=".85" />
      <path d="M118 350c0-46 14-80 32-80s32 34 32 80z" fill="var(--brand-cream)" opacity=".85" />
      <ellipse cx="270" cy="232" rx="16" ry="20" fill="var(--brand-cream)" opacity=".85" />
      <path d="M232 350c2-48 18-82 38-82s36 34 38 82z" fill="var(--brand-cream)" opacity=".85" />
      {/* Étoile à huit branches */}
      <g transform="translate(210 92)">
        <path d="M0-30L8.5-8.5 30 0 8.5 8.5 0 30-8.5 8.5-30 0-8.5-8.5z" fill="url(#hi-g)" />
        <rect x="-15" y="-15" width="30" height="30" transform="rotate(45)" fill="none" stroke="var(--brand-gold)" strokeWidth="2" />
      </g>
      <path d="M70 350h280" stroke="var(--brand-primary)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
