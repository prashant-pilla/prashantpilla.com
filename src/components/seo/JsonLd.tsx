/**
 * Renders a schema.org JSON-LD document. `<` is escaped so a value can
 * never close the script tag; JSON.stringify handles the rest.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
