/** Injection de données structurées schema.org (JSON-LD). Le contenu est sérialisé et les « < » échappés. */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
