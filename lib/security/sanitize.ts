/**
 * Normalisation des textes saisis par les utilisateurs.
 * L'échappement HTML est assuré par React à l'affichage (protection XSS) ;
 * ici on retire les caractères de contrôle et les espaces superflus.
 */
export function cleanText(input: string, maxLength = 5000): string {
  return input
    .normalize("NFC")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

export function cleanLine(input: string, maxLength = 200): string {
  return cleanText(input, maxLength).replace(/\s+/g, " ");
}

/** Valide qu'une redirection interne reste sur le site (anti open-redirect). */
export function safeRedirectPath(path: string | null | undefined, fallback = "/espace"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}
