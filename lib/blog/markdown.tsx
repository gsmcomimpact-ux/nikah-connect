import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Rendu Markdown minimal et sûr : aucun HTML brut n'est interprété,
 * tout le texte passe par React (échappement automatique, protection XSS).
 * Pris en charge : ## / ###, paragraphes, listes (- et 1.), > citation, **gras**, *italique*, [lien](url).
 */
function safeHref(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const u = new URL(href);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;
    if (m[2]) nodes.push(<strong key={key}>{m[2]}</strong>);
    else if (m[3]) nodes.push(<em key={key}>{m[3]}</em>);
    else if (m[4] && m[5]) {
      const href = safeHref(m[5]);
      if (!href) nodes.push(m[4]);
      else if (href.startsWith("/")) nodes.push(<Link key={key} href={href}>{m[4]}</Link>);
      else nodes.push(<a key={key} href={href} rel="noopener noreferrer nofollow" target="_blank">{m[4]}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n?/g, "\n").split(/\n{2,}/);
  return (
    <div className="prose-article">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        const first = lines[0] ?? "";
        const key = `b${bi}`;
        if (first.startsWith("### ")) return <h3 key={key}>{inline(first.slice(4), key)}</h3>;
        if (first.startsWith("## ")) return <h2 key={key}>{inline(first.slice(3), key)}</h2>;
        if (lines.every((l) => /^[-*] /.test(l))) return <ul key={key}>{lines.map((l, i) => <li key={i}>{inline(l.slice(2), `${key}-${i}`)}</li>)}</ul>;
        if (lines.every((l) => /^\d+\. /.test(l))) return <ol key={key}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\d+\. /, ""), `${key}-${i}`)}</li>)}</ol>;
        if (lines.every((l) => l.startsWith("> "))) return <blockquote key={key}>{inline(lines.map((l) => l.slice(2)).join(" "), key)}</blockquote>;
        return <p key={key}>{inline(lines.join(" "), key)}</p>;
      })}
    </div>
  );
}
